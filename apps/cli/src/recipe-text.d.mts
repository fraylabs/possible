type RecipeSkill = { repository: string; directory: string; lastReviewedCommit: string };

export type RecipeTextRecipe = {
  provenance?: { method: "reconstructed" } | { method: "recorded"; source: string; reviewedAt: string; reviewDigest: string } | undefined;
  notes?: string[] | undefined;
  agent?: { name: string; version?: string | undefined; url?: string | undefined } | undefined;
  skills?: RecipeSkill[] | undefined;
  references?: { kind: string; label: string; url: string; purpose?: string | undefined }[] | undefined;
  tools?: { name: string; purpose: string; url?: string | undefined }[] | undefined;
  steps?: { title: string; instructions: string; prompt?: string | undefined }[] | undefined;
};

export type RecipeTextOutcome = {
  title: string;
  source_url?: string | null | undefined;
  prompt: string;
  recipe?: RecipeTextRecipe | null | undefined;
  models?: { provider: string; model: string; role: string; agent?: string | undefined }[] | undefined;
  model?: string | null | undefined;
  provider?: string | null | undefined;
  agent?: string | null | undefined;
  requirements?: string[] | undefined;
  inputs?: { label: string; src: string }[] | undefined;
};

export function skillUrl(skill: RecipeSkill): string;
export function modelDescriptions(outcome: Pick<RecipeTextOutcome, "models" | "model" | "provider" | "agent">): string[];
export function hasRecipe(outcome: { recipe?: unknown } | null | undefined): boolean;
export function recipeOrigin(outcome: Pick<RecipeTextOutcome, "recipe">): string;
export function recipeText(outcome: RecipeTextOutcome): string;
export function sourceRecipeOutcome(discovery: { installUrl: string }, outcome: { title: string; prompt: string; manifest?: Record<string, unknown> | undefined }): RecipeTextOutcome;
