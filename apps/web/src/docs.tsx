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
  return <DocsLayout active="overview" eyebrow="OVERVIEW" title="Possible is a directory of exact prompts" description="See what AI agents can make, inspect the result, and copy the prompt behind it.">
    <aside className="docs-callout docs-callout--info"><strong>THE SHORT VERSION</strong><p>Outcome = one exact prompt plus clear authorship. Products, Skills, and preview media are optional context.</p></aside>
    <section><h2>What Possible does</h2><ol><li><strong>Shows the result</strong><span>Images, video, audio, or CAD make the idea understandable before you copy anything.</span></li><li><strong>Preserves the prompt</strong><span>The prompt is published exactly as the author wrote it—no hidden compiler or execution framework.</span></li><li><strong>Credits what it uses</strong><span>Authors may link the Products and Skills involved without turning them into required platform ceremony.</span></li></ol></section>
    <section><h2>Optional Codex discovery skill</h2><p>You can browse Possible directly. The optional skill lets Codex search the same directory for you.</p><div className="docs-command"><header><strong>INSTALL</strong></header><pre><code>{installCommand}</code></pre><CopyButton label="Copy install command" value={installCommand} /></div></section>
    <nav className="docs-next"><span>NEXT</span><a href="/docs/how-to-use">How to use Possible <b>→</b></a></nav>
  </DocsLayout>;
}

export function HowToUsePage() {
  return <DocsLayout active="how-to-use" eyebrow="HOW TO USE" title="Find a result. Copy its prompt." description="Possible works as a website first; the optional skill provides the same discovery flow inside Codex.">
    <section><h2>On possible.sh</h2><ol><li><strong>Search in ordinary language</strong><span>Try “make a launch video,” “review this CAD,” or “build a playable game.”</span></li><li><strong>Open an Outcome</strong><span>Look at its preview, summary, author, and any named Products or Skills.</span></li><li><strong>Copy the exact prompt</strong><span>Use it as-is or change the concrete details that belong to your project.</span></li></ol></section>
    <section><h2>With $possible</h2><p>Ask <code>$possible</code> what agents can do. It searches Outcomes and returns the exact prompt you select. It does not execute the prompt unless you explicitly ask.</p></section>
    <nav className="docs-next"><span>NEXT</span><a href="/docs/authoring">Publish an Outcome <b>→</b></a></nav>
  </DocsLayout>;
}

export function AuthoringDocsPage() {
  return <DocsLayout active="authoring" eyebrow="PUBLISH" title="Share an Outcome" description="Add one small folder containing the exact prompt people can reuse and optional media that shows what it made.">
    <section><h2>Folder shape</h2><pre className="docs-code-block"><code>{`packages/catalog/src/outcomes/my-outcome/
  outcome.json
  media/          # optional`}</code></pre></section>
    <section><h2>The complete authored record</h2><pre className="docs-code-block"><code>{`{
  "schemaVersion": 1,
  "title": "A clear, specific result",
  "summary": "One sentence explaining what this prompt makes.",
  "prompt": "The exact prompt...",
  "author": { "name": "Your name", "url": "https://..." },
  "products": [],
  "skills": [],
  "preview": {}
}`}</code></pre><p>Only the first five fields are required. Omit optional fields when they do not add useful context.</p></section>
    <section><h2>Submit it</h2><ol><li><strong>Create the folder</strong><span>Use a lowercase hyphenated slug.</span></li><li><strong>Add optional preview media</strong><span>Up to five images, one video, one audio file, and CAD files may be referenced from <code>media/</code>.</span></li><li><strong>Run the checks</strong><span>Run <code>npm run outcomes:generate</code> and <code>npm run check</code>.</span></li><li><strong>Open a pull request</strong><span>No account system, export step, or separate submission record is required.</span></li></ol></section>
  </DocsLayout>;
}

export function DocsReferencePage() {
  return <DocsLayout active="reference" eyebrow="REFERENCE" title="Outcome reference" description="The public format is deliberately small so prompts remain easy to author, inspect, and reuse.">
    <section><h2>Required fields</h2><div className="docs-table"><div><code>title</code><span>The self-explanatory name of the result.</span></div><div><code>summary</code><span>A concise explanation of what the prompt produces.</span></div><div><code>prompt</code><span>The exact request shown and copied by users.</span></div><div><code>author</code><span>The author's display name and HTTPS link.</span></div></div></section>
    <section><h2>Optional fields</h2><div className="docs-table"><div><code>products</code><span>Official Products meaningfully involved in the outcome.</span></div><div><code>skills</code><span>GitHub Skill references the author reviewed.</span></div><div><code>preview</code><span>Representative images, video, audio, or CAD.</span></div></div></section>
    <section><h2>Machine interfaces</h2><ul><li><code>/outcomes/index.json</code> lists the directory.</li><li><code>/outcomes/&lt;slug&gt;.json</code> returns one Outcome.</li><li><code>/outcomes/&lt;slug&gt;/prompt.txt</code> returns the exact prompt.</li><li>The MCP exposes <code>list_outcomes</code>, <code>search_outcomes</code>, and <code>fetch_outcome</code>.</li></ul></section>
  </DocsLayout>;
}
