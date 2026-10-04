import { visibleValue } from "./text-safety.mjs";

// One text kit for the site's Copy recipe and the CLI's plain output, so both
// hand an agent the same ingredients, steps and exact published prompt.

function safeUrl(url) {
  if (!url) return undefined;
  try { const parsed = new URL(url); return ["https:", "http:"].includes(parsed.protocol) ? parsed.href : undefined; } catch { return undefined; }
}

export function skillUrl(skill) {
  return `https://github.com/${skill.repository.split("/").map(encodeURIComponent).join("/")}/tree/${encodeURIComponent(skill.lastReviewedCommit)}/${skill.directory.split("/").map(encodeURIComponent).join("/")}`;
}

export function modelDescriptions(outcome) {
  if (outcome.models?.length) return outcome.models.map((model) => `${model.model} · ${model.provider} · ${model.role}${model.agent ? ` · ${model.agent}` : ""}`);
  return outcome.model || outcome.provider || outcome.agent ? [[outcome.model, outcome.provider, outcome.agent].filter(Boolean).join(" · ")] : [];
}

export function hasRecipe(outcome) {
  return Boolean(outcome?.recipe);
}

export function recipeOrigin(outcome) {
  if (!outcome.recipe) return "Prompt only";
  if (outcome.recipe.provenance?.method === "recorded") return "Recorded from session";
  if (outcome.recipe.provenance?.method === "reconstructed") return "Reconstructed";
  return "Published recipe";
}

export function recipeText(rawOutcome) {
  const outcome = visibleValue(rawOutcome);
  const recipe = outcome.recipe;
  const lines = [outcome.title, ...(outcome.source_url ? [`Source: ${outcome.source_url}`] : []), "", recipe ? `${recipeOrigin(outcome)} — How it was made` : "Prompt only — no recipe was published.", "Only recorded details are included; unlisted ingredients and steps are unknown."];
  for (const note of recipe?.notes ?? []) lines.push(`Note: ${note}`);
  for (const model of modelDescriptions(outcome)) lines.push(`Model: ${model}`);
  if (recipe?.agent) lines.push(`Agent: ${recipe.agent.name}${recipe.agent.version ? ` (${recipe.agent.version})` : ""}${safeUrl(recipe.agent.url) ? ` — ${safeUrl(recipe.agent.url)}` : ""}`);
  for (const skill of recipe?.skills ?? []) lines.push(`Skill: ${skill.repository}/${skill.directory}\nPinned commit: ${skill.lastReviewedCommit}\n${skillUrl(skill)}`);
  for (const reference of recipe?.references ?? []) lines.push(`Reference (${reference.kind}): ${reference.label}${safeUrl(reference.url) ? ` — ${safeUrl(reference.url)}` : ""}${reference.purpose ? `\nPurpose: ${reference.purpose}` : ""}`);
  for (const tool of recipe?.tools ?? []) lines.push(`Tool/API: ${tool.name}${safeUrl(tool.url) ? ` — ${safeUrl(tool.url)}` : ""}\nPurpose: ${tool.purpose}`);
  const requirements = outcome.requirements ?? [];
  if (requirements.length) lines.push("", "Requirements", ...requirements.map((requirement) => `- ${requirement}`));
  for (const input of outcome.inputs ?? []) lines.push(`Input: ${input.label}${safeUrl(input.src) ? ` — ${safeUrl(input.src)}` : ""}`);
  if (recipe?.steps?.length) lines.push("", "Ordered steps", ...recipe.steps.map((step, index) => `${index + 1}. ${step.title}\n${step.instructions}${step.prompt ? `\nStep prompt:\n${step.prompt}` : ""}`));
  lines.push("", "Exact published prompt", outcome.prompt);
  return lines.join("\n");
}

/** Shapes an Outcome discovered from a publisher source like a directory record. */
export function sourceRecipeOutcome(discovery, outcome) {
  const manifest = outcome.manifest ?? {};
  return {
    title: outcome.title,
    source_url: discovery.installUrl,
    prompt: outcome.prompt,
    recipe: manifest.recipe ?? null,
    models: manifest.models ?? [],
    requirements: manifest.requirements ?? [],
    inputs: manifest.inputs ?? [],
  };
}
