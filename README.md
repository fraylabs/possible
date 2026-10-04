# Possible

See what AI can make, explore how it was made, and reuse the recipe.

[Browse Outcomes](https://possible.sh) · [Read the docs](https://possible.sh/docs)

## One public contract

Every Outcome is owned by its publisher and lives in three required files:

```text
outcomes.json      # publisher identity and a thin list of Outcome manifests
outcomes/<slug>/
  outcome.json    # primary Product or Skill, secondary credits, models, optional recipe, provenance
  outcome.md      # title, summary, and human explanation
  prompt.md       # exact reusable execution prompt
  media/          # optional
  inputs/         # optional
  artifacts/      # optional
```

The repository or domain is the identity. A GitHub publisher keeps `outcomes.json` at the repository root; a domain publisher exposes the same index at `https://publisher.example/.well-known/possible/outcomes.json`. Possible stores an immutable snapshot for discovery but does not host publisher accounts or take ownership of canonical files.

## CLI

Install the standalone binary (macOS or Linux, arm64 or x86_64; no Node or npm needed):

```sh
curl -fsSL https://possible.sh/install.sh | sh
export PATH="$HOME/.local/bin:$PATH"
# Or:
brew install fraylabs/tap/possible
```

The script verifies SHA256 and installs to `~/.local/bin` without sudo. Use
`POSSIBLE_INSTALL_DIR` for another writable directory and `POSSIBLE_VERSION` to
pin a release, for example:

```sh
curl -fsSL https://possible.sh/install.sh | POSSIBLE_VERSION=0.5.1 POSSIBLE_INSTALL_DIR="$HOME/bin" sh
possible --version
```

```bash
possible search "make a launch video"
possible fetch <outcome-id> --json
possible create my-outcome --product owner/product
possible validate
possible publish owner/repository
possible add owner/repository
possible use owner/repository@my-outcome
```

Install the optional `$possible` Skill through the standard agent-skill ecosystem:

```bash
npx skills add https://github.com/fraylabs/possible/tree/skill/skills/possible --skill possible
```

The Skill discovers relevant prior Outcomes, asks only consequential questions, and prepares one complete prompt for a fresh agent. It uses the Possible MCP when available and otherwise uses the public CLI. Local bookmarks remain account-free.

## Recipes

An Outcome still starts with a result and a reusable `prompt.md`. An optional `recipe`
in `outcome.json` records the disclosed agent/harness, multiple skills pinned to exact
commits, references, tools/APIs with their purpose, and ordered steps with key prompts
and follow-ups. Existing `models` records model provenance; `primary` and `secondary`
remain attribution, not a limit on the recipe's ingredients.

[Recipe format and example](packages/catalog/README.md#optional-recipes-cli-040) · [JSON Schema](packages/catalog/src/outcome.schema.json)

The site shows **How it was made**, with **Copy recipe** for handing the disclosed
instructions to an agent. Entries without a recipe say **Prompt only**. Missing
information remains unknown. Copying does not install tools, grant access or guarantee reproduction. `fetch --json` and `use --json` retain the recipe;
plain `fetch` and `use` continue printing only the unchanged prompt.

## Repository

- `packages/catalog` — public Outcome contract types
- `apps/web` — visual directory, Outcome pages, source publishing, and docs
- `apps/mcp` — read-only list, search, and fetch tools
- `apps/cli` — authoring, validation, publishing, discovery, use, and bookmarks
- `skills/possible` — Outcome discovery and execution-prompt preparation
- `convex` — source registry, immutable snapshots, deduplicated uses, likes, bookmarks, and reader authentication

Fray Labs publishes its seed Outcomes independently at [fraylabs/possible-outcomes](https://github.com/fraylabs/possible-outcomes). They enter Possible through the same public source path as every other publisher.

## Verify

```bash
npm install
npm run check
```

Local backend development uses `npx convex dev`. Publishing remains account-free and source-owned; a reader may sign in with GitHub only when they want to like or save an Outcome.

### Page-view counts

possible.sh counts page views by page and referring site; no cookies or personal data.
Counts are UTC daily aggregates of a known page path, referring hostname, and optional
`utm_source`, `utm_medium`, and `utm_campaign`. The browser skips DNT, Global Privacy
Control, localhost and preview hosts; requests omit credentials and the HTTP referrer.
No visitor identifiers, IPs, user agents, full referrer URLs or other query parameters
are stored. UTM labels accept up to 64 letters, digits, dots, underscores or hyphens;
invalid labels are omitted. Use campaign labels, never personal information.

With the existing Convex CLI login authorized for `lim-brian/possible`, read production
counts (including today; 1–31 days) from the repository root:

```sh
npm run visits -- --days 7
# Equivalent:
npx convex run --deployment reminiscent-lark-333 visits:daily '{"days":7}'
```

The read query and recording mutation are internal; only the origin-restricted HTTP
endpoint accepts browser writes. Counts measure page views, not unique visitors.
Global guards allow at most 120 writes per minute, 100,000 per UTC day and 1,000
distinct buckets per day. Origin checks can be spoofed by non-browser clients;
counts can include bots and undercount during bursts or tracking failures. Existing
Outcome usage/reputation tracking is separate and unchanged.

CLI 0.5.1 is available as [standalone GitHub release binaries](https://github.com/fraylabs/possible/releases/tag/v0.5.1). The npm registry version 0.3.1 is legacy and remains unchanged. See [release packaging](scripts/sea/README.md) for the automated build and tap update path.

## Capture a finished session locally

The standalone CLI includes its Node runtime. Capture reads only the explicit file you
choose; it does not discover or upload your session history.

```sh
possible capture claude-code /path/to/session.jsonl --out ./private-draft
# Or: possible capture turnless /path/to/state.sqlite --thread THREAD_ID --out ./private-draft
# Or: possible capture codex /path/to/rollout.jsonl --out ./private-draft
```

Edit `private-draft/draft.json`: add the result, public creator credit and primary
attribution; inspect every prompt and ingredient. Tool outputs, file contents and
assistant prose are omitted. URLs, paths and repository coordinates are removed
by default; the private draft retains sanitized ingredient hints and known pins
under `ingredientsToReview` so you can add verified public references yourself.
Unknown models, historical skill pins and unavailable tool details stay unknown.

```sh
possible capture review ./private-draft
possible capture export ./private-draft --out ./reviewed-outcome
possible validate ./reviewed-outcome
```

Review prints the exact export and requires the creator to type its approval code
in an interactive terminal. There is no `--yes` option. Editing the draft or an
exported recorded Outcome invalidates its receipt and requires a new review.
Capture and export have no network or publication action. Only commit/upload the
reviewed export after explicitly deciding to share it; never commit the private
transcript or draft. Publishing remains a separate command.

Automated redaction is conservative and incomplete. Review names, private context,
unusual secrets, URLs and pasted text yourself. A review digest detects edits; it
is not a signature or proof of who reviewed the content. Approval is creator-attested
and unauthenticated: a terminal can be automated, so the check prevents accidental
export, not deliberate automation. Session formats vary;
Claude/Codex files cannot prove the agent process has stopped, so confirm the
session is finished. Turnless requires an inactive exact thread in a local SQLite
database; its historical requested model may differ from an unrecorded provider
override. Do not use capture to infer details absent from the session.

The site labels captured recipes **Recorded from session**, manually reconstructed
ones **Reconstructed**, and older prompt-only Outcomes **Prompt only**. Recorded
recipes can contain creator edits and privacy redactions; they are not raw transcripts.


Turnless uses SQLite's consistent read-only transaction. SQLite may create WAL/SHM
coordination files beside the database even though no stored records are changed;
do not use an immutable/raw file copy while the application may be writing.
The current thread-message schema cannot authenticate which user-role messages
were typed by the creator versus relayed by an agent; known server envelopes are
excluded and the creator must review remaining authorship. On Windows, draft
permissions inherit directory ACLs; use a private directory. Windows has not been
journey-tested. Content digests normalize CRLF to LF.

Unsupported invisible and format characters are removed with a finding during
capture and blocked during review/validation for all Outcomes. Standard emoji
sequences and contextual Arabic/Indic script joiners remain intact. Existing site content displays
and copies these characters as visible Unicode escapes, including legacy prompts.
