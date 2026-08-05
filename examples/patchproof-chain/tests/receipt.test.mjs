import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  EVIDENCE_STATUSES,
  buildReceipt,
  generateJsonReceipt,
  generateMarkdownReceipt,
  normalizeDraft,
  parseImportedDraft,
  validateDraft,
} from "../src/lib/receipt.js";

const fixtureNames = [
  "01-passing-evidence.json",
  "02-hidden-nonzero-exit.json",
  "03-skipped-checks.json",
  "04-tests-without-command.json",
  "05-claimed-file-absent.json",
  "06-ui-without-visual-evidence.json",
  "07-stale-log.json",
  "08-unrelated-changes.json",
  "09-binary-files.json",
  "10-empty-diff.json",
  "11-malformed-import.json",
  "12-explicit-limitations.json",
];

const fixtures = await Promise.all(
  fixtureNames.map(async (name) =>
    JSON.parse(await readFile(new URL(`../fixtures/${name}`, import.meta.url), "utf8")),
  ),
);

test("the fixture suite covers all twelve inherited evidence boundaries", () => {
  assert.equal(fixtures.length, 12);
  assert.deepEqual(
    fixtures.map((fixture) => fixture.id),
    [
      "passing-evidence",
      "hidden-nonzero-exit",
      "skipped-checks",
      "tests-without-command",
      "claimed-file-absent",
      "ui-without-visual-evidence",
      "stale-log",
      "unrelated-changes",
      "binary-files",
      "empty-diff",
      "malformed-import",
      "explicit-limitations",
    ],
  );
});

for (const fixture of fixtures) {
  test(`${fixture.id}: derives the complete expected receipt contract`, () => {
    const receipt = buildReceipt(fixture.draft);
    assert.deepEqual(
      Object.fromEntries(receipt.claims.map((claim) => [claim.id, claim.status])),
      fixture.expectedClaimStatuses,
    );
    assert.deepEqual(
      {
        changedFiles: receipt.evidence.changedFiles.map(({ path, change, status }) => ({ path, change, status })),
        checks: receipt.evidence.checks.map(({ command, exitCode, status }) => ({ command, exitCode, status })),
        artifacts: receipt.evidence.artifacts.map(({ id, type, status }) => ({ id, type, status })),
      },
      fixture.expectedEvidence,
    );
    assert.deepEqual(receipt.warnings, fixture.expectedWarnings);
    assert.deepEqual(receipt.limitations, fixture.expectedLimitations);
  });

  test(`${fixture.id}: normalized JSON is byte-stable across generation and reload`, () => {
    const first = generateJsonReceipt(fixture.draft);
    const imported = parseImportedDraft(first);
    const second = generateJsonReceipt(imported);
    assert.equal(first, second);
    assert.equal(first.at(-1), "\n");
  });
}

test("all five evidence states survive as distinct claim outcomes", () => {
  const statuses = new Set(
    fixtures.flatMap((fixture) => buildReceipt(fixture.draft).claims.map((claim) => claim.status)),
  );
  assert.deepEqual([...statuses].sort(), [...EVIDENCE_STATUSES].sort());
});

test("no claim lacking required supplied evidence is passed", () => {
  for (const id of [
    "tests-without-command",
    "claimed-file-absent",
    "ui-without-visual-evidence",
    "empty-diff",
  ]) {
    const receipt = buildReceipt(fixtures.find((fixture) => fixture.id === id).draft);
    assert.ok(receipt.claims.every((claim) => claim.status === "unsupported"), id);
  }
});

test("a nonzero exit outranks later success language", () => {
  const receipt = buildReceipt(fixtures.find((fixture) => fixture.id === "hidden-nonzero-exit").draft);
  assert.equal(receipt.evidence.checks[0].exitCode, 1);
  assert.equal(receipt.evidence.checks[0].status, "failed");
  assert.equal(receipt.claims[0].status, "failed");
});

test("a nonzero failure count conflicts with exit zero and remains unknown", () => {
  const draft = {
    ...fixtures[0].draft,
    checkLog: "$ npm test\n1 failing\nexit code: 0",
  };
  const receipt = buildReceipt(draft);
  assert.equal(receipt.evidence.checks[0].exitCode, 0);
  assert.equal(receipt.evidence.checks[0].status, "unknown");
  assert.equal(receipt.claims.find((claim) => claim.id === "tests-pass").status, "unknown");
});

test("malformed import is rejected before a replacement draft is returned", () => {
  const fixture = fixtures.find((item) => item.id === "malformed-import");
  const before = generateJsonReceipt(fixture.draft);
  assert.throws(
    () => parseImportedDraft(fixture.importText),
    /Malformed JSON.*current draft was not changed/i,
  );
  assert.equal(generateJsonReceipt(fixture.draft), before);
});

test("unknown fields and unsupported status values are rejected on import", () => {
  const original = fixtures[0].draft;
  assert.throws(
    () => parseImportedDraft(JSON.stringify({ ...original, surprise: true })),
    /surprise is not supported/i,
  );
  assert.throws(
    () => parseImportedDraft(JSON.stringify({
      ...original,
      artifacts: [{
        id: "visual-proof",
        label: "Screenshot",
        type: "visual",
        reference: "screen.png",
        status: "verified",
        note: "",
      }],
    })),
    /status is unsupported/i,
  );
});

test("receipt import ignores derived claims and recalculates from the embedded draft", () => {
  const receipt = JSON.parse(generateJsonReceipt(fixtures[0].draft));
  receipt.claims[0].status = "failed";
  receipt.summary.passed = 999;
  const imported = parseImportedDraft(JSON.stringify(receipt));
  assert.equal(buildReceipt(imported).claims[0].status, "passed");
  assert.equal(buildReceipt(imported).summary.passed, 2);
});

test("Markdown keeps all five status counters and the claims boundary", () => {
  const markdown = generateMarkdownReceipt(fixtures[0].draft);
  for (const status of EVIDENCE_STATUSES) assert.match(markdown, new RegExp(`- ${status}: \\d+`));
  assert.match(markdown, /Claim-to-evidence ledger/);
  assert.match(markdown, /does not prove semantic code correctness, security, production readiness, demand, or product-market fit/i);
});

test("line endings normalize and generated JSON contains no time or random identity", () => {
  const draft = normalizeDraft({
    ...fixtures[0].draft,
    task: `\uFEFF${fixtures[0].draft.task.replaceAll("\n", "\r\n")}`,
  });
  validateDraft(draft);
  const output = generateJsonReceipt(draft);
  assert.doesNotMatch(output, /createdAt|timestamp|random|uuid/i);
  assert.doesNotMatch(output, /\r/);
});
