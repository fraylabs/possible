#!/usr/bin/env node

import process from "node:process";
import { runBookmarkCommand } from "./bookmarks.mjs";
import { fetchOutcome, formatSearchResults, searchOutcomes } from "./directory.mjs";
import { addOutcomeSource, createOutcome, publishOutcomeSource, useOutcome, validateOutcomes } from "./outcome-commands.mjs";

const HELP = `Possible CLI

Usage:
  possible create <slug>
  possible validate [directory]
  possible publish [owner/repository | https://publisher.example]
  possible search <ordinary-language query>
  possible fetch <outcome-id>
  possible add <owner/repository | https://publisher.example>
  possible use <source>@<slug>
  possible bookmark <command>

Commands:
  create    Create outcome.json, outcome.md, prompt.md, and media/ for one Outcome
  validate  Validate every Outcome folder below a directory
  publish   Validate and submit one public publisher source; no account required
  search    Find relevant Outcomes in the live public directory
  fetch     Print one directory Outcome's exact prompt
  add       Discover a public source and save it to .possible/sources.json
  use       Print one exact execution prompt to standard output
  bookmark  add | list | remove locally saved Outcome slugs
`;

const args = process.argv.slice(2);
if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
  process.stdout.write(HELP);
  process.exitCode = args.length === 0 ? 1 : 0;
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
} else if (args[0] === "fetch" && args.length === 2) {
  try {
    const outcome = await fetchOutcome(args[1]);
    process.stdout.write(`${outcome.prompt}\n`);
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  }
} else if (args[0] === "create" && args.length === 2) {
  try {
    const folder = await createOutcome(args[1]);
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
} else if (args[0] === "use" && args.length === 2) {
  try {
    const result = await useOutcome(args[1]);
    process.stdout.write(`${result.outcome.prompt}\n`);
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
