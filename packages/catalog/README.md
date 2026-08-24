# Possible Outcome contract

This package contains TypeScript types for the public Outcome contract. It contains neither canonical Outcomes nor separate Product or Skill records.

Publishers own Outcome files in their public repository or domain. Possible snapshots those sources into Convex, which is the runtime directory used by the website, CLI, and MCP.

The canonical machine format is [outcome.schema.json](src/outcome.schema.json). Products and Skills are lightweight Outcome attributions, not catalogs owned by Possible. Run `npm run test -w @possible/catalog` after changing the contract.
