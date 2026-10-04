import { modelDescriptions, recipeOrigin, recipeText, skillUrl } from "../../cli/src/recipe-text.mjs";
import type { ReactNode } from "react";
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
export function OutcomeRecipePanel({ outcome }: { outcome: DirectoryOutcomeDetail }) {
  const recipe = outcome.recipe;
  const models = modelDescriptions(outcome);
  return <section className="outcome-recipe" aria-labelledby="outcome-recipe-heading">
    <header><div><span>{recipeOrigin(outcome)}</span><h2 id="outcome-recipe-heading">How it was made</h2></div><CopyButton label="Copy recipe" value={recipeText(outcome)} onCopied={() => recordOutcomeUse(outcome.id)} /></header>
    <p className="recipe-note">{recipe?.provenance?.method === "recorded" ? "Captured locally, then reviewed and possibly edited by the creator. This is a shared recipe, not an unedited transcript." : recipe ? "The publisher’s ingredients and steps. Unlisted details are unknown." : "No recipe was published for this Outcome. The exact prompt and any recorded model details are available."} Copy this text kit to your agent to adapt it.</p>
    {recipe?.notes?.length ? <ul className="recipe-note">{recipe.notes.map((note, index) => <li key={index}>{note}</li>)}</ul> : null}
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
