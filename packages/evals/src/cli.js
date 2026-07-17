#!/usr/bin/env node

import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { EvaluationError, fail } from "./errors.js";
import { loadEvaluationDataset, loadLockedScenarios } from "./load.js";
import { loadSharedKnowledgeGraph } from "./knowledge.js";
import { createEvaluationReport } from "./report.js";

function usage() {
  return [
    "Usage:",
    "  possible-eval validate-scenarios --scenario-dir <path>",
    "  possible-eval evaluate --scenario-dir <path> --receipt-dir <path> [--output <path>] [--allow-empty] [--allow-test-fixtures]",
  ].join("\n");
}

function parseArguments(argv) {
  const [command, ...rest] = argv;
  if (!["validate-scenarios", "evaluate"].includes(command)) {
    fail("CLI_USAGE", usage());
  }
  const options = {};
  for (let index = 0; index < rest.length; index += 1) {
    const token = rest[index];
    if (["--allow-empty", "--allow-test-fixtures"].includes(token)) {
      options[token.slice(2)] = true;
      continue;
    }
    if (!["--scenario-dir", "--receipt-dir", "--output"].includes(token)) {
      fail("CLI_USAGE", `Unknown option ${token}\n${usage()}`);
    }
    const value = rest[index + 1];
    if (!value || value.startsWith("--")) {
      fail("CLI_USAGE", `${token} requires a value\n${usage()}`);
    }
    options[token.slice(2)] = value;
    index += 1;
  }
  if (!options["scenario-dir"]) {
    fail("CLI_USAGE", `--scenario-dir is required\n${usage()}`);
  }
  if (command === "evaluate" && !options["receipt-dir"]) {
    fail("CLI_USAGE", `--receipt-dir is required\n${usage()}`);
  }
  return { command, options };
}

export async function main(argv = process.argv.slice(2)) {
  const { command, options } = parseArguments(argv);
  if (command === "validate-scenarios") {
    const locked = await loadLockedScenarios(resolve(options["scenario-dir"]));
    const result = {
      status: "valid",
      setId: locked.manifest.setId,
      manifestSha256: locked.manifestDigest,
      scenarios: [...locked.scenarios.values()].map((scenario) => ({
        id: scenario.id,
        version: scenario.version,
        sha256: scenario.digest,
      })),
    };
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    return result;
  }

  const knowledgeGraph = await loadSharedKnowledgeGraph();
  const dataset = await loadEvaluationDataset({
    scenarioDirectory: resolve(options["scenario-dir"]),
    receiptDirectory: resolve(options["receipt-dir"]),
    allowTestFixtures: options["allow-test-fixtures"] === true,
    knowledgeGraph,
  });
  if (dataset.runs.length === 0 && options["allow-empty"] !== true) {
    fail(
      "EMPTY_RECEIPTS",
      "no real run receipts found; use --allow-empty only while awaiting fresh runs",
    );
  }
  const report = createEvaluationReport(dataset);
  const rendered = `${JSON.stringify(report, null, 2)}\n`;
  if (options.output) {
    const outputPath = resolve(options.output);
    await mkdir(dirname(outputPath), { recursive: true });
    await writeFile(outputPath, rendered, "utf8");
  } else {
    process.stdout.write(rendered);
  }
  return report;
}

const invokedPath = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : "";
if (import.meta.url === invokedPath) {
  main().catch((error) => {
    if (error instanceof EvaluationError) {
      process.stderr.write(`${error.code}: ${error.message}\n`);
    } else {
      process.stderr.write(`${error.stack ?? error.message}\n`);
    }
    process.exitCode = 1;
  });
}
