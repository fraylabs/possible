# Contributing to Possible

Publishers keep canonical Outcomes in their own public GitHub repository or domain. Possible does not accept Outcome folders into this repository and does not require a publisher account.

## Author one Outcome

Install the CLI (macOS or Linux, arm64 or x86_64):

```sh
curl -fsSL https://possible.sh/install.sh | sh
export PATH="$HOME/.local/bin:$PATH"
# Or:
brew install fraylabs/tap/possible
```

```bash
possible create my-outcome --product owner/product
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
- `outcome.json` names one primary Product or Skill, optional secondary credits, models, requirements, provenance, and referenced files. The primary attribution is the name people should understand first.

Publish only a prompt genuinely connected to the result. Record only known provenance and material you have the right to share. Never publish secrets or private personal information.

## Validate and publish

```bash
possible validate
possible publish owner/repository
```

GitHub sources keep `outcomes.json` at the repository root. Domain sources expose the same index at `/.well-known/possible/outcomes.json`. Possible reads the public source at an exact revision and stores an immutable discovery snapshot.

Changes to Possible itself—its CLI, public contract, website, MCP, or attribution behavior—still use ordinary pull requests in this repository. Run `npm run check` before opening one.
