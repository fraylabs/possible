# Possible

**Skills are ingredients. Possible compiles the outcome.**

Models know how to perform individual tasks. Possible gives Codex the operational knowledge to coordinate those tasks into a verified outcome. It is for solo developers and small technical teams building, launching, releasing, and operating software.

## Judge Quickstart

This five-minute path demonstrates installation, intake, recommendation, the approval gate, and the compiled execution contract. Completing the outcome takes longer and depends on the repository.

### Requirements

- [Codex](https://openai.com/codex/) with project skills enabled
- Node.js 22 or newer and npm/npx
- A disposable copy or clean worktree of a software repository
- Network access for the npm installer and the selected pack's repo-local ingredient skills

The package declares a cross-platform Node.js runtime. The recorded local runs in this repository were exercised on macOS; the repository also carries Linux-native build bindings, but Windows has not been independently verified here.

### Try it

From the repository you want Possible to work on:

```bash
npx @fraylabs/possible@0.1.6 init
```

`0.1.6` is the published package used by the controlled Possible run and includes the Open-Source Release judge path below. This checkout is the separately verified `0.1.7` candidate; until that version is published, judges testing the exact checkout can invoke its installer from another target repository with `node /absolute/path/to/possible/apps/cli/src/index.mjs init`.

Open or reload that repository in Codex, then enter:

```text
$possible
Prepare this repository for a local open-source release. It is for developers who need to install, understand, test, and contribute to it. Do not publish or make external changes.
```

Answer any material question, inspect the recommended **Open-Source Release** pack, and approve it only if its outputs and boundaries match your intent. After approval, inspect:

- `.possible/outcome-brief.md` — confirmed facts, constraints, interfaces, acceptance checks, and external-action gates;
- `.possible/pack.json` — the selected pack snapshot, outputs, workstreams, owners, and review lane;
- `.possible/skills-lock.json` — resolved ingredient sources and provenance;
- the final outcome receipt — artifacts plus passed, failed, skipped, and unproven checks.

The CLI has no dry-run command today. `init` installs three files under `.agents/skills/possible/`, refuses conflicting files instead of overwriting them, and is idempotent for an exact repeat. Before approval, `$possible` performs read-only intake and writes no project files.

### Fast evidence path

If you do not want to run a full outcome, inspect the preserved [Open-Source Release sample](apps/web/public/demo/tiny-slug/README.md), its [compiled state](apps/web/public/demo/tiny-slug/.possible/pack.json), [outcome receipt](apps/web/public/demo/tiny-slug/.possible/outcome-receipt.md), and [public Codex transcript](apps/web/public/demo/tiny-slug/CODEX-THREAD.md). The separate [Still Hardware Launch receipt](apps/web/public/demo/still/OUTCOME-RECEIPT.md) preserves the verification moment in which broken asset paths failed review, were repaired, and then passed. The controlled workflow pilot, exact results, evidence map, and limitations are in [PUBLIC-PROOF.md](benchmarks/outcome-v1/PUBLIC-PROOF.md).

### Troubleshooting

- **`possible` requires Node.js 22+** — check `node --version`, then rerun the installer.
- **Codex does not see `$possible`** — reload the project after installation. If `.possible/` state already exists, invoke `$possible resume`.
- **The installer reports a conflict** — it will not replace a different `.agents/skills/possible` tree; move or reconcile that path, then retry.
- **The MCP tools are unavailable** — the installed skill falls back to its bundled reviewed pack reference.
- **An ingredient skill is unavailable** — Possible stops and names it instead of silently imitating it.
- **A deploy, publish, push, purchase, outreach, schedule, or data-collection step appears** — pack approval does not authorize it; Possible must request separate approval for the exact external action.

## What Possible Adds to Codex

- **Outcome discovery and compilation:** a short intake selects one fitting outcome pack; the manifest supplies reviewed ingredients, bounded workstreams, ownership, guardrails, and verification, while the approved run writes outcome-specific acceptance checks into the shared brief.
- **Coordinated execution:** one captain protects the shared brief, delegates bounded named workstreams, integrates their artifacts, and preserves provenance and failures.
- **Completion by proof:** a fresh verification-only workstream checks the integrated result. Production is not completion; Possible stops only when the outcome passes—or returns an honest no-go receipt.

## Why This Is Not a Prompt Library

Possible's source of truth is a [typed outcome-pack manifest](packages/packs/src/types.ts), not a collection of long prompts. The [deterministic compiler](packages/packs/src/compiler.ts) groups install commands and renders the same ordered execution contract used by the web publications and read-only MCP tools. Each manifest records reviewed sources, owned workstreams, outputs, safety guardrails, and verification requirements. The installed workflow adds a confirmed definition of done, explicit external-action boundaries, a fresh verifier with no implementation ownership, repair-and-rerun behavior, and preserved evidence. [Compiler tests](packages/packs/test/compiler.test.mjs) check those contracts.

## Outcome packs

Lanes make the catalog easier to browse; they are never a question the user must answer during intake.

- **Create** — **Working Web App** produces a locally verified first usable product; **Playable Web Game** produces one polished, responsive Three.js game.
- **Launch** — **Hardware Launch** and **Software Launch** turn a product into a coherent public presentation and verified launch package.
- **Release** — **Open-Source Release** prepares a trustworthy distributable repository; **Production Web Release** takes a tested OpenAI Sites or Vercel app through a gated, reversible deployment or an honest no-go.
- **Operate** — **Web App Operations** runs a repeatable health, triage, maintenance, and recovery loop; **Marketing Operations** runs a repeatable positioning, campaign, draft-production, measurement, and review loop.

Operate packs are recurring by definition: a checklist alone is not enough. The first cycle must run, leave evidence, carry unresolved work forward, and name its next review date.

## Use Possible

Install the skill once:

```bash
npx @fraylabs/possible@0.1.6 init
```

The installer adds Possible to the current project without choosing a pack or creating a brief. Open or reload that project in Codex and invoke:

```text
$possible
```

Possible opens with a brainstorm. A rough idea is enough: it reflects what it heard, asks one useful question at a time, and creates no files during intake. Once the outcome is clear, it recommends and links one pack, explains the outputs and boundaries, and waits for direct confirmation. Only after the user says yes does it write the shared brief, install the listed repo-local ingredient skills, coordinate workstreams, integrate their artifacts, and assign a fresh verifier.

## The demo

`/demo` replays a real local Hardware Launch run for Still, a fictional palm-sized e-ink focus device. It shows the original brief, five installed skills, three parallel workstreams, the resulting website, launch film, prototype CAD, and the independent review that found and verified a real asset-path repair. The complete public Codex transcript is readable and copyable in the demo, and “Show output” jumps directly to the actual artifacts on the same page.

The artifacts section embeds the generated site and film, exposes the CAD downloads, and links directly to its evidence: 58/58 artifact checks, 50 successful browser responses, zero waitlist network writes, and the preserved initial failure trace.

Possible is the composition layer between capability discovery and accountable execution. A pack is named after a finished outcome, never a technology or visual style.

## Built During Build Week

The repository history provides an auditable product-reset boundary: commit [`afb5fc1`](https://github.com/fraylabs/possible/commit/afb5fc1c1e01d746753712ddc79f456df0984826) on 2026-07-18 changed Possible from a source-backed guide library into an outcome compiler. From that boundary through the current checked-out revision, the work added the typed pack registry and compiler, installable `$possible` skill and CLI, read-only MCP compilation tools, outcome catalog, recorded outcome demos and repair evidence, and the frozen workflow benchmark pilot.

The detailed before/after record, commit-range instructions, Codex evidence, human decision boundary, and remaining provenance limitation are in [BUILD-WEEK.md](BUILD-WEEK.md). The repository does **not** independently establish the official event eligibility start time or attest the exact model label for every development task; the submission owner must confirm those two facts against the Build Week account/session record rather than inferring them from Git.

## Repository

- `packages/packs` — typed manifests, registry, and deterministic compiler
- `apps/web` — interactive composer and static pack publications
- `apps/mcp` — read-only `list_packs` and `compile_pack` tools
- `skills/possible` — Codex workflow for safely choosing and running packs

## Verify

```bash
npm install
npm run check
```

Production builds emit `/packs/index.json`, plus JSON, install text, and run text for every pack.

The web surface keeps entry, understanding, discovery, and proof separate: `/` introduces the Possible process, `/proof` publishes the controlled pilot and preserved verification repair, `/docs` documents the complete first-use and safety contract, `/packs` is the expressive lane-filtered gallery of recipes Possible may recommend, `/packs/:slug` is the sober outcome specification with fit guidance, execution ownership, reviewed sources, raw publications, boundaries, and verification, and `/demo` shows the illustrative intake followed by preserved executions.

## Trust boundary

Reviewed revisions record the repo-skill snapshots Possible inspected. OpenAI Sites is represented separately as an optional agent plugin, never as a fake Skills CLI install; when available, launch and web-release packs can use it for an MVP deployment without a separate Vercel registration. The generated Skills CLI commands resolve external repositories at install time, so users must inspect the resolved instructions. Packs never authorize deployment, spending, publishing, outreach, fabrication, data collection, or unsupported real-world claims.
