# Possible

Possible compiles existing skills into four outcome packs: Hardware Launch, Software Launch, Open-Source Release, and Playable Web Game.

Before editing:

```bash
jj status
npm run check
```

Keep the pack manifest in `packages/packs` as the single source for the website, static publications, MCP, and tests. Every addition must strengthen the outcome-pack contract.

A pack must expose every external source and reviewed revision, delegate by independent workstream, define integration and verification, and preserve approval gates for external actions. Do not claim reviewed revisions are install pins: the current Skills CLI commands resolve upstream repositories at install time.

Verify with `npm run check`. Preserve unrelated work and use Jujutsu for local history.
