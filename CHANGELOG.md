# Changelog

## Unreleased

- Made publisher-owned Supabase snapshots the sole runtime Outcome directory for the website and MCP.
- Moved Fray Labs seed Outcomes to `fraylabs/possible-outcomes` and removed their duplicated media and manifests from this repository.
- Kept only static Product definitions, lightweight Skill links, and contract types in the reference catalog.
- Rebuilt Possible as a visual directory of exact prompts and representative outcomes.
- Replaced the execution framework with one minimal Outcome record: title, summary, prompt, author, optional Products, optional Skills, and optional preview media.
- Simplified the website, MCP, CLI, documentation, and contribution path around the same source-owned directory.
- Split every Outcome into the human's original prompt, the full execution prompt, and provider/agent/model/timestamp provenance.
- Rebuilt `$possible` to research current methods, resolve consequential ambiguity, and prepare one self-contained prompt for a fresh agent.
