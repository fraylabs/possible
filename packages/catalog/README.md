# Possible Outcome contract

This package contains TypeScript types for the public Outcome contract. It contains neither canonical Outcomes nor separate Product or Skill records.

Publishers own Outcome files in their public repository or domain. Possible snapshots those sources into Convex, which is the runtime directory used by the website, CLI, and MCP.

The canonical machine format is [outcome.schema.json](src/outcome.schema.json). Products and Skills are lightweight Outcome attributions, not catalogs owned by Possible. Run `npm run test -w @possible/catalog` after changing the contract.


## Optional recipes (CLI 0.4.0)

Schema v4 Outcomes may include `recipe`. Existing manifests without it remain
valid and render as **Prompt only**. Schema v3 remains supported, including this
optional extension. Older CLI releases cannot validate the new field; use
the [CLI 0.4.0 release package](https://github.com/fraylabs/possible/releases/tag/v0.4.0) when authoring a recipe.

`models` continues to describe model provenance. `primary` and `secondary` remain
attribution fields; they do not imply that every attributed skill was used.
`recipe.skills` lists the skills actually used, each pinned to an exact commit.
All recipe fields are optional, but a supplied recipe must contain at least one
ingredient. Supplied arrays must be nonempty. Unknown ingredients should be omitted.

```json
{
  "recipe": {
    "agent": { "name": "Claude Code", "version": "recorded-version" },
    "skills": [{
      "repository": "publisher/skills",
      "directory": "skills/chart-design",
      "lastReviewedCommit": "0123456789abcdef0123456789abcdef01234567"
    }],
    "references": [{
      "kind": "document",
      "label": "Dataset documentation",
      "url": "https://example.com/data",
      "purpose": "Explains columns and units"
    }],
    "tools": [{ "name": "Python", "purpose": "Clean data and render the chart" }],
    "steps": [{
      "title": "Inspect the dataset",
      "instructions": "Check units and missing values before plotting.",
      "prompt": "Summarize the supplied CSV columns and flag missing values."
    }]
  }
}
```

This is an illustrative fragment, not a claim about a published Outcome. Replace
example names, links and pins with evidence from the actual creation process.
Reference kinds are `repository`, `document`, `image`, `web`, and `example`.
Reference URLs and optional agent/tool URLs must use HTTPS. Skills use the existing
`SkillReference` shape with a full 40- or 64-character hexadecimal commit.
Steps run in array order; `instructions` describes the action, and optional
`prompt` preserves a disclosed prompt or follow-up. Clearly label reconstructed
instructions; never present them as a transcript. Creator demos remain prompt-only
unless the creator disclosed more.

The directory API and MCP return `recipe` when available. Since CLI 0.6.0, plain
`possible fetch <id>` and `possible use <source>@<slug>` print the recipe text kit
when one exists and the exact prompt otherwise; `--prompt` prints only the prompt.
`fetch --json` includes the recipe alongside the prompt; `use --json` returns the
source document with `manifest.recipe`. The website makes Copy recipe the primary
action for recipe Outcomes and copies the same text kit; copying does not install
skills. CLI 0.5.0 can capture a local finished session.


## Recipe origin (CLI 0.5.0)

Optional `recipe.provenance` distinguishes `{ "method": "reconstructed" }` from
captured records. A captured record uses `method: "recorded"`, `source` (`claude-code`
or `codex`), `reviewedAt` (UTC ISO timestamp), and `reviewDigest` (SHA-256).
Use `possible capture review` and `capture export` to create these fields; never
claim an unreviewed session was approved. Optional `recipe.notes` is a nonempty
array of plain strings disclosing omissions and uncertainty. Existing recipes
without provenance remain valid and are labeled Published recipe; their origin
is unknown. Outcomes without any recipe remain Prompt only.

The digest covers canonical sorted-key manifest JSON (excluding reviewDigest),
a NUL separator, trimmed outcome.md, a NUL separator and trimmed prompt.md, with CRLF normalized to LF.
CLI 0.6.1 optionally records `provenance.files`: a nonempty list of `{path, size,
sha256}` for media/artifacts copied from a capture draft. Paths are relative to
the Outcome folder. This inventory is part of the manifest digest; local
validation also compares the bytes and exact file list. Limits are 16 MiB per
file, 64 MiB combined, 256 files, 512 entries and 16 directory levels.

Local and remote source readers reject recorded content changed after review.
This detects accidental edits; it is not an authenticated human signature.
The editable private capture draft is not an Outcome publisher and must not be
uploaded. See the root README for local source selection and creator review.
