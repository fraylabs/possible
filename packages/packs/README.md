# Authoring Outcome Packs

Outcome Packs are declarative JSON contracts for one observable, verifiable result. A pack is a contract, not permission: it may describe approval gates and guardrails, but it never authorizes external actions.

## Public manifests

Bundled public manifests live in [`src/manifests`](src/manifests). Accepted external manifests remain in their authors' Git repositories and enter Possible through the Git-backed registry as exact content-addressed snapshots. Both use the same contract and feed the compiler, website, bundled skill reference, and public MCP distribution.

The schema is available at [`src/outcome-pack.schema.json`](src/outcome-pack.schema.json) as a structural reference for editors and tooling. Runtime validation is authoritative for semantic relationships, lifecycle rules, and references such as unique IDs and workstream skill ownership. Public catalog numbers are presentation metadata and are not part of a pack manifest.

## Project-local packs

Create a private pack inside the project that owns it:

```text
.possible/
  packs/
    my-pack/
      pack.json
      README.md
      fixtures/
```

Use the CLI:

```text
possible pack init my-pack
possible pack validate my-pack
possible pack inspect my-pack
possible pack compile my-pack
possible pack export my-pack
```

`init` creates a draft. Drafts can be edited and validated, but compilation is refused until the pack is reviewed. A private reviewed pack remains private and does not grant authority.

## Required contract

Every pack is authored from three primitives:

- **Structured Prompt** — the promise, summary, fit, workstreams, outputs, guardrails, verification, and stopping-boundary fields that compile into one Run Prompt;
- **Skills** — reviewed sources, pinned revisions, and exact install commands;
- **Expectations** — observable checklist items with failure modes and required evidence.

Every manifest also carries catalog metadata and the generic workstream structure needed to compile those primitives. It must not add a domain-specific contract object, module registry, plugin list, schedule, prerequisite, remix schema, or compiler branch. Put domain guidance in the Structured Prompt fields or express it as an expectation.

The generic manifest fields are:

- `schemaVersion`, `packVersion`, `slug`, and a `visibility`/`lifecycle` pair;
- `promise`, `summary`, `useWhen`, and `notFor`;
- `skills` and independently owned `workstreams`;
- `outputs`, `guardrails`, and `verification`;
- `expectations` with failure modes and required evidence (required for reviewed and archived packs).

Field demands are intentionally explicit:

- `promise` names the observable result in one sentence; `summary` explains the outcome shape and stopping boundary. `summary` is the human-facing description—there is no separate `description` field.
- `useWhen` and `notFor` define fit and non-scope, so a pack is not selected by a vague category match.
- `skills` name reviewed, pinned capabilities; `workstreams` assign independently owned work and artifacts; `reviewSkills` challenge the integrated result.
- `outputs` name artifacts, while `expectations` define what must be true. Each expectation records failure modes and required evidence; outputs alone are never proof.
- `guardrails` state non-negotiable boundaries and `verification` names fresh checks that can falsify the expectations.
- Metadata (`schemaVersion`, `packVersion`, `visibility`, `lifecycle`, `lane`, `slug`, `name`, `eyebrow`, and optional archive/review timestamps) identifies and distributes the contract; it never grants authority.

Keep `visibility` and `lifecycle` separate:

```json
{
  "visibility": "private",
  "lifecycle": "draft"
}
```

`export` converts a private reviewed contract into a reviewed public contract without publishing it. Keeping `lifecycle: reviewed` makes the exact external snapshot compilable; it does not assign Possible trust. A valid external submission enters the catalog as `listed`; maintainers assign `experimental`, `verified`, or `archived` trust separately, and verified requires accepted run evidence. MCP only lists, searches, and fetches public JSON snapshots; it never discovers private packs or writes project files.
