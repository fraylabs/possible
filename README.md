# Possible

Possible.sh is an open-source library of Outcome Packs for AI agents.

People often know the outcome they want without knowing every task, decision, safeguard, or quality check it requires. An Outcome Pack combines a reusable execution prompt, selected agent skills, sequencing, safeguards, and completion checks for one class of outcomes.

`$possible` is the installed agent skill. It understands your request, recommends an Outcome Pack, and runs it in your project.

**Agent skills provide capabilities. Outcome Packs coordinate them toward a complete result.**

Possible.sh supports solo developers and small technical teams that create, launch, release, and operate software with Codex.

## Judge Quickstart

This five-minute path demonstrates installation, intake, recommendation, approval, and the generated execution prompt. Completing the outcome takes longer and depends on the repository.

### Requirements

- [Codex](https://openai.com/codex/) with project skills enabled
- Node.js 22 or newer and npm/npx
- A disposable copy or clean worktree of a software repository
- Network access for the npm installer and the selected Outcome Pack's repo-local agent skills

The package declares a cross-platform Node.js runtime. The recorded local runs in this repository were exercised on macOS; the repository also carries Linux-native build bindings, but Windows has not been independently verified here.

### Try it

From the repository you want `$possible` to work on:

```bash
npx @fraylabs/possible@0.1.7 init
```

`0.1.7` is the published package and contains the first twelve Outcome Packs. The controlled `$possible` pilot used `0.1.6`; this checkout is the separately verified `0.1.8` candidate that adds Web Presentation. Until `0.1.8` is published, judges testing the exact checkout can invoke its installer from another target repository with `node /absolute/path/to/possible/apps/cli/src/index.mjs init`.

Open or reload that repository in Codex, then enter:

```text
$possible
Prepare this repository for a local open-source release. It is for developers who need to install, understand, test, and contribute to it. Do not publish or make external changes.
```

Answer any material question. Inspect the recommended **Open-Source Release** Outcome Pack, then approve it only if its outputs and boundaries match your intent. After approval, inspect:

- `.possible/outcome-brief.md` — confirmed facts, constraints, interfaces, acceptance checks, and external-action gates;
- `.possible/pack.json` — the selected Outcome Pack snapshot, outputs, workstreams, owners, and verification workstream;
- `.possible/skills-lock.json` — resolved agent-skill sources and provenance;
- the final completion report — artifacts, evidence, status, and all passed, failed, skipped, or unproven checks.

The CLI has no dry-run command today. `init` installs three files under `.agents/skills/possible/`, refuses conflicting files instead of overwriting them, and is idempotent for an exact repeat. Before approval, `$possible` performs read-only intake and writes no project files.

### Fast evidence path

If you do not want to run a full outcome, inspect the preserved [Open-Source Release sample](apps/web/public/demo/tiny-slug/README.md), its [run state](apps/web/public/demo/tiny-slug/.possible/pack.json), [completion report](apps/web/public/demo/tiny-slug/.possible/outcome-receipt.md), and [public Codex transcript](apps/web/public/demo/tiny-slug/CODEX-THREAD.md). The separate [Still Hardware Launch completion report](apps/web/public/demo/still/OUTCOME-RECEIPT.md) preserves the verification moment in which broken asset paths failed review, were repaired, and then passed. The controlled workflow pilot, exact results, evidence map, and limitations are in [PUBLIC-PROOF.md](benchmarks/outcome-v1/PUBLIC-PROOF.md).

### Troubleshooting

- **`possible` requires Node.js 22+** — check `node --version`, then rerun the installer.
- **Codex does not see `$possible`** — reload the project after installation. If `.possible/` state already exists, invoke `$possible resume`.
- **The installer reports a conflict** — it will not replace a different `.agents/skills/possible` tree; move or reconcile that path, then retry.
- **The MCP tools are unavailable** — the installed skill falls back to its bundled reviewed Outcome Pack reference.
- **An agent skill is unavailable** — `$possible` stops and names it instead of silently imitating it.
- **A deploy, publish, push, purchase, outreach, schedule, or data-collection step appears** — approving an Outcome Pack run does not authorize it; `$possible` must request separate approval for the exact external action.

## What `$possible` Adds to Codex

- **Outcome discovery:** a short intake selects one fitting Outcome Pack. Its manifest supplies reviewed agent skills, bounded workstreams, ownership, safeguards, and verification.
- **Coordinated execution:** the run coordinator protects the shared brief, delegates named workstreams, integrates their artifacts, and preserves provenance and failures.
- **Completion by proof:** an independent verification workstream checks the integrated result. `$possible` stops when the outcome passes or returns an honest no-go completion report.

## What an Outcome Pack Contains

An Outcome Pack includes a reusable execution prompt, but its source of truth is a [typed manifest](packages/packs/src/types.ts). The [deterministic generator](packages/packs/src/compiler.ts) groups install commands and renders the ordered prompt used by the web publications and read-only MCP tools. Each manifest records reviewed sources, owned workstreams, outputs, safeguards, and verification requirements. The run adds project-specific completion checks, explicit external-action boundaries, independent verification, repair-and-rerun behavior, and preserved evidence. [Generator tests](packages/packs/test/compiler.test.mjs) check those contracts.

## Outcome Packs

Categories make the catalog easier to browse. The user does not need to choose one during intake.

- **Create** — **Working Web App** produces a locally verified first usable product; **Playable Web Game** produces one polished Three.js game; **Robot Prototype** produces a coherent simulation-backed digital prototype; **Web Presentation** produces an evidence-backed coded browser deck; **Billion-Dollar SaaS** expands a rough company ambition into an executable product, growth, revenue, trust, and operating system while keeping real revenue separate.
- **Launch** — **Hardware Launch** and **Software Launch** turn a product into a coherent public presentation; **Kickstarter Funding** adds feasibility, economics, rewards, proof, audience, campaign control, and payout evidence.
- **Release** — **Open-Source Release** prepares a trustworthy distributable repository; **Production Web Release** takes a tested OpenAI Sites or Vercel app through a gated, reversible deployment or an honest no-go.
- **Operate** — **Web App Operations** runs a repeatable health and recovery loop; **Marketing Operations** runs a repeatable marketing loop; **Kickstarter Fulfillment** coordinates a funded campaign through production and a privacy-safe 95%-shipped completion report.

Operate Outcome Packs are recurring by definition: a checklist alone is not enough. The first cycle must run, leave evidence, carry unresolved work forward, and name its next review date.

## Use `$possible`

Install the skill once:

```bash
npx @fraylabs/possible@0.1.7 init
```

The installer adds `$possible` to the current project without choosing an Outcome Pack or creating a brief. Open or reload that project in Codex and invoke:

```text
$possible
```

`$possible` opens with a brainstorm. A rough idea is enough. It reflects what it heard, asks one useful question at a time, and creates no files during intake. Once the outcome is clear, it recommends and links one Outcome Pack, explains the outputs and boundaries, and waits for direct confirmation. Only after the user says yes does it write the shared brief, install the selected repo-local agent skills, coordinate workstreams, integrate their artifacts, and assign independent verification.

## The demo

`/demo` replays a real local Hardware Launch run for Still, a fictional palm-sized e-ink focus device. It shows the original brief, five installed agent skills, three parallel workstreams, the resulting website, launch film, prototype CAD, and the independent review that found and verified a real asset-path repair. The complete public Codex transcript is readable and copyable in the demo, and “Show output” jumps directly to the actual artifacts on the same page.

The artifacts section embeds the generated site and film, exposes the CAD downloads, and links directly to its evidence: 58/58 artifact checks, 50 successful browser responses, zero waitlist network writes, and the preserved initial failure trace.

An Outcome Pack is named after a finished outcome, never a technology or visual style.

## Built During Build Week

The repository history provides an auditable product-reset boundary: commit [`afb5fc1`](https://github.com/fraylabs/possible/commit/afb5fc1c1e01d746753712ddc79f456df0984826) on 2026-07-18 introduced the current Outcome Pack architecture. From that boundary through the current checked-out revision, the work added the typed pack registry and compiler, installable `$possible` skill and CLI, read-only MCP compilation tools, outcome catalog, recorded outcome demos and repair evidence, and the frozen workflow benchmark pilot.

The detailed before/after record, commit-range instructions, Codex evidence, human decision boundary, and remaining provenance limitation are in [BUILD-WEEK.md](BUILD-WEEK.md). The repository does **not** independently establish the official event eligibility start time or attest the exact model label for every development task; the submission owner must confirm those two facts against the Build Week account/session record rather than inferring them from Git.

## Repository

- `packages/packs` — typed manifests, registry, and deterministic compiler
- `apps/web` — interactive composer and static Outcome Pack publications
- `apps/mcp` — read-only `list_packs` and `compile_pack` tools
- `skills/possible` — Codex workflow for safely choosing and running Outcome Packs

## Verify

```bash
npm install
npm run check
```

Production builds emit `/packs/index.json`, plus JSON, install text, and run text for every Outcome Pack.

The web surface keeps entry, understanding, discovery, and evidence separate. `/` introduces Possible.sh. `/presentation` is the coded visual explainer. `/benchmarks` compares one-prompt outcomes. `/docs` explains first use and safety. `/packs` is the category-filtered Outcome Pack gallery. `/packs/:slug` specifies fit, execution ownership, reviewed sources, boundaries, and verification. `/demo` opens the visual explainer alongside preserved runs and completion reports.

## Trust boundary

Reviewed revisions record the agent-skill snapshots `$possible` inspected. OpenAI Sites is represented separately as an optional agent plugin, never as a fake Skills CLI install. When available, launch and web-release Outcome Packs can use it for an MVP deployment without separate Vercel registration. Generated Skills CLI commands resolve external repositories at install time, so users must inspect the resolved instructions. Outcome Packs never authorize deployment, spending, publishing, outreach, fabrication, data collection, or unsupported real-world claims.
