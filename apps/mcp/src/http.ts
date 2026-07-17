#!/usr/bin/env node

import { createMcpExpressApp } from "@modelcontextprotocol/sdk/server/express.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import type { Transport } from "@modelcontextprotocol/sdk/shared/transport.js";
import { loadWiki, type WikiCorpus } from "@possible/knowledge";
import type { Server } from "node:http";
import { pathToFileURL } from "node:url";

import { createPossibleServer } from "./server.js";

function parsePort(value: string | undefined): number {
  if (value === undefined) return 3001;
  const port = Number(value);
  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    throw new Error(`PORT must be an integer between 1 and 65535; received '${value}'.`);
  }
  return port;
}

function parseAllowedHosts(value: string | undefined): string[] | undefined {
  if (value === undefined) return undefined;
  const hosts = value.split(",").map((host) => host.trim()).filter(Boolean);
  return hosts.length > 0 ? hosts : undefined;
}

export interface PossibleHttpOptions {
  host?: string;
  port?: number;
  allowedHosts?: string[];
  quiet?: boolean;
  wiki?: WikiCorpus;
}

export async function startHttpServer(
  options: PossibleHttpOptions = {},
): Promise<Server> {
  const host = options.host ?? process.env.HOST ?? "127.0.0.1";
  const port = options.port ?? parsePort(process.env.PORT);
  if (!Number.isInteger(port) || port < 0 || port > 65_535) {
    throw new Error(`port must be an integer between 0 and 65535; received '${port}'.`);
  }
  const allowedHosts = options.allowedHosts ?? parseAllowedHosts(process.env.ALLOWED_HOSTS);
  const wiki = options.wiki ?? await loadWiki();
  const app = allowedHosts === undefined
    ? createMcpExpressApp({ host })
    : createMcpExpressApp({ host, allowedHosts });

  app.post("/mcp", async (request, response) => {
    const server = await createPossibleServer({ wiki });
    const transport = new StreamableHTTPServerTransport({
      enableJsonResponse: true,
    });

    response.on("close", () => {
      void transport.close();
      void server.close();
    });

    try {
      // SDK v1's accessor declarations conflict with its Transport interface
      // only when exactOptionalPropertyTypes is enabled; the runtime class
      // implements the transport contract used here.
      await server.connect(transport as unknown as Transport);
      await transport.handleRequest(request, response, request.body);
    } catch (error) {
      if (!response.headersSent) {
        response.status(500).json({
          jsonrpc: "2.0",
          error: {
            code: -32603,
            message: error instanceof Error ? error.message : "Internal MCP error",
          },
          id: null,
        });
      }
    }
  });

  app.get("/mcp", (_request, response) => {
    response.set("Allow", "POST").status(405).json({
      jsonrpc: "2.0",
      error: {
        code: -32000,
        message: "This stateless endpoint accepts MCP requests over POST only.",
      },
      id: null,
    });
  });

  app.delete("/mcp", (_request, response) => {
    response.set("Allow", "POST").status(405).json({
      jsonrpc: "2.0",
      error: {
        code: -32000,
        message: "This stateless endpoint has no sessions to terminate.",
      },
      id: null,
    });
  });

  const httpServer = await new Promise<Server>((resolve, reject) => {
    const candidate = app.listen(port, host, () => resolve(candidate));
    candidate.once("error", reject);
  });

  if (!options.quiet) {
    const address = httpServer.address();
    const boundPort = typeof address === "object" && address !== null ? address.port : port;
    console.error(`Possible MCP listening at http://${host}:${boundPort}/mcp`);
  }

  return httpServer;
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const httpServer = await startHttpServer();
  process.on("SIGINT", () => {
    httpServer.close(() => process.exit(0));
  });
}
