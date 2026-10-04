import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { test } from "node:test";
import { validateOutcomeManifest } from "../src/outcome-format.mjs";
import { manifest, recipe } from "./recipe-fixture.mjs";

const execute = promisify(execFile);
const cli = resolve(dirname(fileURLToPath(import.meta.url)), "../src/index.mjs");

test("optional recipes preserve legacy and current manifests without changing provenance", () => {
  const { primary: _primary, ...legacy } = manifest;
  for (const original of [manifest, { ...legacy, schemaVersion: 3, products: ["example/film-maker"] }]) {
    const snapshot = structuredClone(original);
    assert.deepEqual(validateOutcomeManifest(original), snapshot);
    assert.equal(Object.hasOwn(original, "recipe"), false);
    const withRecipe = { ...original, recipe: structuredClone(recipe) };
    assert.deepEqual(validateOutcomeManifest(withRecipe), { ...snapshot, recipe });
    assert.deepEqual(withRecipe.models, snapshot.models);
  }
  for (const ingredient of Object.keys(recipe)) {
    assert.doesNotThrow(() => validateOutcomeManifest({ ...manifest, recipe: { [ingredient]: recipe[ingredient] } }));
  }
});

test("recipes reject moving skill pins, unsafe paths, malformed URLs and empty disclosures", () => {
  const invalid = [
    {}, null, [], { unknown: "value" },
    ...["skills", "references", "tools", "steps"].map(key => ({ [key]: [] })),
    ...["main", "latest", "v1.0.0", "abc123", "a".repeat(39), "g".repeat(40)].map(lastReviewedCommit => ({ skills: [{ ...recipe.skills[0], lastReviewedCommit }] })),
    ...["../secret", "/skills/film", "skills/../film"].map(directory => ({ skills: [{ ...recipe.skills[0], directory }] })),
    { skills: [{ ...recipe.skills[0], repository: "https://github.com/example/skills" }] },
    { skills: [recipe.skills[0], recipe.skills[0]] },
    { agent: { name: " " } }, { agent: { name: "Codex", version: "" } },
    { tools: [{ name: "Renderer", purpose: " " }] },
    { steps: [{ title: "Build", instructions: "" }] },
    { steps: [{ title: " ", instructions: "Build" }] },
    { steps: [{ title: "Build", instructions: "Build", prompt: " " }] },
    { references: [{ kind: "document", label: "", url: "https://example.com" }] },
    { references: [{ kind: "unknown", label: "Brief", url: "https://example.com" }] },
    { references: [{ kind: "document", label: "Brief", url: "https://example.com", purpose: "" }] },
  ];
  for (const url of ["http://example.com", "file:///tmp/brief", "javascript:alert(1)", "not-a-url", ""]) {
    invalid.push({ agent: { name: "Codex", url } });
    invalid.push({ tools: [{ name: "Renderer", purpose: "Render", url }] });
    invalid.push({ references: [{ kind: "web", label: "Brief", url }] });
  }
  for (const candidate of invalid) {
    assert.throws(() => validateOutcomeManifest({ ...manifest, recipe: candidate }), /recipe/, JSON.stringify(candidate));
  }
});

test("CLI fetch and use print the recipe by default, the prompt with --prompt, and unchanged JSON", async () => {
  const directory = await mkdtemp(join(tmpdir(), "possible-recipe-cli-"));
  const prompt = "Build the film.\n\nKeep the exact wording and spacing.";
  const id = "11111111-1111-4111-8111-111111111111";
  const revision = "c".repeat(40);
  // Exercise the real executable with deterministic public-source responses; no
  // remote publisher, registry mutation, paid service or account is involved.
  const writeFixture = async (name, fixtureManifest, outcome) => {
    const fixture = join(directory, name);
    await writeFile(fixture, `
const manifest = ${JSON.stringify(fixtureManifest)};
const prompt = ${JSON.stringify(prompt)};
const response = body => new Response(typeof body === "string" ? body : JSON.stringify(body));
globalThis.fetch = async (url) => {
  const value = String(url);
  if (value.startsWith("https://directory.example/")) return response(value.endsWith("/use") ? { counted: true } : { outcome: ${JSON.stringify(outcome)} });
  if (value === "https://api.github.com/repos/example/outcomes") return response({ private: false, default_branch: "main" });
  if (value === "https://api.github.com/repos/example/outcomes/commits/main") return response({ sha: "${revision}" });
  if (value.endsWith("/outcomes.json")) return response({ schemaVersion: 1, publisher: { name: "Example Studio" }, outcomes: [{ slug: "quiet-launch-film", url: "./outcomes/quiet-launch-film/outcome.json" }] });
  if (value.endsWith("/outcome.json")) return response(manifest);
  if (value.endsWith("/outcome.md")) return response("# Quiet launch film\\n\\nA restrained film.\\n");
  if (value.endsWith("/prompt.md")) return response(prompt + "\\n");
  throw new Error("Unexpected fixture request: " + value);
};
`);
    return fixture;
  };
  const fixtureManifest = { ...manifest, recipe };
  const withRecipe = await writeFixture("recipe-fixture.mjs", fixtureManifest, { id, title: "Quiet launch film", prompt, manifest: fixtureManifest, recipe, models: manifest.models, requirements: [], inputs: [], source_url: "https://github.com/example/outcomes" });
  const promptOnly = await writeFixture("prompt-fixture.mjs", manifest, { id, title: "Quiet launch film", prompt, manifest, recipe: null, models: manifest.models, requirements: [], inputs: [], source_url: "https://github.com/example/outcomes" });
  try {
    const env = { ...process.env, POSSIBLE_HOME: directory, POSSIBLE_DIRECTORY_ENDPOINT: "https://directory.example/outcomes", POSSIBLE_TELEMETRY: "0" };
    const run = (fixture, ...args) => execute(process.execPath, ["--import", fixture, cli, ...args], { cwd: directory, env });
    for (const [command, reference] of [["fetch", id], ["use", "example/outcomes@quiet-launch-film"]]) {
      const kit = (await run(withRecipe, command, reference)).stdout;
      assert.match(kit, /^Quiet launch film\nSource: https:\/\/github\.com\/example\/outcomes\n\nPublished recipe — How it was made\n/);
      assert.match(kit, /Model: Recorded model · OpenAI · execution/);
      assert.match(kit, /Agent: Codex \(recorded-version\)/);
      assert.match(kit, /Skill: example\/skills\/skills\/film\nPinned commit: a{40}/);
      assert.match(kit, /Reference \(document\): Creative brief — https:\/\/example\.com\/brief/);
      assert.match(kit, /Tool\/API: Renderer/);
      assert.match(kit, /Ordered steps\n1\. Build\nBuild the scene from the brief\.\nStep prompt:\nKeep the orange accent\.\nPreserve space for the title\.\n2\. Review/);
      assert.ok(kit.endsWith(`\nExact published prompt\n${prompt}\n`));
      assert.equal((await run(withRecipe, command, reference, "--prompt")).stdout, `${prompt}\n`);
      assert.equal((await run(promptOnly, command, reference)).stdout, `${prompt}\n`);
      assert.equal((await run(promptOnly, command, reference, "--prompt")).stdout, `${prompt}\n`);
      const data = JSON.parse((await run(withRecipe, command, reference, "--json")).stdout);
      assert.equal(data.prompt, prompt);
      assert.deepEqual(data.manifest.recipe, recipe);
      assert.deepEqual(data.manifest.models, manifest.models);
      assert.deepEqual(data.manifest.recipe.steps.map(step => step.title), ["Build", "Review"]);
      await assert.rejects(run(withRecipe, command, reference, "--prompt", "--json"), (error) => error.code === 1 && /Unknown command/.test(error.stderr));
      await assert.rejects(run(withRecipe, command, reference, "--recipe"), (error) => error.code === 1 && /Unknown command/.test(error.stderr));
    }
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("fetch records a use whichever output is printed", async () => {
  const directory = await mkdtemp(join(tmpdir(), "possible-recipe-use-"));
  const id = "22222222-2222-4222-8222-222222222222";
  const fixture = join(directory, "use-fixture.mjs");
  await writeFile(fixture, `
import { appendFileSync } from "node:fs";
globalThis.fetch = async (url, init) => {
  const value = String(url);
  if (value.endsWith("/use")) { appendFileSync(${JSON.stringify(join(directory, "uses.log"))}, JSON.parse(init.body).outcomeId + "\\n"); return new Response("{}"); }
  return new Response(JSON.stringify({ outcome: { id: "${id}", title: "Kit", prompt: "Make it.", recipe: ${JSON.stringify(recipe)}, source_url: "https://github.com/example/outcomes" } }));
};
`);
  try {
    const env = { ...process.env, CI: "", POSSIBLE_HOME: directory, POSSIBLE_DIRECTORY_ENDPOINT: "https://directory.example/outcomes", POSSIBLE_TELEMETRY: "" };
    delete env.CI;
    for (const flags of [[], ["--prompt"]]) await execute(process.execPath, ["--import", fixture, cli, "fetch", id, ...flags], { cwd: directory, env });
    assert.equal(await readFile(join(directory, "uses.log"), "utf8"), `${id}\n${id}\n`);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
