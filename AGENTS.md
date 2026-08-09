# Possible

Possible publishes typed Outcome Packs built from one structured prompt, an Expectations checklist, and optional repository- and directory-identified Skills with a recorded last-reviewed commit.

Before editing:

```bash
jj status
npm run packs:check
```

Keep each bundled pack in exactly one `packages/packs/src/packs/<slug>/` folder. `pack.json` is the contract; active packs also have `discovery.json`. A pack may add `showcase.json` and a flat `media/` folder for optional representative images, one video, and one CAD outcome. Showcase media is presentation, never evidence or trust. External authors keep their contracts in their own pinned Git repositories and enter through `registry/`. Maintainer trust is authored separately in `registry/bundled-trust.json`. Run `npm run packs:generate` instead of hand-editing the manifest index, snapshots, generated trust, discovery aggregate, showcase aggregate, public references, or CLI skill snapshot. The generated public catalog is the shared source for the website, static publications, MCP, and offline skill reference. Every addition must strengthen the outcome-pack contract.

When a pack needs an external Skill, identify it by its GitHub repository and repository-relative directory containing `SKILL.md`, and record the exact commit last reviewed by the pack author. Omit `skills` when no specialized capability is needed. Keep the prompt focused on useful execution guidance; express completion as observable Expectations; and preserve approval gates for external actions. Verification is proportional runtime behavior, not an authored pack field or bespoke artifact framework. Use the standard Skills installer. It currently installs the named directory from the repository's live default branch, so agents must inspect each installed Skill and disclose drift from `lastReviewedCommit` rather than claiming the installation is commit-pinned.

For pack edits, verify with `npm run packs:check`. Run the full `npm run check` release gate only before handoff or CI; it includes the website build, publications, and discovery evaluations. Preserve unrelated work and use Jujutsu for local history.
