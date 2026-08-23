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

function DocsContextNavigation({ active }: { active: DocsPageKey }) {
  return <nav className="docs-context-nav" aria-label="Documentation sections"><div className="docs-context-nav-inner layout-wide"><span>DOCS</span>{links.map((link) => <a className={link.active === active ? "is-active" : undefined} href={link.href} key={link.href}>{link.label}</a>)}</div></nav>;
}

function DocsSidebar({ active }: { active: DocsPageKey }) {
  return <aside className="docs-sidebar" aria-label="Documentation navigation"><div className="docs-sidebar-title"><strong>Documentation</strong><span>GUIDE</span></div><nav><span>POSSIBLE</span>{links.map((link) => <a className={link.active === active ? "is-active" : undefined} href={link.href} key={link.href}>{link.label}</a>)}<a href="/#discover">Browse Outcomes ↗</a></nav></aside>;
}

function DocsLayout({ active, eyebrow, title, description, children }: { active: DocsPageKey; eyebrow: string; title: string; description: string; children: ReactNode }) {
  return <SiteShell className="docs-page"><DocsContextNavigation active={active} /><div className="docs-shell layout-wide"><DocsSidebar active={active} /><article className="docs-article"><div className="docs-breadcrumb"><a href="/docs">DOCS</a><span>/</span><strong>{eyebrow}</strong></div><header className="docs-title"><div className="docs-title-copy"><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p>{description}</p></div></header>{children}</article></div></SiteShell>;
}

export function DocsPage() {
  return <DocsLayout active="overview" eyebrow="OVERVIEW" title="Possible connects results, prompts, and what made them" description="See what AI made, inspect the exact prompt connected to it, and remix the parts worth reusing.">
    <aside className="docs-callout docs-callout--info"><strong>THE SHORT VERSION</strong><p>Outcome = result + exact prompt + optional Products and Skills.</p></aside>
    <section><h2>What Possible does</h2><ol><li><strong>Shows the result first</strong><span>Images, video, audio, or CAD make each possibility concrete.</span></li><li><strong>Preserves the prompt</strong><span>The prompt is published unchanged, not replaced with a retrospective recipe.</span></li><li><strong>Credits what made it</strong><span>Products and Skills receive visible attribution whenever the creator attaches them.</span></li></ol></section>
    <section><h2>Optional $possible skill</h2><p>The website shows prior work. The skill uses those Outcomes as precedent, gathers current information, asks only consequential questions, and prepares a new execution prompt for a fresh agent.</p><div className="docs-command"><header><strong>INSTALL</strong></header><pre><code>{installCommand}</code></pre><CopyButton label="Copy install command" value={installCommand} /></div></section>
    <nav className="docs-next"><span>NEXT</span><a href="/docs/how-to-use">How to use Possible <b>→</b></a></nav>
  </DocsLayout>;
}

export function HowToUsePage() {
  return <DocsLayout active="how-to-use" eyebrow="HOW TO USE" title="Find something good. Remix the prompt." description="Browse prior Outcomes directly or let $possible adapt useful precedent to a new request.">
    <section><h2>On possible.sh</h2><ol><li><strong>Search in ordinary language</strong><span>Try “make a launch video,” “design a cat shelter,” or “animate an architectural drawing.”</span></li><li><strong>Open an Outcome</strong><span>Judge the visible result, then inspect its prompt, provenance, and original source.</span></li><li><strong>Remix the prompt</strong><span>Edit what should change and copy the result into the product or agent you want to use.</span></li></ol></section>
    <section><h2>With $possible</h2><p>Give <code>$possible</code> your rough request. It finds relevant Outcomes, checks current primary sources, asks only questions that materially change the work, and shows you a new execution prompt. After you approve it, that complete prompt can be sent to a fresh subagent without hidden conversation history.</p></section>
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
    <section><h2>Author locally</h2><ol><li><strong>Create the folder</strong><span>Run <code>npx @fraylabs/possible@0.2.0 create my-outcome</code>.</span></li><li><strong>Write the human record</strong><span>Put the title, opening summary, and formatted explanation in <code>outcome.md</code>.</span></li><li><strong>Preserve the prompt</strong><span>Put the exact reusable execution prompt in <code>prompt.md</code>.</span></li><li><strong>Add provenance</strong><span>Record models, Products, Skills, requirements, author, timestamp, and file references in <code>outcome.json</code>.</span></li><li><strong>Validate</strong><span>Run <code>npx @fraylabs/possible@0.2.0 validate</code>.</span></li></ol></section>
    <section><h2>Publish publicly</h2><p>The create command adds the Outcome to the repository-root <code>outcomes.json</code> index. Commit the public GitHub repository and run <code>npx @fraylabs/possible@0.2.0 publish owner/repository</code>. Domain publishers expose that index at <code>/.well-known/possible/outcomes.json</code> and publish the HTTPS origin. Possible stores an immutable snapshot of every accepted revision.</p><a href="/publish">Publish a source →</a></section>
    <section><h2>Identity and labels</h2><p>A publisher-domain source is Official for that domain. GitHub sources are Community by default unless ownership of a referenced Skill follows directly from the repository. Authors cannot self-award another company’s identity.</p></section>
  </DocsLayout>;
}

export function DocsReferencePage() {
  return <DocsLayout active="reference" eyebrow="REFERENCE" title="Outcome reference" description="The public format keeps each prompt-to-result record small enough to inspect and reuse.">
    <section><h2>Required files</h2><div className="docs-table"><div><code>outcomes.json</code><span>Repository-root publisher identity and a thin list of Outcome manifest locations.</span></div><div><code>outcome.md</code><span>H1 title, opening summary, and optional formatted explanation.</span></div><div><code>prompt.md</code><span>The exact reusable execution prompt.</span></div><div><code>outcome.json</code><span>Schema version, slug, file pointers, author, models, authored timestamp, and requirements.</span></div></div></section>
    <section><h2>Optional metadata</h2><div className="docs-table"><div><code>products</code><span>Products meaningfully involved in the Outcome.</span></div><div><code>skills</code><span>GitHub Skill references with the last-reviewed commit.</span></div><div><code>inputs</code><span>Actual files supplied to the run.</span></div><div><code>artifacts</code><span>Actual files produced by the run and available to download.</span></div><div><code>preview</code><span>Representative images, video, audio, or CAD.</span></div></div></section>
    <section><h2>Machine interfaces</h2><ul><li><code>/outcomes/index.json</code> lists the directory.</li><li><code>/outcomes/&lt;slug&gt;.json</code> returns one Outcome.</li><li><code>/outcomes/&lt;slug&gt;/prompt.txt</code> returns the exact prompt.</li><li><code>/outcomes/&lt;slug&gt;/request.txt</code> returns the prior rough request when one exists.</li><li>The MCP exposes <code>list_outcomes</code>, <code>search_outcomes</code>, and <code>fetch_outcome</code>.</li></ul></section>
  </DocsLayout>;
}
