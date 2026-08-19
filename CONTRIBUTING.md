# Contributing to Possible

Possible accepts exact prompts with clear authorship and, optionally, media showing what they produced. Contributions use ordinary GitHub pull requests; there is no account system or separate submission registry.

## Add an Outcome

Create:

```text
packages/catalog/src/outcomes/<slug>/
  outcome.json
  media/          # optional
```

Use a lowercase hyphenated slug. The required record is:

```json
{
  "schemaVersion": 1,
  "title": "A clear, specific result",
  "summary": "One sentence explaining what the prompt makes.",
  "prompt": "The exact prompt people will copy.",
  "author": {
    "name": "Your name",
    "url": "https://example.com"
  }
}
```

Optional fields:

- `products` — registered `company/product` identifiers meaningfully involved in the outcome;
- `skills` — a GitHub repository, directory containing `SKILL.md`, and the commit the author reviewed;
- `preview` — a description plus optional images, video, audio, or CAD.

See [outcome.schema.json](packages/catalog/src/outcome.schema.json) and any existing Outcome folder for the complete JSON shape.

Do not add expectations, workstreams, lifecycle, trust, evidence, snapshots, verification instructions, commerce metadata, or compiler fields. If an instruction matters to the result, write it directly in the prompt.

## Preview media

Local media must be a direct child of the Outcome's `media/` folder and referenced by `outcome.json`. Unreferenced files fail generation. Images are limited to five; video, audio, and CAD are optional.

## Open a pull request

1. Add the Outcome folder.
2. Run `npm run outcomes:generate`.
3. Run `npm run check`.
4. Open a pull request explaining what the prompt makes and confirming you have the right to publish the prompt and media.

The maintainer reviews the prompt, authorship, links, media rights, and whether the result is useful enough to list.
