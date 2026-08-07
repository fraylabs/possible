# Authoring Outcome Packs

Outcome Packs are declarative JSON contracts for one observable, verifiable result. A pack is a contract, not permission: it may describe approval gates and guardrails, but it never authorizes external actions.

## Public manifests

Canonical public manifests live in [`src/manifests`](src/manifests). They are the source for the compiler, website, bundled skill reference, and public MCP distribution. Use the same shape for project-local packs.

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

Every pack needs:

- `schemaVersion`, `packVersion`, `slug`, and a `visibility`/`lifecycle` pair;
- a clear promise, fit (`useWhen`/`notFor`), and stopping boundary;
- reviewed skill sources with revisions and review URLs;
- independently owned workstreams and their files;
- inspectable outputs;
- expectations with failure modes and required evidence;
- guardrails, approval boundaries, and verification checks.

Keep `visibility` and `lifecycle` separate:

```json
{
  "visibility": "private",
  "lifecycle": "draft"
}
```

`export` creates a public-review draft without publishing it. Promotion remains a separate review decision. MCP only lists and fetches public JSON manifests; it never discovers private packs or writes project files.
