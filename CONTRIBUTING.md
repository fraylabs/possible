# Contributing to Possible

Possible accepts real request-to-result records with clear authorship and, optionally, media showing what they produced. Contributions use ordinary GitHub pull requests; there is no account system or separate submission registry.

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
  "schemaVersion": 2,
  "title": "A clear, specific result",
  "summary": "One sentence explaining the resulting work.",
  "originalPrompt": "The human's original request, verbatim.",
  "executionPrompt": "The complete prompt sent to the working agent.",
  "execution": {
    "provider": "OpenAI",
    "agent": "Codex",
    "model": "GPT-5.6",
    "timestamp": "2026-08-19T10:30:00+08:00"
  },
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

Do not add expectations, workstreams, lifecycle, trust, snapshots, commerce metadata, or compiler fields. If an instruction mattered to the result, it belongs directly in the execution prompt.

Publish only a prompt that was actually sent to a working agent. Preserve the original request verbatim and record the real provider, agent, model, and timestamp. Do not present a reconstructed or hypothetical prompt as the cause of an existing result. Never publish secrets, credentials, private personal information, or material you do not have the right to share.

## Preview media

Local media must be a direct child of the Outcome's `media/` folder and referenced by `outcome.json`. Unreferenced files fail generation. Images are limited to five; video, audio, and CAD are optional.

## Open a pull request

1. Add the Outcome folder.
2. Run `npm run outcomes:generate`.
3. Run `npm run check`.
4. Open a pull request explaining what the execution produced and confirming you have the right to publish both prompts and the media.

The maintainer reviews the request-to-result record, provenance, authorship, links, media rights, and whether the result is useful enough to list.
