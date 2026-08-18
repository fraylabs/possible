"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { draftPackExample, packFieldDemands } from "./authoring-content";
import { installCommand } from "./public-content";
import { approvalDisclosure, CopyButton, type CopyState, SiteFooter, SiteNav } from "./shared";

type DocsPageKey = "overview" | "how-to-use" | "outcome-packs" | "expectations" | "authoring" | "reference" | "glossary";
type DocsNavGroup = { label: string; links: Array<{ label: string; href: string; active?: DocsPageKey }> };
const docsNavGroups: DocsNavGroup[] = [
  {
    label: "GETTING STARTED",
    links: [
      { label: "Overview", href: "/docs", active: "overview" },
    ],
  },
  {
    label: "CORE CONCEPTS",
    links: [
      { label: "Outcome Packs", href: "/docs/outcome-packs", active: "outcome-packs" },
      { label: "Expectations & evidence", href: "/docs/expectations", active: "expectations" },
    ],
  },
  {
    label: "GUIDES",
    links: [
      { label: "How to use Possible", href: "/docs/how-to-use", active: "how-to-use" },
      { label: "Author an Outcome Pack", href: "/docs/authoring", active: "authoring" },
    ],
  },
  {
    label: "REFERENCE",
    links: [
      { label: "Project files & safety", href: "/docs/reference", active: "reference" },
      { label: "Glossary", href: "/docs/glossary", active: "glossary" },
    ],
  },
  {
    label: "EXPLORE",
    links: [
      { label: "Outcome Pack library ↗", href: "/#packs" },
    ],
  },
];

const glossaryTerms = [
  ["Outcome", "A specific end state the user wants to make true. One outcome can require many tasks."],
  ["Task", "One action taken toward an outcome. A task describes work; it does not define success."],
  ["Possible.sh", "The open-source Outcome Pack library, catalog search, documentation, and generated pack details."],
  ["$possible", "The installed agent skill that understands a request, recommends an Outcome Pack, and runs it after approval."],
  ["Outcome Pack", "A structured prompt and Expectations checklist for one class of finished results, plus optional Skills and Product attribution. It never becomes permission for external action."],
  ["Company", "The organization responsible for a Product listed by Possible."],
  ["Product", "A capability, service, framework, or API referenced by an Outcome Pack. Its record contains attribution, official links, and access information—not execution instructions or spending authority."],
  ["Structured prompt", "The organized reusable brief an Outcome Pack gives the agent. It holds only the useful context, deliverables, constraints, and stopping boundary; length is not a quality target."],
  ["Compiled prompt", "The deterministic prompt assembled from one approved Outcome Pack and frozen outcome brief."],
  ["Skill reference", "The GitHub repository and directory containing an optional specialized Skill, plus the exact commit last reviewed by the pack author."],
  ["Creative direction", "A project-specific visual system derived from its audience, product truth, evidence, assets, and constraints."],
  ["Presentation variation", "Reconsider how an outcome is expressed without changing its promised facts, product behavior, or definition of done. It belongs in the prompt and Expectations, not a separate pack schema."],
  ["Outcome Journey", "The retrospective sequence of outcomes completed for one ambition. It becomes visible only after each outcome is verified and the next is recommended from the new reality."],
  ["Listed pack", "A valid community submission that can be discovered but is not recommended by default. Authorship is not Possible verification."],
  ["Experimental pack", "A maintainer-reviewed Outcome Pack available to try before sufficient accepted run evidence exists."],
  ["Verified pack", "An Outcome Pack supported by accepted run evidence. The evidence proves only its recorded scope."],
  ["Agent skill", "A reusable capability that performs focused work during a run."],
  ["Run", "One approved Outcome Pack applied to one project."],
  ["Output", "An inspectable artifact or deliverable the run produces. An output is not itself proof that the promised outcome is true."],
  ["Outcome brief", "The durable record of confirmed intent, audience, current reality, constraints, gates, and unknowns."],
  ["Expectation", "One plain-language checklist statement describing what must be true before the pack's outcome is called finished. It is not an implementation task."],
  ["Evidence", "A preserved observation, file, measurement, test result, or review record linked to an expectation. Evidence supports a claim without replacing the underlying artifact."],
  ["Showcase", "Optional representative images, video, or CAD that help someone understand an Outcome Pack. Showcase media is illustrative, not run evidence or verification."],
  ["Verification", "The cheapest reliable check selected at run time to determine whether an expectation is true. It is execution behavior, not an Outcome Pack field or a required artifact framework."],
  ["Completion report", "The final evidence and status: artifacts created, checks passed or failed, limitations, unproven claims, and external actions not taken."],
  ["External action", "A real-world change—such as deploying, publishing, spending, outreach, or fabrication—that requires separate approval."],
] as const;

function DocsNavLinks({ active }: { active: DocsPageKey }) {
  return <>
    {docsNavGroups.map((group) => <nav key={group.label} aria-label={group.label.toLowerCase()}>
      <span>{group.label}</span>
      {group.links.map((link) => <a key={link.href} className={link.active === active ? "is-active" : undefined} href={link.href}>{link.label}</a>)}
    </nav>)}
  </>;
}

function DocsSidebar({ active }: { active: DocsPageKey }) {
  return (
    <aside className="docs-sidebar" aria-label="Documentation navigation">
      <div className="docs-sidebar-title"><strong>Documentation</strong><span>GUIDE</span></div>
      <DocsNavLinks active={active} />
      <details className="docs-mobile-menu">
        <summary>Browse docs <span>＋</span></summary>
        <DocsNavLinks active={active} />
      </details>
    </aside>
  );
}

const docsContextLinks: Array<{ label: string; href: string; active: DocsPageKey }> = [
  { label: "Overview", href: "/docs", active: "overview" },
  { label: "How to use", href: "/docs/how-to-use", active: "how-to-use" },
  { label: "Outcome Packs", href: "/docs/outcome-packs", active: "outcome-packs" },
  { label: "Expectations", href: "/docs/expectations", active: "expectations" },
  { label: "Authoring", href: "/docs/authoring", active: "authoring" },
  { label: "Reference", href: "/docs/reference", active: "reference" },
  { label: "Glossary", href: "/docs/glossary", active: "glossary" },
];

function DocsContextNav({ active }: { active: DocsPageKey }) {
  return (
    <nav className="docs-context-nav" aria-label="Documentation sections">
      <div className="docs-context-nav-inner">
        <span>DOCS</span>
        {docsContextLinks.map((link) => <a key={link.href} className={link.active === active ? "is-active" : undefined} href={link.href}>{link.label}</a>)}
      </div>
    </nav>
  );
}

function DocsCopyPageButton() {
  const [state, setState] = useState<CopyState>("idle");

  async function copyPage() {
    const article = document.querySelector<HTMLElement>(".docs-article");
    if (!article) return;
    try {
      await navigator.clipboard.writeText(article.innerText);
      setState("copied");
      window.setTimeout(() => setState("idle"), 1600);
    } catch {
      setState("failed");
    }
  }

  return (
    <button className="docs-copy-page" type="button" onClick={copyPage}>
      <span aria-hidden="true">▣</span>
      <span aria-live="polite">{state === "copied" ? "Copied" : state === "failed" ? "Copy failed" : "Copy page"}</span>
    </button>
  );
}

export function DocsPage() {
  return (
    <main className="docs-page">
      <SiteNav />
      <DocsContextNav active="overview" />

      <div className="docs-shell">
        <DocsSidebar active="overview" />

        <article className="docs-article">
          <div className="docs-breadcrumb"><a href="/docs">DOCS</a><span>/</span><strong>GETTING STARTED</strong></div>

          <header className="docs-title" id="overview">
            <div className="docs-title-copy">
              <p className="eyebrow">GETTING STARTED</p>
              <h1>Build complete outcomes with Possible</h1>
              <p>Possible is an open-source library of Outcome Packs for Codex. Install <code>$possible</code>, describe what you want to make, and compare fitting paths before any work begins.</p>
            </div>
            <DocsCopyPageButton />
          </header>

          <aside className="docs-callout docs-callout--info">
            <strong>THE SHORT VERSION</strong>
            <p>Install once. Describe the outcome in your own words. Possible helps clarify the target, shows fitting contracts, and waits for your choice and confirmation.</p>
          </aside>

          <section id="installation">
            <h2>Installation</h2>
            <p>Run the installer from the root of the project where you want to use Possible.</p>
            <div className="docs-command">
              <header><span>TERMINAL</span><strong>BASH</strong></header>
              <pre><code>{installCommand}</code></pre>
              <CopyButton label="Copy" value={installCommand} />
            </div>
            <p>The command installs three reviewed files under <code>.agents/skills/possible</code>. It does not select an Outcome Pack, install its agent skills, create outcome state, or modify unrelated skills.</p>
            <h3>Requirements</h3>
            <ul>
              <li>Node.js 22 or newer</li>
              <li>A project you can open in Codex</li>
              <li>Write access to the project&apos;s <code>.agents/skills</code> directory</li>
            </ul>
          </section>

          <section id="invoke">
            <h2>Invoke Possible</h2>
            <p>Open or reload the project in Codex, then invoke the installed skill.</p>
            <div className="docs-command docs-command--invoke">
              <header><span>CODEX</span><strong>PROMPT</strong></header>
              <pre><code>$possible</code></pre>
            </div>
            <p>Possible opens with a single question:</p>
            <blockquote>What would you like to make possible today? A rough idea is enough — we can brainstorm it together.</blockquote>
          </section>

          <section id="next">
            <h2>What happens next</h2>
            <p>Possible keeps the handoff explicit:</p>
            <ol>
              <li><strong>Clarify the outcome</strong><span>It reflects your intent and asks only the questions that materially change the result.</span></li>
              <li><strong>Compare fitting packs</strong><span>It shows their promises, trust, and different finish lines so you can choose.</span></li>
              <li><strong>Wait for your yes</strong><span>Only direct confirmation authorizes the disclosed repo-local run.</span></li>
            </ol>
            <a className="docs-text-link" href="/docs/how-to-use">Read the complete workflow →</a>
          </section>

          <section className="docs-overview-links" aria-labelledby="docs-overview-links-heading">
            <h2 id="docs-overview-links-heading">Continue with the concepts</h2>
            <div className="docs-card-grid docs-card-grid--two">
              <a href="/docs/outcome-packs"><span>CORE CONCEPT</span><strong>Outcome Packs</strong><p>Understand the reviewed contract that coordinates a complete run.</p></a>
              <a href="/docs/expectations"><span>CORE CONCEPT</span><strong>Expectations &amp; evidence</strong><p>Learn how Possible separates artifacts, proof, and verification.</p></a>
            </div>
          </section>

          <nav className="docs-next" aria-label="Next documentation page">
            <span>NEXT</span>
            <a href="/docs/how-to-use">How to use Possible <b>→</b></a>
          </nav>
        </article>

        <aside className="docs-toc" aria-label="On this page">
          <span>ON THIS PAGE</span>
          <a href="#installation">Installation</a>
          <a href="#invoke">Invoke Possible</a>
          <a href="#next">What happens next</a>
        </aside>
      </div>
      <SiteFooter />
    </main>
  );
}

export function HowToUsePage() {
  return (
    <main className="docs-page">
      <SiteNav />
      <DocsContextNav active="how-to-use" />

      <div className="docs-shell">
        <DocsSidebar active="how-to-use" />

        <article className="docs-article docs-how-to-use">
          <div className="docs-breadcrumb"><a href="/docs">DOCS</a><span>/</span><strong>HOW TO USE POSSIBLE</strong></div>

          <header className="docs-title" id="overview">
            <div className="docs-title-copy">
              <p className="eyebrow">USING POSSIBLE</p>
              <h1>How to use Possible</h1>
              <p>Possible.sh provides the Outcome Pack library. The installed <code>$possible</code> skill turns human intent into a coordinated, verifiable run.</p>
            </div>
            <DocsCopyPageButton />
          </header>

          <aside className="docs-role-summary" aria-label="Human and Possible responsibilities">
            <div><span>HUMAN</span><strong>Describe and decide.</strong><p>Choose the ambition, correct the understanding, confirm the proposed outcome, and approve consequential actions.</p></div>
            <div><span>POSSIBLE</span><strong>Search and coordinate.</strong><p>Clarify the outcome, show fitting paths, add specialized agent Skills when needed, integrate the work, and return evidence.</p></div>
          </aside>

          <section id="human">
            <h2>For the human</h2>
            <p>You do not need to understand Outcome Packs or write a complete specification before starting. Bring the ambition and the context only you can provide.</p>
            <ol className="docs-responsibility-list">
              <li><strong>Install Possible once</strong><span>From the project root, run <code>{installCommand}</code>, then open or reload the project in Codex.</span></li>
              <li><strong>Start the conversation</strong><span>Type <code>$possible</code>. No form, Outcome Pack name, or special prompt format is required.</span></li>
              <li><strong>Describe the ambition</strong><span>Say what you want to make, launch, or release in your own words. A rough idea is enough.</span></li>
              <li><strong>Supply essential context</strong><span>Answer the questions that materially change the result. Correct assumptions instead of accepting a polished misunderstanding.</span></li>
              <li><strong>Compare the choices</strong><span>Check each promise, finish line, trust status, assumptions, and actions that remain gated.</span></li>
              <li><strong>Select and confirm</strong><span>Choose the Outcome Pack you want, then say “yes, proceed” when its disclosed run is right.</span></li>
              <li><strong>Review the evidence</strong><span>Inspect the artifacts, verification results, limitations, and completion report. Approve any external action separately.</span></li>
              <li><strong>Decide what comes next</strong><span>Use the verified new reality—not an old roadmap—to review, revise, or reject Possible&apos;s next recommendation.</span></li>
            </ol>
          </section>

          <section id="bookmarks">
            <h2>Save useful packs locally</h2>
            <p>Bookmarks stay on your machine and do not require a Possible account. The installed skill checks them as your personal shortlist while still searching the complete public catalog.</p>
            <pre className="docs-code-block"><code>{`possible bookmark add fraylabs/possible/playable-web-game
possible bookmark list
possible bookmark remove fraylabs/possible/playable-web-game`}</code></pre>
          </section>

          <section id="possible">
            <h2>What Possible does</h2>
            <p>This behavior comes from the installed skill. You do not need to manually instruct the agent through these steps.</p>
            <ol className="docs-responsibility-list">
              <li><strong>Listen before selecting</strong><span><code>$possible</code> reflects the ambition and clarifies material unknowns before mentioning an Outcome Pack or beginning work.</span></li>
              <li><strong>Inspect what already exists</strong><span>When useful, it performs a read-only project check so the recommendation reflects the actual starting point.</span></li>
              <li><strong>Define the outcome</strong><span>It states the observable end condition, intended audience, constraints, expectations, assumptions, and unknowns.</span></li>
              <li><strong>Show fitting Outcome Packs</strong><span>It explains their finish lines, trust, and boundaries so the user can choose.</span></li>
              <li><strong>Wait for explicit confirmation</strong><span>A question, correction, reaction, or silence does not authorize execution.</span></li>
              <li><strong>Assemble the capabilities</strong><span>After approval, it installs any listed agent Skills and saves the exact Outcome Pack used for the run.</span></li>
              <li><strong>Run the prompt</strong><span>It uses the pack&apos;s reusable brief and any installed Skills with judgment instead of imposing a separate workflow.</span></li>
              <li><strong>Check before declaring success</strong><span>It reviews the integrated result against every expectation, repairs material failures when possible, and reports anything unresolved.</span></li>
              <li><strong>Search from the new reality</strong><span>Only after the outcome closes does it inspect what changed and search again when another outcome is requested.</span></li>
            </ol>
          </section>

          <section id="goal-and-possible">
            <h2>Use <code>/goal</code> and Possible together</h2>
            <p>They solve different parts of long-running agent work. Possible defines what a complete outcome requires; <code>/goal</code> keeps Codex pursuing it as the project and evidence change.</p>
            <div className="docs-goal-possible" aria-label="How Codex goals and Possible complement each other">
              <article>
                <span>/GOAL</span>
                <strong>Dynamic pursuit</strong>
                <p>Maintains momentum toward an objective, adapts the plan, and continues through new repository evidence.</p>
              </article>
              <article>
                <span>$POSSIBLE</span>
                <strong>Controlled outcome</strong>
                <p>Supplies the structured prompt, checklist, and any specialized Skills for one class of finished results.</p>
              </article>
              <footer><strong>TOGETHER</strong><p>Possible contributes operational judgment; <code>/goal</code> contributes persistence. Verified discoveries from a run can be reviewed into later Outcome Pack revisions, strengthening the reusable outcome without silently changing its contract.</p></footer>
            </div>
          </section>

          <section id="presentation-and-journey">
            <h2>Presentation variations and Outcome Journeys</h2>
            <p><strong>Presentation variation changes the expression.</strong> When taste is material, Possible can derive project-specific directions from the audience and product truth. That guidance belongs in the prompt and Expectations—not in a separate pack contract. The promised outcome and its checks stay fixed.</p>
            <p><strong>An Outcome Journey is visible only afterward.</strong> Possible completes and verifies one outcome, inspects the new reality, and searches again when another outcome is requested. It never fixes the future sequence in advance.</p>
          </section>

          <section id="handshake">
            <h2>The collaboration handshake</h2>
            <p>The handoff between human judgment and agent execution is explicit. Work begins only after the selected pack is understood and approved.</p>
            <ol className="docs-handshake" aria-label="Possible collaboration sequence">
              <li><span>YOU</span><strong>Ambition</strong></li>
              <li><span>POSSIBLE</span><strong>Clarified outcome</strong></li>
              <li><span>POSSIBLE</span><strong>Outcome Pack choices</strong></li>
              <li><span>YOU</span><strong>Selection and confirmation</strong></li>
              <li><span>AGENTS</span><strong>Execution</strong></li>
              <li><span>POSSIBLE</span><strong>Verification</strong></li>
              <li><span>TOGETHER</span><strong>Inspect new reality</strong></li>
            </ol>
          </section>

          <section id="approval">
            <h2>Approval has a boundary</h2>
            <p>Approving an Outcome Pack authorizes only the disclosed repo-local work. It does not grant open-ended autonomy or permission to change the outside world.</p>
            <aside className="docs-callout docs-callout--approval">
              <strong>OUTCOME PACK APPROVAL</strong>
              <p>{approvalDisclosure}</p>
            </aside>
            <aside className="docs-callout docs-callout--warning">
              <strong>SEPARATE YES REQUIRED</strong>
              <p>Deployment, publishing, spending, outreach, fabrication, data collection, credential use, private-data sharing, and unsupported public claims remain separately gated.</p>
            </aside>
          </section>

          <nav className="docs-next" aria-label="Next documentation page">
            <span>NEXT</span>
            <a href="/#packs">Explore Outcome Packs <b>→</b></a>
          </nav>
        </article>

        <aside className="docs-toc" aria-label="On this page">
          <span>ON THIS PAGE</span>
          <a href="#human">For the human</a>
          <a href="#bookmarks">Local bookmarks</a>
          <a href="#possible">What Possible does</a>
          <a href="#goal-and-possible">Use with /goal</a>
          <a href="#presentation-and-journey">Presentation variations and journeys</a>
          <a href="#handshake">The handshake</a>
          <a href="#approval">Approval boundary</a>
        </aside>
      </div>
      <SiteFooter />
    </main>
  );
}

type DocsTocItem = { label: string; href: string };

function DocsSimplePage({
  active,
  section,
  eyebrow,
  title,
  description,
  toc,
  next,
  children,
}: {
  active: DocsPageKey;
  section: string;
  eyebrow: string;
  title: string;
  description: string;
  toc: DocsTocItem[];
  next?: { label: string; href: string };
  children: ReactNode;
}) {
  return (
    <main className="docs-page">
      <SiteNav />
      <DocsContextNav active={active} />
      <div className="docs-shell">
        <DocsSidebar active={active} />
        <article className="docs-article docs-article--focused">
          <div className="docs-breadcrumb"><a href="/docs">DOCS</a><span>/</span><strong>{section}</strong></div>
          <header className="docs-title" id="overview">
            <div className="docs-title-copy">
              <p className="eyebrow">{eyebrow}</p>
              <h1>{title}</h1>
              <p>{description}</p>
            </div>
            <DocsCopyPageButton />
          </header>
          {children}
          {next ? <nav className="docs-next" aria-label="Next documentation page"><span>NEXT</span><a href={next.href}>{next.label} <b>→</b></a></nav> : null}
        </article>
        <aside className="docs-toc" aria-label="On this page">
          <span>ON THIS PAGE</span>
          {toc.map((item) => <a key={item.href} href={item.href}>{item.label}</a>)}
        </aside>
      </div>
      <SiteFooter />
    </main>
  );
}

export function OutcomePacksDocsPage() {
  return <DocsSimplePage
    active="outcome-packs"
    section="CORE CONCEPTS / OUTCOME PACKS"
    eyebrow="CORE CONCEPTS"
    title="Choose a complete outcome, not a pile of tasks."
    description="An Outcome Pack is one structured prompt and a plain-language Expectations checklist for one class of finished results, with specialized Skills only when needed."
    toc={[{ label: "What a pack is", href: "#what-is-a-pack" }, { label: "Pack anatomy", href: "#anatomy" }, { label: "Pack statuses", href: "#statuses" }, { label: "Choose and approve", href: "#choose" }]}
    next={{ label: "Expectations & evidence", href: "/docs/expectations" }}
  >
    <section id="what-is-a-pack">
      <h2>What an Outcome Pack is</h2>
      <p>A pack gives an agent a strong, reusable starting point for a result that would otherwise require the user to discover the right prompt and capabilities themselves. It is not permission or proof.</p>
      <div className="docs-callout docs-callout--info">
        <strong>THE CONTRACT</strong>
        <p>Every pack fixes the structured prompt that explains the work and the Expectations checklist that defines what finished means. It adds specialized Skills only when the outcome needs them.</p>
      </div>
      <div className="docs-card-grid" aria-label="What an Outcome Pack coordinates">
        <article><span>01 / PROMPT</span><strong>Structured execution brief</strong><p>The organized instructions, useful context, deliverables, constraints, and stopping boundary—only as long as the outcome requires.</p></article>
        <article><span>02 / EXPECTATIONS</span><strong>Completion checklist</strong><p>Plain-language statements that must be true before the result is called finished.</p></article>
        <article><span>03 / OPTIONAL SKILLS</span><strong>Specialized capabilities</strong><p>GitHub repositories and Skill directories added only when needed, with each last-reviewed commit recorded.</p></article>
      </div>
    </section>

    <section id="anatomy">
      <h2>Pack anatomy</h2>
      <p>Every public pack page exposes the same contract so you can inspect the fit before approving it.</p>
      <div className="docs-table" role="table" aria-label="Outcome Pack anatomy">
        <div role="row"><strong role="columnheader">Part</strong><strong role="columnheader">What to inspect</strong></div>
        <div role="row"><code role="cell">Promise</code><span role="cell">The finished result the pack claims it can help produce.</span></div>
        <div role="row"><code role="cell">Prompt</code><span role="cell">The complete structured brief the agent will follow.</span></div>
        <div role="row"><code role="cell">Skills</code><span role="cell">Optional specialized capabilities, their install sources, and the commits last reviewed by the pack author.</span></div>
        <div role="row"><code role="cell">Products</code><span role="cell">Optional attribution and access metadata for Products used by the outcome. Products never replace Skills or authorize a purchase.</span></div>
        <div role="row"><code role="cell">Expectations</code><span role="cell">The checklist used to decide whether the result is finished.</span></div>
        <div role="row"><code role="cell">Not for</code><span role="cell">Optional nearby requests that should select another pack.</span></div>
      </div>
    </section>

    <section id="statuses">
      <h2>Pack statuses</h2>
      <p>Status records Possible maintainer trust and accepted evidence for the contract. It does not change the scope of approval or make an unverified claim true.</p>
      <div className="docs-status-list">
        <div><span className="docs-status-dot docs-status-dot--listed">LISTED</span><strong>Listed</strong><p>A valid submission that is discoverable but not recommended by default. Authors cannot self-award Possible trust.</p></div>
        <div><span className="docs-status-dot docs-status-dot--experimental">EXPERIMENTAL</span><strong>Experimental</strong><p>Maintainer-reviewed and available to try while sufficient accepted run evidence is still being built.</p></div>
        <div><span className="docs-status-dot docs-status-dot--verified">VERIFIED</span><strong>Verified</strong><p>Supported by accepted run evidence. Inspect that evidence before relying on a claim outside its recorded scope.</p></div>
      </div>
    </section>

    <section id="choose">
      <h2>Choose and approve</h2>
      <p>Start with <code>$possible</code> and describe the ambition in your own words. Possible searches saved and public packs, shows fitting finish lines, and lets you select the contract before it presents the checklist, any listed Skills, and what remains unauthorized.</p>
      <p>Do not approve a pack because its label sounds close. Correct the understanding until the outcome, constraints, and evidence boundary match what you actually want to make true.</p>
      <a className="docs-reference-link" href="/#packs"><span>LIBRARY</span><strong>Browse active Outcome Packs</strong><i>Open the gallery →</i></a>
    </section>
  </DocsSimplePage>;
}

export function AuthoringDocsPage() {
  return <DocsSimplePage
    active="authoring"
    section="GUIDES / AUTHORING OUTCOME PACKS"
    eyebrow="GUIDE"
    title="Write the contract in JSON."
    description="Author one bounded outcome as strict JSON, prove it locally, and submit an exact Git-pinned snapshot without assigning your own trust."
    toc={[{ label: "Where packs live", href: "#where" }, { label: "Minimal shape", href: "#shape" }, { label: "Field demands", href: "#fields" }, { label: "Optional showcase", href: "#showcase" }, { label: "Authoring workflow", href: "#workflow" }, { label: "Publish through Git", href: "#publish" }, { label: "Trust boundary", href: "#review" }]}
    next={{ label: "Expectations & evidence", href: "/docs/expectations" }}
  >
    <section id="where">
      <h2>Where packs live</h2>
      <p>Keep project-local packs inside the project that owns them. MCP only distributes accepted catalog snapshots; it never discovers or writes local packs.</p>
      <pre className="docs-code-block"><code>{`.possible/
  packs/
    my-pack/
      pack.json
      README.md`}</code></pre>
      <div className="docs-callout docs-callout--info">
        <strong>CONTRACT, NOT PERMISSION</strong>
        <p>A pack can describe approval gates and guardrails, but its existence never authorizes deployment, publishing, spending, outreach, fabrication, or access to private data.</p>
      </div>
    </section>

    <section id="shape">
      <h2>Minimal shape</h2>
      <p>Use strict JSON. The local validator checks the schema and semantic relationships before the compiler sees the pack.</p>
      <pre className="docs-code-block"><code>{draftPackExample}</code></pre>
      <p>Fill the two required primitives: write the structured prompt and state each expectation as a sentence a reviewer can mark true or unresolved. Add Skills only when the outcome needs specialized capabilities. Reference a Product only when attribution or access information helps the user understand the outcome.</p>
    </section>

    <section id="fields">
      <h2>Field demands</h2>
      <p>Every field has one job. The compiler uses the standard Skills installer and appends the checklist plus one proportional-check rule; it does not invent a workflow or verification framework. Keep useful execution guidance in <code>prompt</code> rather than inventing new manifest keys.</p>
      <div className="docs-table" role="table" aria-label="Outcome Pack field demands">
        <div role="row"><strong role="columnheader">Field</strong><strong role="columnheader">What it must answer</strong></div>
        {packFieldDemands.map((field) => <div role="row" key={field.name}><code role="cell">{field.name}</code><span role="cell">{field.description}</span></div>)}
      </div>
    </section>

    <section id="showcase">
      <h2>Optional outcome showcase</h2>
      <p>A pack can remain entirely text-only. When representative work materially improves understanding, add a sibling <code>showcase.json</code>: an optional description, up to five images, one video, and one CAD group with a GLB preview and STEP, STL, or 3MF downloads.</p>
      <pre className="docs-code-block"><code>{`packs/my-pack/
  pack.json
  discovery.json
  showcase.json
  media/`}</code></pre>
      <div className="docs-callout docs-callout--warning"><strong>SHOWCASE IS NOT PROOF</strong><p>Showcase media demonstrates the shape of a possible outcome. Artifacts belong to a specific run, evidence tests that run against its expectations, and only accepted run evidence can support verified catalog status.</p></div>
    </section>

    <section id="workflow">
      <h2>Authoring workflow</h2>
      <ol>
        <li><strong>Create a draft</strong><span><code>possible pack init my-pack</code> creates the local directory and intentionally incomplete starter manifest.</span></li>
        <li><strong>Name the result</strong><span>Write a specific name and one-sentence promise that a person can understand without knowing Possible.</span></li>
        <li><strong>Write the structured prompt</strong><span>Organize only the context, deliverables, constraints, and stopping boundary the agent actually needs. Avoid verbosity targets and orchestration boilerplate.</span></li>
        <li><strong>Add Skills only when needed</strong><span>If the outcome needs specialized capabilities, choose the smallest necessary set and record each GitHub repository, repository-relative directory containing <code>SKILL.md</code>, and exact commit you last reviewed.</span></li>
        <li><strong>Credit Products when useful</strong><span>Reference registered <code>company/product</code> identifiers only for attribution, official links, and access information. Keep execution in the prompt and Skills.</span></li>
        <li><strong>Write the checklist</strong><span>Make every expectation an observable sentence about the finished result, not an implementation task.</span></li>
        <li><strong>Validate and compile</strong><span>Run <code>possible pack validate my-pack</code>, then <code>possible pack compile my-pack</code> to inspect exactly what the agent receives.</span></li>
        <li><strong>Export for public review</strong><span><code>possible pack export my-pack</code> prepares the valid contract without publishing or granting Possible trust.</span></li>
      </ol>
    </section>

    <section id="publish">
      <h2>Publish through Git</h2>
      <p>Public authors keep the canonical <code>pack.json</code> in their own GitHub repository. Possible stores only a small source record, the exact accepted bytes, and separately maintained trust evidence. No account or submission database is required.</p>
      <p>Possible's bundled library uses one source folder per pack: <code>packages/packs/src/packs/&lt;slug&gt;/</code> contains <code>pack.json</code> and four discovery examples. The catalog, website, MCP, snapshots, and offline reference are generated from those folders.</p>
      <ol>
        <li><strong>Pin your source</strong><span>Commit the exported contract, then rerun <code>possible pack export</code> with its GitHub repository, full commit SHA, and repository-relative manifest path.</span></li>
        <li><strong>Add provenance</strong><span>Copy the generated <code>source-entry.json</code> and content-addressed <code>pack.json</code> snapshot into the registry paths named by <code>SUBMISSION.md</code>.</span></li>
        <li><strong>Regenerate discovery</strong><span>Run <code>npm run registry:sync</code>. Commit the generated catalog and offline skill references; never hand-edit them.</span></li>
        <li><strong>Open a pull request</strong><span>Focused CI fetches the pinned public commit and proves its bytes, hash, schema, and snapshot agree.</span></li>
      </ol>
      <div className="docs-callout docs-callout--info"><strong>AUTHORSHIP IS NOT TRUST</strong><p>A merged valid submission becomes listed. Only Possible maintainers can make it experimental or verified; verified requires accepted run evidence.</p></div>
    </section>

    <section id="review">
      <h2>Trust stays outside the pack</h2>
      <div className="docs-card-grid docs-card-grid--two" aria-label="Pack source and trust">
        <article><span>AUTHOR</span><strong>Owns the contract</strong><p>The author owns the prompt, expectations, optional Skills, Product references, and optional non-scope in their Git repository.</p></article>
        <article><span>POSSIBLE</span><strong>Owns catalog trust</strong><p>The registry records identity, exact revision, content hash, status, and accepted evidence separately.</p></article>
      </div>
      <p>Export preserves the exact source provenance and content hash. It never silently publishes the pack or lets an author assign their own trust.</p>
      <a className="docs-reference-link" href="/docs/reference"><span>REFERENCE</span><strong>Inspect project files & safety</strong><i>Read the boundary →</i></a>
    </section>
  </DocsSimplePage>;
}

export function ExpectationsDocsPage() {
  return <DocsSimplePage
    active="expectations"
    section="CORE CONCEPTS / EXPECTATIONS & EVIDENCE"
    eyebrow="CORE CONCEPTS"
    title="The artifact is not the proof."
    description="Expectations are the pack's plain-language definition of done. Evidence and review determine whether each checklist statement is actually true."
    toc={[{ label: "The four layers", href: "#layers" }, { label: "Write a useful checklist", href: "#activation" }, { label: "A proportional check", href: "#review" }, { label: "Completion report", href: "#record" }]}
    next={{ label: "Project files & safety", href: "/docs/reference" }}
  >
    <section id="layers">
      <h2>The four layers</h2>
      <p>Keeping these terms separate prevents a polished deliverable from being mistaken for a completed outcome.</p>
      <ol className="docs-handshake docs-concept-steps" aria-label="Outcome proof layers">
        <li><span>OUTPUT</span><strong>The inspectable artifact</strong></li>
        <li><span>EXPECTATION</span><strong>What must become true</strong></li>
        <li><span>EVIDENCE</span><strong>What was observed or preserved</strong></li>
        <li><span>VERIFICATION</span><strong>Why the claim can be trusted</strong></li>
      </ol>
      <div className="docs-outcome-example" aria-label="Output and expectation example">
        <div><span>OUTPUT</span><p>A responsive launch page with a working conversion flow.</p></div>
        <div><span>EXPECTATION</span><p>The confirmed audience can complete the flow on supported screen sizes, approved claims are used, and accessibility checks pass.</p></div>
      </div>
    </section>

    <section id="activation">
      <h2>Write a useful checklist</h2>
      <p>Every authored expectation is a required checklist item. Keep it observable and about the finished result; the structured prompt owns the work used to reach it, while the agent chooses the cheapest reliable way to check it.</p>
      <div className="docs-card-grid docs-card-grid--two" aria-label="Expectation activation levels">
        <article><span>GOOD</span><strong>Observable end state</strong><p>“A new viewer can explain what the product does after one viewing.”</p></article>
        <article><span>AVOID</span><strong>Task or test procedure</strong><p>“Open Chrome at 390px, capture a screenshot, and write a review JSON file.”</p></article>
      </div>
    </section>

    <section id="review">
      <h2>How proportional verification works</h2>
      <ol>
        <li><strong>Read the expectation</strong><span>Identify the observable claim that must be true, without turning it into a prescribed workflow.</span></li>
        <li><strong>Choose the cheapest reliable check</strong><span>Use a render, browser check, test, measurement, review, or observation only when it materially establishes the claim.</span></li>
        <li><strong>Repair material failures</strong><span>Repeat only the affected check after a repair instead of restarting an unrelated audit.</span></li>
        <li><strong>Report honestly</strong><span>Mark the expectation passed, unmet, or unverified and create no extra verification artifact unless the expectation, risk, or user requires it.</span></li>
      </ol>
    </section>

    <section id="record">
      <h2>Completion report</h2>
      <p>The agent returns the result plus the checklist marked passed, unmet, or unverified, important limitations, and any external actions it deliberately did not take. Possible does not require a bespoke receipt schema, hashes, ledgers, screenshots, or reports unless the outcome independently needs them.</p>
      <aside className="docs-callout docs-callout--approval">
        <strong>COMPLETION REPORT</strong>
        <p>The final report says what was produced, what was checked, what remains unproven, and which external actions were intentionally not taken.</p>
      </aside>
    </section>
  </DocsSimplePage>;
}

export function DocsReferencePage() {
  return <DocsSimplePage
    active="reference"
    section="REFERENCE / PROJECT FILES & SAFETY"
    eyebrow="REFERENCE"
    title="Keep the selected pack inspectable."
    description="Possible saves the exact pack used after confirmation. It does not require a project-management file tree or bespoke receipt format."
    toc={[{ label: "Project files", href: "#files" }, { label: "Safety boundary", href: "#safety" }, { label: "Troubleshooting", href: "#troubleshooting" }]}
    next={{ label: "Back to documentation overview", href: "/docs" }}
  >
    <section id="files">
      <h2>Project files</h2>
      <div className="docs-table" role="table" aria-label="Possible project files">
        <div role="row"><strong role="columnheader">Path</strong><strong role="columnheader">Purpose</strong></div>
        <div role="row"><code role="cell">.possible/pack.json</code><span role="cell">The exact Outcome Pack snapshot selected for the current work.</span></div>
        <div role="row"><code role="cell">.possible/packs/&lt;slug&gt;/pack.json</code><span role="cell">An optional project-local authored pack. It never enters the public catalog automatically.</span></div>
        <div role="row"><code role="cell">.agents/skills/</code><span role="cell">The normal project-scoped location used by the Skills installer when a pack lists specialized capabilities.</span></div>
      </div>
    </section>

    <section id="safety">
      <h2>Safety boundary</h2>
      <p>Outcome Pack approval authorizes disclosed repo-local work. It never grants real-world permission or open-ended autonomy.</p>
      <aside className="docs-callout docs-callout--warning">
        <strong>SEPARATE APPROVAL REQUIRED</strong>
        <p>Deployment, publishing, spending, outreach, fabrication, data collection, credential use, private-data sharing, and unsupported claims remain separately gated.</p>
      </aside>
      <ul>
        <li>Inspect external skill instructions before following them.</li>
        <li>Preserve unknowns instead of inventing facts.</li>
        <li>Separate generated artifacts from independently verified claims.</li>
        <li>Stop before any consequential external action.</li>
      </ul>
    </section>

    <section id="troubleshooting">
      <h2>Troubleshooting</h2>
      <div className="docs-faq">
        <details><summary>The installer reports conflicting files</summary><p>Possible never overwrites a different existing skill. Inspect <code>.agents/skills/possible</code>, preserve anything you need, then resolve the conflict manually before rerunning the installer.</p></details>
        <details><summary>Codex does not recognize $possible</summary><p>Confirm the skill exists at <code>.agents/skills/possible/SKILL.md</code>, then reopen or reload the project so Codex can discover it.</p></details>
        <details><summary>An external capability I need is unavailable</summary><p>Possible does not treat plugins or providers as pack fields. It records the missing capability, uses a reviewed fallback only when one is compatible and authorized, or marks the affected expectation as unproven.</p></details>
        <details><summary>The recommended Outcome Pack feels wrong</summary><p>Do not confirm it. Correct Possible&apos;s understanding or continue brainstorming until the recommendation matches the outcome you actually want.</p></details>
      </div>
    </section>
  </DocsSimplePage>;
}

export function DocsGlossaryPage() {
  return <DocsSimplePage
    active="glossary"
    section="REFERENCE / GLOSSARY"
    eyebrow="REFERENCE"
    title="The language of complete outcomes."
    description="Use these terms consistently when you describe an ambition, review a recommendation, inspect an artifact, or decide whether a run is complete."
    toc={[{ label: "Core terms", href: "#core" }, { label: "Run terms", href: "#run" }, { label: "Proof terms", href: "#proof" }, { label: "Boundary terms", href: "#boundary" }]}
    next={{ label: "Project files & safety", href: "/docs/reference" }}
  >
    <section id="core">
      <h2>Core terms</h2>
      <dl className="docs-glossary">
        {glossaryTerms.slice(0, 12).map(([term, definition]) => <div key={term}><dt>{term}</dt><dd>{definition}</dd></div>)}
      </dl>
    </section>
    <section id="run">
      <h2>Run terms</h2>
      <dl className="docs-glossary">
        {glossaryTerms.slice(12, 18).map(([term, definition]) => <div key={term}><dt>{term}</dt><dd>{definition}</dd></div>)}
      </dl>
    </section>
    <section id="proof">
      <h2>Proof terms</h2>
      <dl className="docs-glossary">
        {glossaryTerms.slice(18, 24).map(([term, definition]) => <div key={term}><dt>{term}</dt><dd>{definition}</dd></div>)}
      </dl>
    </section>
    <section id="boundary">
      <h2>Boundary term</h2>
      <dl className="docs-glossary">
        {glossaryTerms.slice(24).map(([term, definition]) => <div key={term}><dt>{term}</dt><dd>{definition}</dd></div>)}
      </dl>
      <aside className="docs-callout docs-callout--warning">
        <strong>WHEN IN DOUBT</strong>
        <p>Ask whether you are naming an outcome, describing an output, preserving evidence, or authorizing an external action. Those are different things.</p>
      </aside>
    </section>
  </DocsSimplePage>;
}
