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
  return <nav className="docs-context-nav" aria-label="Documentation sections"><div className="docs-context-nav-inner"><span>DOCS</span>{links.map((link) => <a className={link.active === active ? "is-active" : undefined} href={link.href} key={link.href}>{link.label}</a>)}</div></nav>;
}

function DocsSidebar({ active }: { active: DocsPageKey }) {
  return <aside className="docs-sidebar" aria-label="Documentation navigation"><div className="docs-sidebar-title"><strong>Documentation</strong><span>GUIDE</span></div><nav><span>POSSIBLE</span>{links.map((link) => <a className={link.active === active ? "is-active" : undefined} href={link.href} key={link.href}>{link.label}</a>)}<a href="/#outcomes">Browse Outcomes ↗</a></nav></aside>;
}

function DocsLayout({ active, eyebrow, title, description, children }: { active: DocsPageKey; eyebrow: string; title: string; description: string; children: ReactNode }) {
  return <SiteShell className="docs-page"><DocsContextNavigation active={active} /><div className="docs-shell"><DocsSidebar active={active} /><article className="docs-article"><div className="docs-breadcrumb"><a href="/docs">DOCS</a><span>/</span><strong>{eyebrow}</strong></div><header className="docs-title"><div className="docs-title-copy"><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p>{description}</p></div></header>{children}</article></div></SiteShell>;
}

export function DocsPage() {
  return <DocsLayout active="overview" eyebrow="OVERVIEW" title="Possible connects requests, prompts, and outcomes" description="See what somebody asked, inspect the complete prompt their agent received, and judge the result it produced.">
    <aside className="docs-callout docs-callout--info"><strong>THE SHORT VERSION</strong><p>Outcome = original prompt + full execution prompt + execution provenance + the resulting work.</p></aside>
    <section><h2>What Possible does</h2><ol><li><strong>Preserves the rough request</strong><span>The original prompt shows where the work actually began.</span></li><li><strong>Shows the full assignment</strong><span>The execution prompt is the complete one-shot prompt sent to the working agent, not a retrospective summary.</span></li><li><strong>Shows what happened</strong><span>Images, video, audio, or CAD let people inspect the resulting Outcome and see which agent, model, and timestamp produced it.</span></li></ol></section>
    <section><h2>Optional $possible skill</h2><p>The website shows prior work. The skill uses those Outcomes as precedent, gathers current information, asks only consequential questions, and prepares a new execution prompt for a fresh agent.</p><div className="docs-command"><header><strong>INSTALL</strong></header><pre><code>{installCommand}</code></pre><CopyButton label="Copy install command" value={installCommand} /></div></section>
    <nav className="docs-next"><span>NEXT</span><a href="/docs/how-to-use">How to use Possible <b>→</b></a></nav>
  </DocsLayout>;
}

export function HowToUsePage() {
  return <DocsLayout active="how-to-use" eyebrow="HOW TO USE" title="Start rough. Hand off complete." description="Browse prior Outcomes directly or let $possible turn a rough request into a self-contained prompt for a fresh agent.">
    <section><h2>On possible.sh</h2><ol><li><strong>Search in ordinary language</strong><span>Try “make a launch video,” “design a cat shelter,” or “create an editable deck.”</span></li><li><strong>Open an Outcome</strong><span>Compare the rough original request, full execution prompt, execution provenance, and visible result.</span></li><li><strong>Reuse good precedent</strong><span>Copy the execution prompt when it already fits, or give the Outcome to $possible as a starting point.</span></li></ol></section>
    <section><h2>With $possible</h2><p>Give <code>$possible</code> your rough request. It finds relevant Outcomes, checks current primary sources, asks only questions that materially change the work, and shows you a new execution prompt. After you approve it, that complete prompt can be sent to a fresh subagent without hidden conversation history.</p></section>
    <nav className="docs-next"><span>NEXT</span><a href="/docs/authoring">Publish an Outcome <b>→</b></a></nav>
  </DocsLayout>;
}

export function AuthoringDocsPage() {
  return <DocsLayout active="authoring" eyebrow="PUBLISH" title="Share an Outcome" description="Publish a real request, the complete prompt the working agent received, its execution provenance, and optional media showing the result.">
    <section><h2>Folder shape</h2><pre className="docs-code-block"><code>{`packages/catalog/src/outcomes/my-outcome/
  outcome.json
  media/          # optional`}</code></pre></section>
    <section><h2>The complete authored record</h2><pre className="docs-code-block"><code>{`{
  "schemaVersion": 2,
  "title": "A clear, specific result",
  "summary": "One sentence explaining the resulting work.",
  "originalPrompt": "The human's rough request, verbatim.",
  "executionPrompt": "The full prompt sent to the working agent.",
  "execution": {
    "provider": "OpenAI",
    "agent": "Codex",
    "model": "GPT-5.6",
    "timestamp": "2026-08-19T10:30:00+08:00"
  },
  "author": { "name": "Your name", "url": "https://..." },
  "products": [],
  "skills": [],
  "preview": {}
}`}</code></pre><p>The two prompts, provenance, title, summary, and author are required. Products, Skills, and preview media are optional.</p></section>
    <section><h2>Submit it</h2><ol><li><strong>Start from a real run</strong><span>Do not publish a hypothetical prompt as though it produced an Outcome.</span></li><li><strong>Create the folder</strong><span>Use a lowercase hyphenated slug.</span></li><li><strong>Add optional preview media</strong><span>Up to five images, one video, one audio file, and CAD files may be referenced from <code>media/</code>.</span></li><li><strong>Run the checks</strong><span>Run <code>npm run outcomes:generate</code> and <code>npm run check</code>.</span></li><li><strong>Open a pull request</strong><span>No account system, export step, or separate submission record is required.</span></li></ol></section>
  </DocsLayout>;
}

export function DocsReferencePage() {
  return <DocsLayout active="reference" eyebrow="REFERENCE" title="Outcome reference" description="The public format keeps the complete request-to-result record small enough to inspect and reuse.">
    <section><h2>Required fields</h2><div className="docs-table"><div><code>title</code><span>The self-explanatory name of the result.</span></div><div><code>summary</code><span>A concise explanation of the resulting work.</span></div><div><code>originalPrompt</code><span>The human's original request, preserved verbatim.</span></div><div><code>executionPrompt</code><span>The complete one-shot prompt sent to the working agent.</span></div><div><code>execution</code><span>The provider, agent, model, and ISO 8601 timestamp for that run.</span></div><div><code>author</code><span>The author's display name and HTTPS link.</span></div></div></section>
    <section><h2>Optional fields</h2><div className="docs-table"><div><code>products</code><span>Official Products meaningfully involved in the outcome.</span></div><div><code>skills</code><span>GitHub Skill references the author reviewed.</span></div><div><code>preview</code><span>Representative images, video, audio, or CAD.</span></div></div></section>
    <section><h2>Machine interfaces</h2><ul><li><code>/outcomes/index.json</code> lists the directory.</li><li><code>/outcomes/&lt;slug&gt;.json</code> returns one Outcome.</li><li><code>/outcomes/&lt;slug&gt;/original-prompt.txt</code> returns the rough request.</li><li><code>/outcomes/&lt;slug&gt;/execution-prompt.txt</code> returns the full agent assignment.</li><li>The MCP exposes <code>list_outcomes</code>, <code>search_outcomes</code>, and <code>fetch_outcome</code>.</li></ul></section>
  </DocsLayout>;
}
