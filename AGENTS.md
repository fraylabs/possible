# Possible

Possible publishes typed Outcome Packs that combine reusable execution prompts, selected agent skills, sequencing, safeguards, and completion checks.

Before editing:

```bash
jj status
npm run packs:check
```

Keep bundled manifests in `packages/packs`; external authors keep theirs in their own pinned Git repositories and enter through `registry/`. The generated public catalog is the shared source for the website, static publications, MCP, and offline skill reference. Every addition must strengthen the outcome-pack contract.

A pack must expose every external source and reviewed revision, delegate by independent workstream, define integration and verification, and preserve approval gates for external actions. Do not claim reviewed revisions are install pins: the current Skills CLI commands resolve upstream repositories at install time.

For pack edits, verify with `npm run packs:check`. Run the full `npm run check` release gate only before handoff or CI; it includes the website build and all historical evidence suites. Preserve unrelated work and use Jujutsu for local history.
