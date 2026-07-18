# Possible

**Skills are ingredients. Possible compiles the outcome.**

Skills.sh distributes individual agent skills. Possible publishes opinionated outcome packs: selected skills, workstream ownership, integration order, safety gates, and the definition of done for a complete result.

## Outcome packs

- **Hardware Launch** — launch site, programmatic film, prototype CAD, waitlist contract, and evidence report.
- **Software Launch** — production product, launch site, demo film, deployment plan, and evidence report.
- **Open-Source Release** — release-ready package, documentation, examples, hardened CI, changelog, and evidence report.

## Use Possible

Install the skill once:

```bash
npx @possible/cli init
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

The web surface keeps entry, understanding, discovery, and proof separate: `/` introduces the three-part Possible process, `/docs` documents the complete first-use and safety contract, `/packs` is the transparent gallery of recipes Possible may recommend, `/packs/:slug` explains one complete pack before confirmation, and `/demo` shows the illustrative intake followed by a preserved Hardware Launch execution.

## Trust boundary

Reviewed revisions record the snapshots Possible inspected. The generated Skills CLI commands resolve external repositories at install time; users must inspect the resolved skill contents. Packs never authorize deployment, spending, publishing, outreach, fabrication, data collection, or unsupported real-world claims.
