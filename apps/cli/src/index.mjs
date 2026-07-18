#!/usr/bin/env node

import process from "node:process";
import { installPossibleSkill } from "./init.mjs";

const HELP = `Possible CLI

Usage:
  possible init

Commands:
  init  Install the Possible skill into the current project
`;

const args = process.argv.slice(2);

if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
  process.stdout.write(HELP);
  process.exitCode = args.length === 0 ? 1 : 0;
} else if (args.length !== 1 || args[0] !== "init") {
  process.stderr.write(`Unknown command: ${args.join(" ")}\n\n${HELP}`);
  process.exitCode = 1;
} else {
  try {
    const result = await installPossibleSkill();
    process.stdout.write(
      `${result.changed ? "Possible installed" : "Possible is already installed"} at ${result.installPath}\n\n` +
        "Open Codex in this project and type:\n\n" +
        "  $possible\n",
    );
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  }
}
