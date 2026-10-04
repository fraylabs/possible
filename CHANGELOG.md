# Changelog

## Unreleased

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
