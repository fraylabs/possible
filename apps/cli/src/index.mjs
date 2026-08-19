#!/usr/bin/env node

import process from "node:process";
import { runBookmarkCommand } from "./bookmarks.mjs";
import { installPossibleSkill } from "./init.mjs";

const HELP = `Possible CLI

Usage:
  possible init
  possible bookmark <command>

Commands:
  init      Install the optional Possible discovery skill into this project
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
} else if (args.length !== 1 || args[0] !== "init") {
  process.stderr.write(`Unknown command: ${args.join(" ")}\n\n${HELP}`);
  process.exitCode = 1;
} else {
  try {
    const result = await installPossibleSkill();
    process.stdout.write(`${result.changed ? "Possible installed" : "Possible is already installed"} at ${result.installPath}\n\nOpen Codex in this project and type:\n\n  $possible\n`);
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  }
}
