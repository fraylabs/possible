# Contributing to Possible

Publishers keep canonical Outcomes in their own public GitHub repository or domain. Possible does not accept Outcome folders into this repository and does not require a publisher account.

## Author one Outcome

```bash
npx @fraylabs/possible@0.3.0 create my-outcome
```

This creates the public contract:

```text
outcomes.json
outcomes/my-outcome/
  outcome.json
  outcome.md
  prompt.md
  media/       optional
  inputs/      optional
  artifacts/   optional
```

- `outcome.md` contains one H1 title, an opening summary, and the human explanation.
- `prompt.md` contains the exact reusable execution prompt.
- `outcome.json` contains models, Products, Skills, requirements, provenance, and referenced files.

Publish only a prompt genuinely connected to the result. Record only known provenance and material you have the right to share. Never publish secrets or private personal information.

## Validate and publish

```bash
npx @fraylabs/possible@0.3.0 validate
npx @fraylabs/possible@0.3.0 publish owner/repository
```

GitHub sources keep `outcomes.json` at the repository root. Domain sources expose the same index at `/.well-known/possible/outcomes.json`. Possible reads the public source at an exact revision and stores an immutable discovery snapshot.

Changes to Possible itself—its CLI, public contract, website, MCP, Product references, or lightweight Skill links—still use ordinary pull requests in this repository. Run `npm run check` before opening one.
