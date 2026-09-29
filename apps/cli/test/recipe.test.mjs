import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
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

test("CLI fetch and use JSON retain recipes while plain output remains the exact prompt", async () => {
  const directory = await mkdtemp(join(tmpdir(), "possible-recipe-cli-"));
  const prompt = "Build the film.\n\nKeep the exact wording and spacing.";
  const id = "11111111-1111-4111-8111-111111111111";
  const revision = "c".repeat(40);
  const fixtureManifest = { ...manifest, recipe };
  const outcome = { id, title: "Quiet launch film", prompt, manifest: fixtureManifest, recipe };
  const fixture = join(directory, "fetch-fixture.mjs");
  // Exercise the real executable with deterministic public-source responses; no
  // remote publisher, registry mutation, paid service or account is involved.
  await writeFile(fixture, `
const manifest = ${JSON.stringify(fixtureManifest)};
const prompt = ${JSON.stringify(prompt)};
const response = body => new Response(typeof body === "string" ? body : JSON.stringify(body));
globalThis.fetch = async (url) => {
  const value = String(url);
  if (value.startsWith("https://directory.example/")) return response({ outcome: ${JSON.stringify(outcome)} });
  if (value === "https://api.github.com/repos/example/outcomes") return response({ private: false, default_branch: "main" });
  if (value === "https://api.github.com/repos/example/outcomes/commits/main") return response({ sha: "${revision}" });
  if (value.endsWith("/outcomes.json")) return response({ schemaVersion: 1, publisher: { name: "Example Studio" }, outcomes: [{ slug: "quiet-launch-film", url: "./outcomes/quiet-launch-film/outcome.json" }] });
  if (value.endsWith("/outcome.json")) return response(manifest);
  if (value.endsWith("/outcome.md")) return response("# Quiet launch film\\n\\nA restrained film.\\n");
  if (value.endsWith("/prompt.md")) return response(prompt + "\\n");
  throw new Error("Unexpected fixture request: " + value);
};
`);
  try {
    const env = { ...process.env, POSSIBLE_HOME: directory, POSSIBLE_DIRECTORY_ENDPOINT: "https://directory.example/outcomes" };
    const run = (...args) => execute(process.execPath, ["--import", fixture, cli, ...args], { cwd: directory, env });
    for (const [command, reference] of [["fetch", id], ["use", "example/outcomes@quiet-launch-film"]]) {
      assert.equal((await run(command, reference)).stdout, `${prompt}\n`);
      const data = JSON.parse((await run(command, reference, "--json")).stdout);
      assert.equal(data.prompt, prompt);
      assert.deepEqual(data.manifest.recipe, recipe);
      assert.deepEqual(data.manifest.models, manifest.models);
      assert.deepEqual(data.manifest.recipe.steps.map(step => step.title), ["Build", "Review"]);
    }
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
