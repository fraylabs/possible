import { captureReviewDigest } from "../src/capture-integrity.mjs";
import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { publishOutcomeSource } from "../src/outcome-commands.mjs";
import { discoverOutcomeSource, parseOutcomeSource } from "../src/sources.mjs";

const originalFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = originalFetch; });

const revision = "0123456789012345678901234567890123456789";
const manifest = {
  schemaVersion: 3,
  slug: "quiet-launch-film",
  files: { about: "outcome.md", prompt: "prompt.md" },
  authoredAt: "2026-08-23T12:00:00Z",
  author: { name: "Example Studio", url: "https://example.com" },
  models: [{ provider: "OpenAI", model: "GPT-5.6", agent: "Codex", role: "execution" }],
  requirements: ["A public product URL"],
};

function response(body, status = 200) {
  return new Response(typeof body === "string" ? body : JSON.stringify(body), {
    status,
    headers: { "content-type": typeof body === "string" ? "text/plain" : "application/json" },
  });
}

function installGitHubFixture(indexUrl = "./outcomes/quiet-launch-film/outcome.json", outcomeManifest = manifest) {
  globalThis.fetch = async (url) => {
    const value = String(url);
    if (value === "https://api.github.com/repos/example/outcomes") return response({ private: false, default_branch: "main" });
    if (value === "https://api.github.com/repos/example/outcomes/commits/main") return response({ sha: revision });
    if (value === `https://raw.githubusercontent.com/example/outcomes/${revision}/outcomes.json`) return response({ schemaVersion: 1, publisher: { name: "Example Studio" }, outcomes: [{ slug: "quiet-launch-film", url: indexUrl }] });
    if (value.endsWith("/outcome.json")) return response(outcomeManifest);
    if (value.endsWith("/outcome.md")) return response("# Quiet launch film\n\nA restrained launch film for one real product.\n");
    if (value.endsWith("/prompt.md")) return response("Create the launch film from the supplied product source.\n");
    return response({ error: "not found" }, 404);
  };
}

test("GitHub source discovery follows its root index at an exact commit", async () => {
  installGitHubFixture();
  const discovery = await discoverOutcomeSource("example/outcomes");
  assert.deepEqual(parseOutcomeSource("https://github.com/example/outcomes"), {
    type: "github",
    locator: "example/outcomes",
    installUrl: "https://github.com/example/outcomes",
  });
  assert.equal(discovery.revision, revision);
  assert.equal(discovery.publisherName, "Example Studio");
  assert.equal(discovery.outcomes.length, 1);
  assert.equal(discovery.outcomes[0].slug, "quiet-launch-film");
  assert.equal(discovery.outcomes[0].prompt, "Create the launch film from the supplied product source.");
  assert.match(discovery.outcomes[0].contentHash, /^sha256:[0-9a-f]{64}$/);
});

test("GitHub source discovery accepts the primary-attribution contract", async () => {
  installGitHubFixture("./outcomes/quiet-launch-film/outcome.json", {
    ...manifest,
    schemaVersion: 4,
    primary: { kind: "product", id: "example/film-maker" },
    secondary: [{
      kind: "skill",
      repository: "example/skills",
      directory: "skills/film",
      lastReviewedCommit: revision,
    }],
  });
  const discovery = await discoverOutcomeSource("example/outcomes");
  assert.deepEqual(discovery.outcomes[0].manifest.primary, { kind: "product", id: "example/film-maker" });
});

test("GitHub source indexes cannot point outside their pinned repository revision", async () => {
  installGitHubFixture("https://example.com/outcome.json");
  await assert.rejects(discoverOutcomeSource("example/outcomes"), /must stay inside the exact repository revision/);
});

test("publisher domains cannot target local or private network addresses", () => {
  for (const source of ["https://localhost", "https://127.0.0.1", "https://10.0.0.4", "https://[::1]"]) {
    assert.throws(() => parseOutcomeSource(source), /local or private network address/);
  }
});

test("publishing submits only the source and lets the registry fetch canonical files", async () => {
  const requests = [];
  globalThis.fetch = async (url, options) => {
    requests.push({ url: String(url), options });
    return response({ source: { locator: "example/outcomes" }, outcomes: [{ slug: "quiet-launch-film" }] });
  };
  const published = await publishOutcomeSource("example/outcomes", { endpoint: "https://registry.example/sources" });
  assert.equal(published.result.outcomes.length, 1);
  assert.equal(requests.length, 1);
  assert.equal(requests[0].url, "https://registry.example/sources");
  assert.deepEqual(JSON.parse(requests[0].options.body), { source: "example/outcomes" });
});


test("remote recorded recipes require a matching review receipt; old recipes remain valid", async () => {
  const candidate = { ...manifest, recipe: { provenance: { method: "recorded", source: "codex", reviewedAt: "2026-09-30T00:00:00Z", reviewDigest: "0".repeat(64) } } };
  const about = "# Quiet launch film\n\nA restrained launch film for one real product.\n";
  const prompt = "Create the launch film from the supplied product source.\n";
  candidate.recipe.provenance.reviewDigest = captureReviewDigest(candidate, about, prompt);
  installGitHubFixture(undefined, candidate);
  assert.equal((await discoverOutcomeSource("example/outcomes")).outcomes[0].manifest.recipe.provenance.method, "recorded");
  candidate.author = { ...candidate.author, name: "Changed after review" };
  await assert.rejects(discoverOutcomeSource("example/outcomes"), /changed after privacy review/);
  delete candidate.recipe.provenance.reviewDigest;
  await assert.rejects(discoverOutcomeSource("example/outcomes"), /privacy review digest/);
  installGitHubFixture(undefined, { ...manifest, recipe: { provenance: { method: "reconstructed" } } });
  assert.equal((await discoverOutcomeSource("example/outcomes")).outcomes.length, 1);
});
