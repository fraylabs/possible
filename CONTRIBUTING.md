# Contributing to Possible

Possible accepts Outcome Packs whose source stays in the author's own public GitHub repository. Git is the source of truth; there is no Possible account, hosted editor, or submission database.

## The complete pack contract

Use the [JSON Schema](packages/packs/src/outcome-pack.schema.json). The authored `pack.json` contains only:

- `schemaVersion` — currently `1`;
- `name` — the specific finished outcome;
- `promise` — one plain-language sentence saying what success produces;
- `prompt` — the complete structured execution brief; organize the necessary context, deliverables, constraints, and finish boundary without treating length as quality;
- `expectations` — plain-language checklist items that must be true at completion, never commands for how to verify them;
- optional `skills` — only when specialized capabilities are needed; identify each by GitHub `repository`, repository-relative `directory` containing `SKILL.md`, and the exact `lastReviewedCommit` inspected by the author;
- optional `notFor` — only the nearby requests that materially prevent a bad recommendation.

Identity, slug, release revision, source hash, catalog status, trust, accepted evidence, discovery fixtures, and showcase media are not authoring fields. Do not add workstreams, plugin registries, schedules, prerequisites, lifecycle objects, domain-specific schemas, or compiler branches.

Use the [Playable Web Game pack](packages/packs/src/packs/playable-web-game/pack.json) as a complete example.

## Author locally

```bash
npx @fraylabs/possible pack init my-pack
npx @fraylabs/possible pack validate my-pack
npx @fraylabs/possible pack inspect my-pack
npx @fraylabs/possible pack compile my-pack
```

`init` creates an intentionally incomplete local template. Validation succeeds after the structured prompt and expectations are complete. Compilation returns standard install commands for any listed Skills and the prompt with its checklist plus one proportional-check rule appended.

Export the valid contract:

```bash
npx @fraylabs/possible pack export my-pack
```

Commit that `pack.json` at a stable path in your public GitHub repository. Then create a PR-ready export pinned to the exact commit:

```bash
npx @fraylabs/possible pack export packs/my-pack.json submission/my-pack \
  --source https://github.com/OWNER/REPOSITORY \
  --revision FULL_COMMIT_SHA \
  --path packs/my-pack.json
```

Branches and tags are not accepted. The command writes:

```text
submission/my-pack/
  pack.json
  source-entry.json
  SUBMISSION.md
```

## Open the pull request

1. Fork `fraylabs/possible` and create a branch.
2. Copy `source-entry.json` to the registry path named in `SUBMISSION.md`.
3. Copy `pack.json` unchanged to `registry/snapshots/<sha256-without-prefix>.json`.
4. Run the focused validation command from `SUBMISSION.md`.
5. Run `npm run registry:sync` and commit the generated catalog and offline references.
6. Open a pull request explaining the outcome, why the prompt is reusable, why each listed Skill is necessary, and what the expectations make observable.

Submission CI fetches the pinned public commit, proves the remote and snapshot bytes match, checks the hash and minimal schema, and compiles the pack. A submission cannot add its own trust or evidence record.

A merged valid submission becomes **listed**. Possible maintainers may later assign **experimental** or **verified** status separately. Verified requires accepted run evidence; authors cannot self-award it. Updates use a new exact commit and content hash.

Bundled packs may also include optional `showcase.json` and `media/`. Showcase images, video, and CAD illustrate the possible result; they are never run evidence or verification.
