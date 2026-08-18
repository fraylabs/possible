# Authoring Outcome Packs

An Outcome Pack is a small JSON contract for one reusable finished result. A pack is direction, not permission.

## Bundled folders

```text
src/packs/<slug>/
  pack.json          # required authored contract
  discovery.json     # four ordinary-language selection cases
  showcase.json      # optional presentation metadata
  media/             # optional local showcase files
```

The folder name is the slug. `pack.json` must not repeat it.

Everything derived from bundled folders is generated. Do not hand-edit generated manifests, bundled snapshots, bundled discovery output, public catalog references, or CLI skill snapshots.

```bash
npm run packs:generate
npm run pack:create -- my-outcome
npm run pack:remove -- my-outcome
```

Maintainer-owned trust lives in [`registry/bundled-trust.json`](../../registry/bundled-trust.json), outside pack folders. Accepted external packs remain in their authors' Git repositories and enter through exact source-pinned snapshots.

## The authored contract

The canonical schema is [`src/outcome-pack.schema.json`](src/outcome-pack.schema.json). Required fields are:

- `schemaVersion` — use `1`;
- `name` — name the finished outcome;
- `promise` — say in one sentence what success leaves the user with;
- `prompt` — supply a complete structured execution brief with only the useful context, deliverables, constraints, and stopping boundary;
- `expectations` — write a short array of observable checklist statements about the finished result, not verification procedures.

`skills` is optional. Add only the smallest necessary set using the GitHub `repository`, repository-relative `directory` containing `SKILL.md`, and exact `lastReviewedCommit` inspected by the author. Omit it when the agent needs no specialized capability.

`products` is optional. Use registered `company/product` identifiers to credit Products used by the outcome and expose their official links and access information. Product metadata never replaces a Skill, changes compilation, or authorizes a purchase.

`notFor` is optional. Add it only when a nearby request could otherwise select this pack incorrectly.

That is the entire pack. Do not add slug, version, visibility, lifecycle, category, source, trust, evidence, showcase, workstreams, outputs, guardrails, verification objects, plugins, schedules, prerequisites, commerce objects, or domain-specific contract keys. Useful instructions belong in `prompt`. Observable completion conditions belong in `expectations`. Company, link, and commerce data belong in the referenced Product record.

The compiler does only two things:

1. generates direct repository-directory install commands for any listed Skills;
2. appends the optional Skill names and required expectations checklist to the authored prompt.

It does not invent orchestration. At run time, the agent checks each expectation using the cheapest reliable method available and creates no extra verification artifacts unless an expectation, the risk, or the user requires them.

`lastReviewedCommit` identifies the exact Skill version reviewed by the pack author. Installation still uses the standard Skills CLI, which currently installs the named directory from the repository's live default branch. The agent must inspect the installed Skill and disclose drift instead of describing the installation as commit-pinned.

## Project-local packs

```text
.possible/packs/my-pack/pack.json
```

```text
possible pack init my-pack
possible pack validate my-pack
possible pack inspect my-pack
possible pack compile my-pack
possible pack export my-pack
```

`init` creates an incomplete template. The pack remains project-local unless explicitly exported and submitted.

## Optional showcase

`showcase.json` may add a description, up to five images, one MP4/WebM video, and one CAD group with optional GLB preview plus STEP/STL/3MF downloads. Local assets are direct children of `media/`. Showcase media is illustrative and never accepted run evidence.
