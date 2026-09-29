#!/usr/bin/env node

import { visibleText, visibleValue } from "./text-safety.mjs";
import process from "node:process";
import { runCaptureCommand } from "./capture.mjs";
import { runBookmarkCommand } from "./bookmarks.mjs";
import { fetchOutcome, formatSearchResults, searchOutcomes } from "./directory.mjs";
import { addOutcomeSource, createOutcome, publishOutcomeSource, useOutcome, validateOutcomes } from "./outcome-commands.mjs";

const HELP = `Possible CLI

Usage:
  possible create <slug> --product <owner/product>
  possible create <slug> --skill <owner/repository> <directory> <commit>
  possible validate [directory]
  possible publish [owner/repository | https://publisher.example]
  possible search <ordinary-language query>
  possible fetch <outcome-id> [--json]
  possible add <owner/repository | https://publisher.example>
  possible use <source>@<slug> [--json]
  possible capture <claude-code|turnless|codex> <local-file> --out <private-draft> [--thread <id>]
  possible capture review <private-draft>
  possible capture export <private-draft> --out <new-local-publisher>
  possible bookmark <command>

Commands:
  create    Create one Outcome with its required primary Product or Skill
  validate  Validate every Outcome folder below a directory
  publish   Validate and submit one public publisher source; no account required
  search    Find relevant Outcomes in the live public directory
  fetch     Print a prompt; --json includes the recipe and provenance
  add       Discover a public source and save it to .possible/sources.json
  use       Print a source prompt; --json includes its manifest and recipe
  capture   Draft locally; creator-attested review before export (not authenticated)
  bookmark  add | list | remove locally saved Outcome slugs
`;

const args = process.argv.slice(2);
if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
  process.stdout.write(HELP);
  process.exitCode = args.length === 0 ? 1 : 0;
} else if (args[0] === "capture") {
  try { process.stdout.write(`${await runCaptureCommand(args.slice(1))}\n`); }
  catch (error) { process.stderr.write(`${error instanceof Error ? error.message : "Capture failed"}\n`); process.exitCode = 1; }
} else if (args[0] === "bookmark") {
  try {
    const result = await runBookmarkCommand(args.slice(1));
    if (result) process.stdout.write(`${result}\n`);
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  }
} else if (args[0] === "search" && args.length >= 2) {
  try {
    const outcomes = await searchOutcomes(args.slice(1).join(" "));
    process.stdout.write(formatSearchResults(outcomes));
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  }
} else if (args[0] === "fetch" && (args.length === 2 || (args.length === 3 && args[2] === "--json"))) {
  try {
    const outcome = await fetchOutcome(args[1]);
    process.stdout.write(args[2] === "--json" ? `${JSON.stringify(visibleValue(outcome), null, 2)}\n` : `${visibleText(outcome.prompt)}\n`);
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  }
} else if (args[0] === "create" && ((args[2] === "--product" && args.length === 4) || (args[2] === "--skill" && args.length === 6))) {
  try {
    const primary = args[2] === "--product"
      ? { kind: "product", id: args[3] }
      : { kind: "skill", repository: args[3], directory: args[4], lastReviewedCommit: args[5] };
    const folder = await createOutcome(args[1], { primary });
    process.stdout.write(`Created ${folder}\n`);
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  }
} else if (args[0] === "validate" && args.length <= 2) {
  try {
    const result = await validateOutcomes(args[1] ?? process.cwd());
    process.stdout.write(`Validated ${result.count} Outcome${result.count === 1 ? "" : "s"}.\n`);
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  }
} else if (args[0] === "add" && args.length === 2) {
  try {
    const result = await addOutcomeSource(args[1]);
    process.stdout.write(`Added ${result.discovery.locator}: ${result.discovery.outcomes.length} Outcome${result.discovery.outcomes.length === 1 ? "" : "s"}.\nSaved ${result.sourcesPath}\n`);
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  }
} else if (args[0] === "use" && (args.length === 2 || (args.length === 3 && args[2] === "--json"))) {
  try {
    const result = await useOutcome(args[1]);
    process.stdout.write(args[2] === "--json" ? `${JSON.stringify(visibleValue(result.outcome), null, 2)}\n` : `${visibleText(result.outcome.prompt)}\n`);
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  }
} else if (args[0] === "publish" && args.length <= 2) {
  try {
    const result = await publishOutcomeSource(args[1]);
    const publicUrl = result.result.url ?? result.result.href;
    const outcomes = Array.isArray(result.result.outcomes) ? result.result.outcomes : [];
    const locator = result.result.source?.locator ?? result.source;
    process.stdout.write(`Published ${outcomes.length} Outcome${outcomes.length === 1 ? "" : "s"} from ${locator}.${publicUrl ? `\n${publicUrl}` : ""}\n`);
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  }
} else {
  process.stderr.write(`Unknown command: ${args.join(" ")}\n\n${HELP}`);
  process.exitCode = 1;
}
