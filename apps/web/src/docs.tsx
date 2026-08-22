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
  return <aside className="docs-sidebar" aria-label="Documentation navigation"><div className="docs-sidebar-title"><strong>Documentation</strong><span>GUIDE</span></div><nav><span>POSSIBLE</span>{links.map((link) => <a className={link.active === active ? "is-active" : undefined} href={link.href} key={link.href}>{link.label}</a>)}<a href="/#outcomes">Browse Outcomes ↗</a></nav></aside>;
}

function DocsLayout({ active, eyebrow, title, description, children }: { active: DocsPageKey; eyebrow: string; title: string; description: string; children: ReactNode }) {
  return <SiteShell className="docs-page"><DocsContextNavigation active={active} /><div className="docs-shell layout-wide"><DocsSidebar active={active} /><article className="docs-article"><div className="docs-breadcrumb"><a href="/docs">DOCS</a><span>/</span><strong>{eyebrow}</strong></div><header className="docs-title"><div className="docs-title-copy"><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p>{description}</p></div></header>{children}</article></div></SiteShell>;
}

export function DocsPage() {
  return <DocsLayout active="overview" eyebrow="OVERVIEW" title="Possible connects results, prompts, and sources" description="See what AI made, inspect the exact prompt connected to it, and remix the parts worth reusing.">
    <aside className="docs-callout docs-callout--info"><strong>THE SHORT VERSION</strong><p>Outcome = result + exact prompt + available provenance + original source.</p></aside>
    <section><h2>What Possible does</h2><ol><li><strong>Shows the result first</strong><span>Images, video, audio, or CAD make each possibility concrete.</span></li><li><strong>Preserves the prompt</strong><span>The prompt is published unchanged, not replaced with a retrospective recipe.</span></li><li><strong>Links the source</strong><span>Creator, product, model, date, and the canonical publication are shown whenever they are known.</span></li></ol></section>
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
  return <DocsLayout active="authoring" eyebrow="PUBLISH" title="Share an Outcome" description="Publish a real result, its exact prompt, available provenance, and an inspectable source.">
    <section><h2>Folder shape</h2><pre className="docs-code-block"><code>{`packages/catalog/src/outcomes/my-outcome/
  outcome.json
  media/          # optional previews
  inputs/         # optional files supplied to the run
  artifacts/      # optional files produced by the run`}</code></pre></section>
    <section><h2>The complete authored record</h2><pre className="docs-code-block"><code>{`{
  "schemaVersion": 2,
  "title": "A clear, specific result",
  "summary": "One sentence explaining the resulting work.",
  "executionPrompt": "The full prompt sent to the working agent.",
  "execution": {
    "provider": "OpenAI",
    "agent": "Codex",
    "model": "GPT-5.6",
    "timestamp": "2026-08-19T10:30:00+08:00"
  },
  "author": { "name": "Your name", "url": "https://..." }
}`}</code></pre><p>The prompt, provider, model, title, summary, and author are required. A prior request, agent, timestamp, source, Products, Skills, actual input files, downloadable artifacts, and preview media are optional. Instructions and requested deliverables belong in the prompt. External examples must link their original publication.</p></section>
    <section><h2>Submit it</h2><ol><li><strong>Start from a real run</strong><span>Do not publish a hypothetical prompt as though it produced an Outcome.</span></li><li><strong>Create the folder</strong><span>Use a lowercase hyphenated slug.</span></li><li><strong>Add optional preview media</strong><span>Up to five images, one video, one audio file, and CAD files may be referenced from <code>media/</code>.</span></li><li><strong>Run the checks</strong><span>Run <code>npm run outcomes:generate</code> and <code>npm run check</code>.</span></li><li><strong>Open a pull request</strong><span>No account system, export step, or separate submission record is required.</span></li></ol></section>
  </DocsLayout>;
}

export function DocsReferencePage() {
  return <DocsLayout active="reference" eyebrow="REFERENCE" title="Outcome reference" description="The public format keeps each prompt-to-result record small enough to inspect and reuse.">
    <section><h2>Required fields</h2><div className="docs-table"><div><code>title</code><span>The self-explanatory name of the result.</span></div><div><code>summary</code><span>A concise explanation of the resulting work.</span></div><div><code>executionPrompt</code><span>The exact prompt connected to the result.</span></div><div><code>execution</code><span>The provider and model; agent and timestamp may be added when known.</span></div><div><code>author</code><span>The creator or publisher's display name and HTTPS link.</span></div></div></section>
    <section><h2>Optional fields</h2><div className="docs-table"><div><code>originalPrompt</code><span>The prior rough request, preserved verbatim when one exists.</span></div><div><code>source</code><span>The canonical official or community publication and date.</span></div><div><code>products</code><span>Official Products meaningfully involved in the outcome.</span></div><div><code>skills</code><span>GitHub Skill references the author reviewed.</span></div><div><code>inputs</code><span>Actual files supplied to the run—not written prerequisites.</span></div><div><code>artifacts</code><span>Actual files produced by the run and available to download.</span></div><div><code>preview</code><span>Representative images, video, audio, or CAD.</span></div></div></section>
    <section><h2>Machine interfaces</h2><ul><li><code>/outcomes/index.json</code> lists the directory.</li><li><code>/outcomes/&lt;slug&gt;.json</code> returns one Outcome.</li><li><code>/outcomes/&lt;slug&gt;/prompt.txt</code> returns the exact prompt.</li><li><code>/outcomes/&lt;slug&gt;/request.txt</code> returns the prior rough request when one exists.</li><li>The MCP exposes <code>list_outcomes</code>, <code>search_outcomes</code>, and <code>fetch_outcome</code>.</li></ul></section>
  </DocsLayout>;
}
