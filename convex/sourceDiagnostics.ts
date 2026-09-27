"use node";

import { internalAction } from "./_generated/server";

/** Custody-only, read-only probe for the public publisher's GitHub access. */
export const githubPublisher = internalAction({
  args: {},
  handler: async () => {
    const response = await fetch("https://api.github.com/repos/fraylabs/possible-outcomes", {
      headers: { accept: "application/json", "user-agent": "possible-cli" },
      redirect: "error",
      signal: AbortSignal.timeout(15000),
    });
    const headers = Object.fromEntries([
      "x-ratelimit-limit", "x-ratelimit-remaining", "x-ratelimit-reset",
      "x-ratelimit-resource", "retry-after", "x-github-request-id",
    ].map((name) => [name, response.headers.get(name)]));
    const body = await response.json() as { message?: unknown };
    return {
      status: response.status,
      message: typeof body.message === "string" ? body.message.slice(0, 500) : null,
      headers,
    };
  },
});
