#!/usr/bin/env node

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const allowedTools = new Set(["search", "read"]);

const [toolName, rawArguments = "{}"] = process.argv.slice(2);

if (!toolName || !allowedTools.has(toolName)) {
  console.error(
    `Usage: npm run possible:query -- <${[...allowedTools].join("|")}> '<plain query/slug or JSON arguments>'`,
  );
  process.exitCode = 2;
} else {
  let args;
  try {
    args = JSON.parse(rawArguments);
  } catch (error) {
    const value = rawArguments.trim();
    if (!value) {
      console.error(`Arguments must be valid JSON: ${error instanceof Error ? error.message : String(error)}`);
      process.exit(2);
    }
    args = toolName === "search" ? { query: value } : { slug: value };
  }

  const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
  const client = new Client({ name: "possible-query", version: "0.0.1" });
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [resolve(root, "apps/mcp/dist/stdio.js")],
    cwd: root,
    stderr: "inherit",
  });

  try {
    await client.connect(transport);
    const result = await client.callTool({ name: toolName, arguments: args });
    console.log(JSON.stringify(result.structuredContent ?? result, null, 2));
    if (result.isError) process.exitCode = 1;
  } finally {
    await client.close();
  }
}
