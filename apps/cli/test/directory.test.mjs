import assert from "node:assert/strict";
import { test } from "node:test";
import { fetchOutcome, formatSearchResults, searchOutcomes } from "../src/directory.mjs";

const outcome = {
  id: "11111111-1111-4111-8111-111111111111",
  title: "Corridor Cat Shelter",
  summary: "A weighted printable shelter.",
  prompt: "Make the printable shelter.",
  source_locator: "fraylabs/possible-outcomes",
};

const response = (body, status = 200) => async () => new Response(JSON.stringify(body), {
  status,
  headers: { "content-type": "application/json" },
});

test("search returns directory Outcomes and formats agent-readable IDs", async () => {
  const outcomes = await searchOutcomes("cat shelter", { fetchImplementation: response({ outcomes: [outcome] }) });
  assert.deepEqual(outcomes, [outcome]);
  assert.match(formatSearchResults(outcomes), /Corridor Cat Shelter/);
  assert.match(formatSearchResults(outcomes), /11111111-1111-4111-8111-111111111111/);
});

test("fetch preserves the exact published prompt", async () => {
  const fetched = await fetchOutcome(outcome.id, { fetchImplementation: response({ outcome }) });
  assert.equal(fetched.prompt, outcome.prompt);
});

test("directory failures remain explicit", async () => {
  await assert.rejects(
    searchOutcomes("cat shelter", { fetchImplementation: response({ error: "Directory unavailable" }, 503) }),
    /Directory unavailable/,
  );
});
