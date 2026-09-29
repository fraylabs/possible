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

The directory API and MCP return `recipe` when available. `possible fetch <id>
--json` includes it alongside the prompt; `possible use <source>@<slug> --json`
returns the source document with `manifest.recipe`. Without `--json`, both commands
still print the prompt. The website shows known ingredients and copies a text kit;
this phase does not install skills or capture sessions.
