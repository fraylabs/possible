import { readdir, readFile } from "node:fs/promises";
import { basename, dirname, relative, resolve } from "node:path";
import { fail } from "./errors.js";
import { sha256 } from "./hash.js";
import {
  validateRunKnowledgeAgainstGraph,
  validateScenarioKnowledgeReferences,
} from "./knowledge.js";
import {
  deepFreeze,
  validateReceipt,
  validateScenario,
  validateScenarioManifest,
  validateTranscript,
} from "./validate.js";
import { validatePair } from "./score.js";

async function readJson(path, label) {
  let raw;
  try {
    raw = await readFile(path);
  } catch (error) {
    fail("FILE_READ_FAILED", `cannot read ${label} at ${path}: ${error.message}`);
  }
  try {
    return { raw, value: JSON.parse(raw.toString("utf8")) };
  } catch (error) {
    fail("MALFORMED_JSON", `${label} at ${path} is not valid JSON: ${error.message}`);
  }
}

async function walk(root) {
  let entries;
  try {
    entries = await readdir(root, { withFileTypes: true });
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
  const paths = [];
  for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
    const path = resolve(root, entry.name);
    if (entry.isDirectory()) paths.push(...(await walk(path)));
    else if (entry.isFile()) paths.push(path);
  }
  return paths;
}

export async function loadLockedScenarios(scenarioDirectory) {
  const root = resolve(scenarioDirectory);
  const manifestPath = resolve(root, "manifest.json");
  const manifestDocument = await readJson(manifestPath, "scenario manifest");
  const manifest = validateScenarioManifest(manifestDocument.value);
  const scenarios = new Map();

  for (const entry of manifest.scenarios) {
    const path = resolve(root, entry.file);
    if (dirname(path) !== root) {
      fail("SCENARIO_PATH_INVALID", `${entry.file} escapes the scenario directory`);
    }
    const document = await readJson(path, `scenario ${entry.id}`);
    const actualDigest = sha256(document.raw);
    if (actualDigest !== entry.sha256) {
      fail(
        "SCENARIO_DIGEST_MISMATCH",
        `${entry.file} does not match its locked SHA-256 digest`,
        { expected: entry.sha256, actual: actualDigest },
      );
    }
    const scenario = validateScenario(document.value);
    if (scenario.id !== entry.id || scenario.version !== entry.version) {
      fail(
        "SCENARIO_MANIFEST_MISMATCH",
        `${entry.file} id/version does not match manifest`,
      );
    }
    scenarios.set(
      scenario.id,
      deepFreeze({
        ...scenario,
        digest: actualDigest,
        file: entry.file,
      }),
    );
  }

  return deepFreeze({
    directory: root,
    manifest,
    manifestDigest: sha256(manifestDocument.raw),
    scenarios,
  });
}

function ensureRunKindAllowed(runKind, allowTestFixtures, path) {
  if (runKind === "test-fixture" && !allowTestFixtures) {
    fail(
      "TEST_FIXTURE_FORBIDDEN",
      `${path} is hand-authored test data, not a real agent run`,
    );
  }
}

export async function loadEvaluationDataset({
  scenarioDirectory,
  receiptDirectory,
  allowTestFixtures = false,
  requireAllScenarios = true,
  knowledgeGraph = undefined,
}) {
  const locked = await loadLockedScenarios(scenarioDirectory);
  if (knowledgeGraph) {
    validateScenarioKnowledgeReferences(locked, knowledgeGraph);
  }
  const receiptRoot = resolve(receiptDirectory);
  const files = await walk(receiptRoot);
  const receiptPaths = files.filter((path) => path.endsWith(".receipt.json"));
  const transcriptPaths = files.filter((path) => path.endsWith(".transcript.json"));
  const referencedTranscripts = new Set();
  const runs = [];

  for (const receiptPath of receiptPaths) {
    const receiptDocument = await readJson(receiptPath, "evaluation receipt");
    const receipt = validateReceipt(receiptDocument.value);
    ensureRunKindAllowed(receipt.runKind, allowTestFixtures, receiptPath);

    const scenario = locked.scenarios.get(receipt.scenario.id);
    if (!scenario) {
      fail(
        "SCENARIO_MISMATCH",
        `${receiptPath} references unlocked scenario ${receipt.scenario.id}`,
      );
    }
    if (
      receipt.scenario.version !== scenario.version ||
      receipt.scenario.digest !== scenario.digest
    ) {
      fail(
        "SCENARIO_MISMATCH",
        `${receiptPath} does not reference the exact locked scenario version and digest`,
      );
    }

    const transcriptPath = resolve(dirname(receiptPath), receipt.transcript.file);
    if (dirname(transcriptPath) !== dirname(receiptPath)) {
      fail("TRANSCRIPT_PATH_INVALID", `${receiptPath} references an escaping transcript path`);
    }
    if (referencedTranscripts.has(transcriptPath)) {
      fail("TRANSCRIPT_REUSED", `${transcriptPath} is referenced by more than one receipt`);
    }
    const transcriptDocument = await readJson(transcriptPath, "run transcript");
    const transcriptDigest = sha256(transcriptDocument.raw);
    if (transcriptDigest !== receipt.transcript.digest) {
      fail(
        "TRANSCRIPT_DIGEST_MISMATCH",
        `${basename(transcriptPath)} does not match its receipt digest`,
        { expected: receipt.transcript.digest, actual: transcriptDigest },
      );
    }
    const transcript = validateTranscript(transcriptDocument.value, scenario);
    ensureRunKindAllowed(transcript.runKind, allowTestFixtures, transcriptPath);
    validateReceipt(receipt, scenario, transcript);
    referencedTranscripts.add(transcriptPath);
    runs.push({
      scenario,
      transcript,
      receipt,
      source: {
        receiptPath,
        receiptRelativePath: relative(receiptRoot, receiptPath),
        receiptDigest: sha256(receiptDocument.raw),
        transcriptPath,
        transcriptRelativePath: relative(receiptRoot, transcriptPath),
        transcriptDigest,
      },
    });
    if (knowledgeGraph) {
      validateRunKnowledgeAgainstGraph(runs.at(-1), knowledgeGraph);
    } else if (transcript.runKind === "real-agent-run") {
      fail(
        "KNOWLEDGE_GRAPH_REQUIRED",
        "real-agent-run receipts require the shared @possible/knowledge graph",
      );
    }
  }

  const orphanTranscripts = transcriptPaths.filter(
    (path) => !referencedTranscripts.has(path),
  );
  if (orphanTranscripts.length > 0) {
    fail(
      "ORPHAN_TRANSCRIPT",
      `transcript(s) have no receipt: ${orphanTranscripts
        .map((path) => relative(receiptRoot, path))
        .join(", ")}`,
    );
  }

  const pairGroups = new Map();
  for (const run of runs) {
    const pairId = run.transcript.pairId;
    const group = pairGroups.get(pairId) ?? [];
    group.push(run);
    pairGroups.set(pairId, group);
  }
  const pairs = [...pairGroups.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([pairId, pairRuns]) => {
      validatePair(pairRuns);
      if (pairRuns.some((run) => run.receipt.pairId !== pairId)) {
        fail("PAIR_MISMATCH", `${pairId} has inconsistent receipt metadata`);
      }
      return pairRuns;
    });

  if (runs.length > 0 && requireAllScenarios) {
    const coveredScenarioIds = new Set(
      pairs.map((pair) => pair[0].scenario.id),
    );
    const missing = [...locked.scenarios.keys()].filter(
      (scenarioId) => !coveredScenarioIds.has(scenarioId),
    );
    if (missing.length > 0) {
      fail(
        "INCOMPLETE_SCENARIO_SET",
        `receipt set is missing locked scenario pair(s): ${missing.join(", ")}`,
      );
    }
  }

  return {
    locked,
    receiptDirectory: receiptRoot,
    runs,
    pairs,
  };
}
