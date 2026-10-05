#!/usr/bin/env node

import { visibleText, visibleValue } from "./text-safety.mjs";
import process from "node:process";
import { runCaptureCommand } from "./capture.mjs";
import { runBookmarkCommand } from "./bookmarks.mjs";
import { fetchOutcome, formatSearchResults, searchOutcomes } from "./directory.mjs";
import { addOutcomeSource, createOutcome, publishOutcomeSource, useOutcome, validateOutcomes } from "./outcome-commands.mjs";
import { hasRecipe, recipeText, sourceRecipeOutcome } from "./recipe-text.mjs";

const HELP = `Possible CLI

Usage:
  possible create <slug> --product <owner/product>
  possible create <slug> --skill <owner/repository> <directory> <commit>
  possible validate [directory]
  possible publish [owner/repository | https://publisher.example]
  possible search <ordinary-language query>
  possible fetch <outcome-id> [--prompt | --json]
  possible add <owner/repository | https://publisher.example>
  possible use <source>@<slug> [--prompt | --json]
  possible capture <claude-code|codex> <session.jsonl> --out <private-draft>
  possible capture review <private-draft>
  possible capture export <private-draft> --out <new-local-publisher>
  possible bookmark <command>

Commands:
  create    Create one Outcome with its primary Product or Skill and a recipe to fill
  validate  Validate every Outcome folder below a directory
  publish   Validate and submit one public publisher source; no account required
  search    Find relevant Outcomes in the live public directory
  fetch     Print the recipe (or the prompt if none); --prompt for prompt only
  add       Discover a public source and save it to .possible/sources.json
  use       Print a source recipe (or prompt if none); --prompt for prompt only
  capture   Draft locally; creator-attested review before export (not authenticated)
  bookmark  add | list | remove locally saved Outcome slugs

Output:
  fetch and use print the recipe text kit when the Outcome has one: its models,
  agent, skills, references, tools, ordered steps and the exact published
  prompt. --prompt prints only the exact prompt. --json prints the full record.
`;

// The recipe is the default when one was published; otherwise the prompt.
const outputMode = (flag) => (flag === undefined ? "default" : flag === "--json" ? "json" : flag === "--prompt" ? "prompt" : null);
const formatOutcome = (mode, record, recipeOutcome) => mode === "json"
  ? `${JSON.stringify(visibleValue(record), null, 2)}\n`
  : `${visibleText(mode === "default" && hasRecipe(recipeOutcome) ? recipeText(recipeOutcome) : record.prompt)}\n`;

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
} else if (args[0] === "fetch" && (args.length === 2 || args.length === 3) && outputMode(args[2])) {
  try {
    const outcome = await fetchOutcome(args[1]);
    process.stdout.write(formatOutcome(outputMode(args[2]), outcome, outcome));
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
    process.stdout.write(`Created ${folder}\nFill in the placeholder recipe steps in outcome.json, or remove the optional recipe to publish the prompt alone.\n`);
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
} else if (args[0] === "use" && (args.length === 2 || args.length === 3) && outputMode(args[2])) {
  try {
    const result = await useOutcome(args[1]);
    process.stdout.write(formatOutcome(outputMode(args[2]), result.outcome, sourceRecipeOutcome(result.discovery, result.outcome)));
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
