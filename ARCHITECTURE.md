# Architecture

```text
packs/<slug>/pack.json
        │
        ├── compiler ── optional Skills install commands + executable prompt
        ├── registry ── identity + immutable source + trust + evidence
        ├── MCP ─────── search, inspect, and fetch the current catalog
        ├── $possible ─ recommend one pack, ask permission, then run it
        └── possible.sh / generated publications
```

## Outcome Pack

An authored `pack.json` contains only a name, promise, structured prompt, expectations checklist, optional repository- and directory-identified Skills with each `lastReviewedCommit`, and optional `notFor` boundaries. The folder name supplies the bundled slug. The compiler derives standard Skills installer commands only when Skills are present, then appends the checklist plus one proportional-check rule; it does not invent workstreams, state files, receipts, schedules, verification frameworks, or an orchestration graph.

## Catalog

Authorship and trust are separate. The registry owns identity, immutable source revision, content hash, status, and accepted evidence. Bundled and federated packs enter one catalog consumed by the MCP, website, and generated references. Changing catalog data does not require changing `$possible`.

## Discovery and execution

MCP search provides lexical candidates and conflict signals, not an automatic recommendation. `$possible` compares the complete pack—including its structured prompt and checklist—then recommends one fitting pack. After user approval, it saves the selected JSON, installs any listed Skills with the standard installer, applies the prompt, and checks each expectation using the cheapest reliable method available.

A pack is direction, never permission. External actions still require the authority demanded by the user, repository, tool, or environment.
