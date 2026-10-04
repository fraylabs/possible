"use client";

import type { ReactNode } from "react";
import { installCommand } from "./public-content";
import { CopyButton, SiteShell } from "./shared";

type DocsPageKey = "overview" | "how-to-use" | "authoring" | "reference";
const links = [
  { label: "Overview", href: "/docs", active: "overview" },
  { label: "How to use", href: "/docs/how-to-use", active: "how-to-use" },
  { label: "Publish an Outcome", href: "/docs/authoring", active: "authoring" },
  { label: "Reference", href: "/docs/reference", active: "reference" },
] as const;

function DocsSidebar({ active }: { active: DocsPageKey }) {
  return <aside className="docs-sidebar" aria-label="Documentation navigation"><a className="docs-sidebar-title" href="/docs">Documentation</a><nav>{links.map((link) => <a className={link.active === active ? "is-active" : undefined} href={link.href} key={link.href}>{link.label}</a>)}<a href="/#discover">Browse Outcomes ↗</a></nav></aside>;
}

function DocsLayout({ active, eyebrow, title, description, children }: { active: DocsPageKey; eyebrow: string; title: string; description: string; children: ReactNode }) {
  return <SiteShell className="docs-page"><div className="docs-shell layout-standard"><DocsSidebar active={active} /><article className="docs-article"><div className="docs-breadcrumb"><a href="/docs">Docs</a><span>/</span><span>{eyebrow}</span></div><header className="docs-title"><h1>{title}</h1><p>{description}</p></header>{children}</article></div></SiteShell>;
}

export function DocsPage() {
  return <DocsLayout active="overview" eyebrow="Overview" title="Results and the recipes behind them" description="See what AI made, inspect how it was made, and hand the recipe to your agent.">
    <aside className="docs-callout"><p><strong>Outcome</strong> = result + a recipe you can inspect and reuse. Older Outcomes remain available as prompt-only records.</p></aside>
    <section><h2>Page views</h2><p>possible.sh counts page views by page and referring site; no cookies or personal data.</p></section>
    <section><h2>What Possible does</h2><ol><li><strong>Shows the result first</strong><span>Images, video, audio, or CAD make each possibility concrete.</span></li><li><strong>Shows how it was made</strong><span>Recipes record models and agents, pinned skills, references, tools and APIs, and ordered steps. The exact published prompt stays available.</span></li><li><strong>Credits what made it</strong><span>Product and Skill labels filter the Outcome leaderboard. Possible does not host separate profiles for them.</span></li></ol></section>
    <section><h2>$possible is optional</h2><p>The website shows prior work. The skill uses those Outcomes as precedent, gathers current information, asks only consequential questions, and prepares a new execution prompt for a fresh agent. Install it with the standard Skills installer.</p><div className="docs-command"><header><strong>Install</strong></header><pre><code>{installCommand}</code></pre><CopyButton label="Copy install command" value={installCommand} /></div></section>
    <nav className="docs-next"><span>NEXT</span><a href="/docs/how-to-use">How to use Possible <b>→</b></a></nav>
  </DocsLayout>;
}

export function HowToUsePage() {
  return <DocsLayout active="how-to-use" eyebrow="HOW TO USE" title="Find something good. Take the recipe." description="Browse prior Outcomes directly or let $possible adapt useful precedent to a new request.">
    <section><h2>On possible.sh</h2><ol><li><strong>Search in ordinary language</strong><span>Try “make a launch video,” “design a cat shelter,” or “animate an architectural drawing.” Cards are marked Recipe or Prompt only; choose Recipes only to see Outcomes with a recipe.</span></li><li><strong>Open an Outcome</strong><span>Judge the visible result, then inspect “How it was made,” the exact prompt, and the original source.</span></li><li><strong>Copy the recipe</strong><span>Copy recipe is the main action wherever a recipe exists, on cards and Outcome pages. Hand the text kit to your agent and explain what should change. Copy prompt stays available for the exact prompt alone. Copying does not install tools or skills or run any steps. Prompt-only Outcomes are clearly labeled; you can still copy or remix their prompts.</span></li></ol></section>
    <section><h2>With $possible</h2><p>Give <code>$possible</code> your rough request. It finds relevant Outcomes through the Possible MCP when available or the public CLI otherwise, checks current primary sources, asks only questions that materially change the work, and shows you a new execution prompt. After you approve it, that complete prompt can be sent to a fresh subagent without hidden conversation history.</p></section>
    <nav className="docs-next"><span>NEXT</span><a href="/docs/authoring">Publish an Outcome <b>→</b></a></nav>
  </DocsLayout>;
}

export function AuthoringDocsPage() {
  return <DocsLayout active="authoring" eyebrow="PUBLISH" title="Publish from your source" description="Keep the canonical Outcome in your public repository or domain. Possible reads it—no account required.">
    <section><h2>One folder per Outcome</h2><pre className="docs-code-block"><code>{`outcomes.json      # publisher and manifest locations
outcomes/my-outcome/
  outcome.json    # machine metadata
  outcome.md      # human-facing title and explanation
  prompt.md       # exact reusable execution prompt
  media/          # optional previews
  inputs/         # optional supplied files
  artifacts/      # optional downloadable results`}</code></pre></section>
    <section><h2>Install the CLI</h2><p>The standalone CLI includes its runtime. No Node or npm installation is needed.</p><pre className="docs-code-block"><code>{`curl -fsSL https://possible.sh/install.sh | sh
export PATH="$HOME/.local/bin:$PATH"
# Or:
brew install fraylabs/tap/possible`}</code></pre><p>The script verifies SHA256 and installs to <code>~/.local/bin</code> without sudo. Set <code>POSSIBLE_INSTALL_DIR</code> for another writable directory or <code>POSSIBLE_VERSION=0.6.0</code> to pin a version. npm 0.3.1 is legacy.</p></section>
    <section><h2>Author locally</h2><ol><li><strong>Create the folder</strong><span>Run <code>possible create my-outcome --product owner/product</code>, or use <code>--skill owner/repository directory commit</code>. The scaffold includes placeholder recipe steps.</span></li><li><strong>Write the human record</strong><span>Put the title, opening summary, and formatted explanation in <code>outcome.md</code>.</span></li><li><strong>Preserve the prompt</strong><span>Put the exact reusable execution prompt in <code>prompt.md</code>.</span></li><li><strong>Add provenance</strong><span>Name the primary Product or Skill, record models and provenance, and add a recipe with the agent, pinned skills, references, tools/APIs, and ordered steps you can substantiate in <code>outcome.json</code>.</span></li><li><strong>Validate</strong><span>Run <code>possible validate</code>. It reports the recipe as incomplete until every placeholder step is filled in; remove the optional recipe to publish the prompt alone.</span></li></ol></section>
    <section><h2>Capture a finished session</h2><p>CLI 0.5.2 can read an explicit local Claude Code or Codex JSONL file, or one inactive Turnless/T3 thread from its local SQLite database. Run <code>possible capture claude-code &lt;session.jsonl&gt; --out &lt;private-draft&gt;</code>, then edit <code>draft.json</code>. Tool outputs and file contents are omitted; unknown ingredients remain unknown.</p><p>The creator runs <code>possible capture review &lt;private-draft&gt;</code> in their terminal to inspect and approve the exact export. Then <code>possible capture export &lt;private-draft&gt; --out &lt;new-directory&gt;</code> writes a local Outcome. Nothing is uploaded by capture, review or export. Automated redaction can miss private details; review every field. Approval is creator-attested and unauthenticated: a terminal can be automated. The check prevents accidental export and does not prove a person was present. Publishing is a separate explicit decision.</p></section>
    <section><h2>Publish publicly</h2><p>The create command adds the Outcome to the repository-root <code>outcomes.json</code> index. Commit the public GitHub repository and run <code>possible publish owner/repository</code>. Domain publishers expose that index at <code>/.well-known/possible/outcomes.json</code> and publish the HTTPS origin. Possible stores an immutable snapshot of every accepted revision.</p><a href="/publish">Publish a source →</a></section>
    <section><h2>Identity and labels</h2><p>A publisher-domain source is Official for that domain. GitHub sources are Community by default unless ownership of a referenced Skill follows directly from the repository. Authors cannot self-award another company’s identity.</p></section>
  </DocsLayout>;
}

export function DocsReferencePage() {
  return <DocsLayout active="reference" eyebrow="REFERENCE" title="Outcome reference" description="The public format keeps each result and its recipe easy to inspect and reuse. Recipes are optional; existing schema-version-4 Outcomes remain valid.">
    <section><h2>Required files</h2><div className="docs-table"><div><code>outcomes.json</code><span>Repository-root publisher identity and a thin list of Outcome manifest locations.</span></div><div><code>outcome.md</code><span>H1 title, opening summary, and optional formatted explanation.</span></div><div><code>prompt.md</code><span>The exact reusable execution prompt.</span></div><div><code>outcome.json</code><span>Schema version, slug, file pointers, author, models, authored timestamp, requirements, and one primary Product or Skill attribution.</span></div></div></section>
    <section><h2>Attribution</h2><div className="docs-table"><div><code>primary</code><span>The single Product or Skill people should understand first. Product references use an ID; Skill references preserve repository, directory, and last-reviewed commit.</span></div><div><code>secondary</code><span>Optional additional Products or Skills that materially contributed. Do not repeat the primary attribution.</span></div></div></section>
    <section><h2>Recipe</h2><p>The optional <code>recipe</code> object records how the result was made. Include only known details; missing fields do not mean no tools or skills were used. Models stay in the top-level <code>models</code> array with their authorship, execution, or review role.</p><div className="docs-table"><div><code>provenance</code><span>Recorded from session (reviewed local capture), reconstructed, or omitted when origin is unknown. Recorded recipes may contain privacy edits.</span></div><div><code>notes</code><span>Known omissions and uncertainty.</span></div><div><code>agent</code><span>Name, optional version, and optional URL.</span></div><div><code>skills</code><span>Repository, directory, and exact lastReviewedCommit for every recorded skill.</span></div><div><code>references</code><span>Kind (repository, document, image, web, or example), label, URL, and optional purpose.</span></div><div><code>tools</code><span>Name, purpose, and optional URL for tools and APIs.</span></div><div><code>steps</code><span>Ordered title and instructions, with an optional prompt for each step.</span></div></div><p>Recipes describe the published work. Copy recipe produces a text kit; local session capture is available in CLI 0.5.2. Kit installation is not supported.</p></section>
    <section><h2>Optional metadata</h2><div className="docs-table"><div><code>inputs</code><span>Actual files supplied to the run.</span></div><div><code>artifacts</code><span>Actual files produced by the run and available to download.</span></div><div><code>preview</code><span>Representative images, video, audio, or CAD.</span></div></div></section>
    <section><h2>Machine interfaces</h2><ul><li>The MCP exposes <code>list_outcomes</code>, <code>search_outcomes</code>, and <code>fetch_outcome</code> over the live public directory.</li><li><code>possible search "rough request"</code> finds Outcomes without MCP setup.</li><li><code>possible fetch &lt;outcome-id&gt;</code> prints one directory Outcome’s recipe text kit, or its exact prompt when it has no recipe. Add <code>--prompt</code> for the exact prompt alone, or <code>--json</code> for the full record with its recipe, model list, and provenance.</li><li><code>possible add owner/repository</code> stores a public source locally.</li><li><code>possible use owner/repository@slug</code> prints that source Outcome’s recipe text kit, or its exact prompt when it has no recipe. It accepts the same <code>--prompt</code> and <code>--json</code> flags.</li></ul></section>
  </DocsLayout>;
}
