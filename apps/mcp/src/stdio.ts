#!/usr/bin/env node

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { createPossibleServer } from "./server.js";

const server = await createPossibleServer();

process.on("SIGINT", async () => {
  await server.close();
  process.exit(0);
});

await server.connect(new StdioServerTransport());
