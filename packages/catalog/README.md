# Possible reference catalog

This package contains static Product definitions, lightweight Skill links, and TypeScript types for the public Outcome contract. It does not contain canonical Outcomes.

Publishers own Outcome files in their public repository or domain. Possible snapshots those sources into Supabase, which is the runtime directory used by the website and MCP.

The canonical machine format is [outcome.schema.json](src/outcome.schema.json). Run `npm run test -w @possible/catalog` after changing Product, Skill, or contract definitions.
