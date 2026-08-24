"use node";

import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { discoverOutcomeSource, publicSnapshot } from "../apps/cli/src/sources.mjs";

type RegistrationResult = {
  source: { type: "github" | "well-known"; locator: string; installUrl: string; revision: string; publisherName: string };
  outcomes: Array<{ id: string; slug: string; title: string; publicationKind: "official" | "community" }>;
};

export const register = internalAction({
  args: { source: v.string() },
  handler: async (ctx, { source }): Promise<RegistrationResult> => {
    const normalized = source.trim();
    if (!normalized || normalized.length > 2048) throw new Error("A GitHub repository or publisher domain is required");
    const githubToken = process.env.GITHUB_TOKEN;
    const discovery = await discoverOutcomeSource(normalized, githubToken ? { githubToken } : {});
    return await ctx.runMutation(internal.registry.applyDiscovery, { discovery: publicSnapshot(discovery) }) as RegistrationResult;
  },
});
