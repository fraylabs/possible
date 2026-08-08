# Contributing to Possible

Possible accepts Outcome Packs whose source stays in the author's own public GitHub repository. Git is the source of truth and the Possible repository is the reviewed discovery index. There is no Possible account, hosted editor, or submission database.

## The pack contract

An Outcome Pack combines three things:

- **Structured Prompt** — the outcome, workstreams, outputs, guardrails, and verification instructions from which Possible compiles the Run Prompt;
- **Skills** — the named capabilities and exact revisions reviewed for the contract; and
- **Expectations** — the observable checklist, failure modes, and required evidence used to judge completion.

Catalog metadata such as `promise`, `useWhen`, and `notFor` helps agents select the right pack. Trust is not authored in the pack.

Use the [JSON schema](packages/packs/src/outcome-pack.schema.json) for every nested object key and the [Playable Web Game manifest](packages/packs/src/manifests/playable-web-game.json) as one complete canonical example. The runtime validator remains authoritative for cross-field rules.

A contribution must state one bounded outcome and explicit non-scope, expose every external source and reviewed revision, preserve approval gates for external actions, and define fresh evidence for every required Expectation. Do not claim an install is pinned unless the installer actually resolves that revision.

## Author the pack

Create and inspect a private draft locally:

```bash
npx @fraylabs/possible pack init my-pack
npx @fraylabs/possible pack validate my-pack
npx @fraylabs/possible pack inspect my-pack
```

When your private contract has been reviewed as complete enough to compile, set `lifecycle` to `reviewed`, record that author/repository review date in `reviewedAt`, validate it, and inspect the compiled Run Prompt. This is contract lifecycle, not Possible maintainer trust:

```bash
npx @fraylabs/possible pack validate my-pack
npx @fraylabs/possible pack compile my-pack
```

Create the reviewed public contract package:

```bash
npx @fraylabs/possible pack export my-pack
```

The exported pack remains `lifecycle: reviewed` so it can compile, but it has no Possible catalog trust. Commit that `pack.json` unchanged at a stable path in your own public GitHub repository and push the commit. Then create an exact PR-ready package from that reviewed public contract:

```bash
npx @fraylabs/possible pack export packs/my-pack.json submission/my-pack \
  --source https://github.com/OWNER/REPOSITORY \
  --revision FULL_COMMIT_SHA \
  --path packs/my-pack.json
```

Branches and tags are not accepted as revisions. The command writes:

```text
submission/my-pack/
  pack.json
  source-entry.json
  SUBMISSION.md
```

`source-entry.json` uses source-entry schema version 1 and contains only `schemaVersion`, the source identity, exact commit, repository-relative path, and SHA-256 content identity. It cannot assign trust.

## Open the pull request

1. Fork `fraylabs/possible` and create a branch.
2. Copy `source-entry.json` to the registry path named in `SUBMISSION.md`.
3. Copy `pack.json` unchanged to `registry/snapshots/<sha256-without-prefix>.json`, using the path named in `SUBMISSION.md`. The immutable snapshot makes accepted packs available to offline and no-network installations; it is cached provenance, not trust.
4. Run the focused validator command from `SUBMISSION.md`.
5. Run `npm run registry:sync` and commit its generated catalog and canonical skill-reference outputs. Do not hand-edit generated pack catalogs, skill references, or CLI snapshots.
6. Open a pull request describing the outcome, non-scope, and evidence its Expectations require.

Pack-submission CI requires a reviewed public contract, requires the local immutable snapshot, fetches the file from the pinned public commit, proves the two are byte-for-byte identical, checks the content hash and manifest, compiles the contract, and rejects source entries containing author-controlled trust. Here `lifecycle: reviewed` means the authored contract is complete enough to compile; it is not Possible verification or catalog trust. Contributors do not edit `$possible`, website code, MCP code, generated catalog files, pack counts, trust records, or evidence records by hand.

A merged valid submission becomes **listed**. Possible maintainers separately assign **experimental**, **verified**, or **archived** status. Verified requires accepted run evidence; authors cannot self-award it. Updates use another pull request with a new exact commit and content hash.

Implementation changes still use the repository's full release gate before handoff. Source-entry-only pack submissions use the focused pack-submission workflow instead.
