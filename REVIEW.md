# Review

Review status: **local candidate**.

## Product test

> Skills.sh gives agents individual skills. Possible compiles them into complete outcomes.

The candidate proves that sentence across three distinct outcomes without becoming a skill catalog:

- Hardware Launch composes web, film, and CAD work.
- Software Launch composes product, site, film, and release-readiness work.
- Open-Source Release composes release engineering, documentation, examples, CI, and security assurance.

## Acceptance checks

- Three typed manifests drive the website, static publications, MCP, and prompts.
- Every external skill exposes its repository and reviewed revision.
- Install commands are grouped deterministically by upstream repository.
- Every pack delegates by independent workstream, then uses a fresh reviewer.
- Pack-specific external actions and unsupported claims remain gated.
- `npm run check` passes.

## Known limitation

The Skills CLI commands resolve external repositories at install time. Reviewed revisions are provenance records, not enforced install pins. Users must inspect resolved skills before running them.

The candidate has not been deployed or submitted by this repository change.
