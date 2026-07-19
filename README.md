# Possible

**Skills are ingredients. Possible compiles the outcome.**

Skills.sh distributes individual agent skills. Possible publishes opinionated outcome packs: selected skills, workstream ownership, integration order, safety gates, and the definition of done for a complete result.

## Outcome packs

Lanes make the catalog easier to browse; they are never a question the user must answer during intake.

- **Create** — **Working Web App** produces a locally verified first usable product; **Playable Web Game** produces one polished, responsive Three.js game.
- **Launch** — **Hardware Launch** and **Software Launch** turn a product into a coherent public presentation and verified launch package.
- **Release** — **Open-Source Release** prepares a trustworthy distributable repository; **Production Web Release** takes a tested OpenAI Sites or Vercel app through a gated, reversible deployment or an honest no-go.
- **Operate** — **Web App Operations** establishes a repeatable health, triage, maintenance, and recovery loop and executes its first dated cycle.

Operate packs are recurring by definition: a checklist alone is not enough. The first cycle must run, leave evidence, carry unresolved work forward, and name its next review date.

## Use Possible

Install the skill once:

```bash
npx @fraylabs/possible init
```

The installer adds Possible to the current project without choosing a pack or creating a brief. Open or reload that project in Codex and invoke:

```text
$possible
```

Possible opens with a brainstorm. A rough idea is enough: it reflects what it heard, asks one useful question at a time, and creates no files during intake. Once the outcome is clear, it recommends and links one pack, explains the outputs and boundaries, and waits for direct confirmation. Only after the user says yes does it write the shared brief, install the listed repo-local ingredient skills, coordinate workstreams, integrate their artifacts, and assign a fresh verifier.

## The demo

`/demo` replays a real local Hardware Launch run for Still, a fictional palm-sized e-ink focus device. It shows the original brief, five installed skills, three parallel workstreams, the resulting website, launch film, prototype CAD, and the independent review that found and verified a real asset-path repair. The complete public Codex transcript is readable and copyable in the demo, and “Show output” jumps directly to the actual artifacts on the same page.

The artifacts section embeds the generated site and film, exposes the CAD downloads, and links directly to its evidence: 58/58 artifact checks, 50/50 browser checks, zero waitlist network writes, and the preserved initial failure trace.

Possible is the composition layer between capability discovery and accountable execution. A pack is named after a finished outcome, never a technology or visual style.

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

The web surface keeps entry, understanding, discovery, and proof separate: `/` introduces the Possible process, `/docs` documents the complete first-use and safety contract, `/packs` is the expressive lane-filtered gallery of recipes Possible may recommend, `/packs/:slug` is the sober outcome specification with fit guidance, execution ownership, reviewed sources, raw publications, boundaries, and verification, and `/demo` shows the illustrative intake followed by preserved executions.

## Trust boundary

Reviewed revisions record the repo-skill snapshots Possible inspected. OpenAI Sites is represented separately as an optional agent plugin, never as a fake Skills CLI install; when available, launch and web-release packs can use it for an MVP deployment without a separate Vercel registration. The generated Skills CLI commands resolve external repositories at install time, so users must inspect the resolved instructions. Packs never authorize deployment, spending, publishing, outreach, fabrication, data collection, or unsupported real-world claims.
