# Changelog

## CLI 0.6.1

- Capture titles skip leading acknowledgements and filler and end at natural boundaries within nine words; full prompts keep their wording and order without repeated title lines.
- Optional draft `media/` and `artifacts/` folders are copied into the Outcome. Review binds every file path, size and SHA-256 hash; file changes invalidate approval. Bounded local reads reject symlinks, special files and unsafe paths.
- `possible capture check <draft>` reports review blockers and privacy findings without interaction, approval, receipts or network access. Interactive creator review remains required.
- Public capture help and documentation list only Claude Code and Codex.

## Unreleased

### CLI 0.6.0 and site: the recipe is the default

- Outcome pages lead with **Copy recipe** when a recipe exists, with **Copy prompt** as the secondary action. Prompt-only Outcomes are unchanged.
- Directory cards are marked **Recipe** or **Prompt only**, copy the recipe when there is one, and can be filtered with **Recipes only** (`?recipe=1`).
- Plain `possible fetch` and `possible use` print the recipe text kit (the same text as the site's Copy recipe) when an Outcome has a recipe, and the exact prompt otherwise. `--prompt` restores prompt-only output; `--json` is unchanged.
- `possible create` scaffolds an optional recipe with placeholder steps; `possible validate` reports `recipe.steps[n] is incomplete` until they are filled in or the recipe is removed.
- Copies of either the recipe or the prompt still count as uses.

### CLI 0.5.2

- `possible capture` produces useful recipes from real sessions: meaningful programs, packages and libraries from nested exec and shell calls (no runtimes, text utilities or standard-library modules), detected skills, harness envelopes and attachments omitted, descriptive step titles with acknowledgement turns folded in.
- Sessions of any size are streamed with bounded memory; long commands are inspected in linear time.
- Every automatically detected tool must be described or removed by the creator before review.

### CLI 0.3.1 release candidate

- Accept the current schema v4 `primary` and optional `secondary` attribution fields while retaining schema v3 compatibility.
- Include the required Product or Skill argument in copied authoring commands.
- Test authoring and validation from an installed npm tarball before release.

- Replaced `possible init` with the standard `npx skills add` installation path and added public `possible search` and `possible fetch` commands.
- Made publisher-owned Convex snapshots the sole runtime Outcome directory for the website, CLI, and MCP.
- Added deduplicated anonymous usage, account likes, and private bookmarks without adding publisher accounts.
- Moved Fray Labs seed Outcomes to `fraylabs/possible-outcomes` and removed their duplicated media and manifests from this repository.
- Kept only static Product definitions, lightweight Skill links, and contract types in the reference catalog.
- Rebuilt Possible as a visual directory of exact prompts and representative outcomes.
- Replaced the execution framework with one minimal Outcome record: title, summary, prompt, author, optional Products, optional Skills, and optional preview media.
- Simplified the website, MCP, CLI, documentation, and contribution path around the same source-owned directory.
- Split every Outcome into the human's original prompt, the full execution prompt, and provider/agent/model/timestamp provenance.
- Rebuilt `$possible` to research current methods, resolve consequential ambiguity, and prepare one self-contained prompt for a fresh agent.
