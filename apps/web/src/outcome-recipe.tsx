import type { ReactNode } from "react";
import type { SkillReference } from "@possible/catalog";
import type { DirectoryOutcomeDetail } from "./dynamic-outcome-detail";
import { recordOutcomeUse } from "./discovery-data";
import { CopyButton } from "./shared";

function safeUrl(url?: string): string | undefined {
  if (!url) return undefined;
  try { const parsed = new URL(url); return ["https:", "http:"].includes(parsed.protocol) ? parsed.href : undefined; } catch { return undefined; }
}
function SourceLink({ url, children }: { url?: string | undefined; children: ReactNode }) {
  const href = safeUrl(url);
  return href ? <a href={href} target="_blank" rel="noopener noreferrer">{children} ↗</a> : <span>{children}</span>;
}
function skillUrl(skill: SkillReference): string {
  return `https://github.com/${skill.repository.split("/").map(encodeURIComponent).join("/")}/tree/${encodeURIComponent(skill.lastReviewedCommit)}/${skill.directory.split("/").map(encodeURIComponent).join("/")}`;
}
function modelDescriptions(outcome: DirectoryOutcomeDetail): string[] {
  if (outcome.models?.length) return outcome.models.map((model) => `${model.model} · ${model.provider} · ${model.role}${model.agent ? ` · ${model.agent}` : ""}`);
  return outcome.model || outcome.provider || outcome.agent ? [[outcome.model, outcome.provider, outcome.agent].filter(Boolean).join(" · ")] : [];
}
export function recipeText(outcome: DirectoryOutcomeDetail): string {
  const recipe = outcome.recipe;
  const lines = [outcome.title, `Source: ${outcome.source_url}`, "", recipe ? "How it was made — published recipe" : "Prompt only — no recipe was published.", "Only recorded details are included; unlisted ingredients and steps are unknown."];
  for (const model of modelDescriptions(outcome)) lines.push(`Model: ${model}`);
  if (recipe?.agent) lines.push(`Agent: ${recipe.agent.name}${recipe.agent.version ? ` (${recipe.agent.version})` : ""}${safeUrl(recipe.agent.url) ? ` — ${safeUrl(recipe.agent.url)}` : ""}`);
  for (const skill of recipe?.skills ?? []) lines.push(`Skill: ${skill.repository}/${skill.directory}\nPinned commit: ${skill.lastReviewedCommit}\n${skillUrl(skill)}`);
  for (const reference of recipe?.references ?? []) lines.push(`Reference (${reference.kind}): ${reference.label}${safeUrl(reference.url) ? ` — ${safeUrl(reference.url)}` : ""}${reference.purpose ? `\nPurpose: ${reference.purpose}` : ""}`);
  for (const tool of recipe?.tools ?? []) lines.push(`Tool/API: ${tool.name}${safeUrl(tool.url) ? ` — ${safeUrl(tool.url)}` : ""}\nPurpose: ${tool.purpose}`);
  if (outcome.requirements.length) lines.push("", "Requirements", ...outcome.requirements.map((requirement) => `- ${requirement}`));
  for (const input of outcome.inputs) lines.push(`Input: ${input.label}${safeUrl(input.src) ? ` — ${safeUrl(input.src)}` : ""}`);
  if (recipe?.steps?.length) lines.push("", "Ordered steps", ...recipe.steps.map((step, index) => `${index + 1}. ${step.title}\n${step.instructions}${step.prompt ? `\nStep prompt:\n${step.prompt}` : ""}`));
  lines.push("", "Exact published prompt", outcome.prompt);
  return lines.join("\n");
}
export function OutcomeRecipePanel({ outcome }: { outcome: DirectoryOutcomeDetail }) {
  const recipe = outcome.recipe;
  const models = modelDescriptions(outcome);
  return <section className="outcome-recipe" aria-labelledby="outcome-recipe-heading">
    <header><div><span>{recipe ? "PUBLISHED RECIPE" : "Prompt only"}</span><h2 id="outcome-recipe-heading">How it was made</h2></div><CopyButton label="Copy recipe" value={recipeText(outcome)} onCopied={() => recordOutcomeUse(outcome.id)} /></header>
    <p className="recipe-note">{recipe ? "The publisher’s recorded ingredients and steps. Unlisted details are unknown." : "No recipe was published for this Outcome. The exact prompt and any recorded model details are available."} Copy this text kit to your agent to adapt it.</p>
    <div className="recipe-ingredients">
      {models.length ? <div><h3>Models</h3><ul>{models.map((model, index) => <li key={index}>{model}</li>)}</ul></div> : <div><h3>Models</h3><p>Not recorded.</p></div>}
      {recipe?.agent ? <div><h3>Agent</h3><p><SourceLink url={recipe.agent.url}>{recipe.agent.name}{recipe.agent.version ? ` (${recipe.agent.version})` : ""}</SourceLink></p></div> : null}
      {recipe?.skills?.length ? <div><h3>Pinned skills</h3><ul>{recipe.skills.map((skill, index) => <li key={index}><SourceLink url={skillUrl(skill)}>{skill.repository}/{skill.directory}</SourceLink><small>Commit <code>{skill.lastReviewedCommit}</code></small></li>)}</ul></div> : null}
      {recipe?.references?.length ? <div><h3>References</h3><ul>{recipe.references.map((reference, index) => <li key={index}><SourceLink url={reference.url}>{reference.label}</SourceLink><small>{reference.kind}</small>{reference.purpose ? <p>{reference.purpose}</p> : null}</li>)}</ul></div> : null}
      {recipe?.tools?.length ? <div><h3>Tools and APIs</h3><ul>{recipe.tools.map((tool, index) => <li key={index}><SourceLink url={tool.url}>{tool.name}</SourceLink><p>{tool.purpose}</p></li>)}</ul></div> : null}
    </div>
    {recipe ? <div className="recipe-method"><h3>Ordered steps</h3>{recipe.steps?.length ? <ol>{recipe.steps.map((step, index) => <li key={index}><h4>{step.title}</h4><p>{step.instructions}</p>{step.prompt ? <pre><code>{step.prompt}</code></pre> : null}</li>)}</ol> : <p>No steps were recorded.</p>}</div> : null}
  </section>;
}
