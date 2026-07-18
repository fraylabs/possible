# tiny-slug 1.0.0 release plan

Status: local release candidate only  
Prepared: 2026-07-19

This plan targets the first public release, `1.0.0`. Under Semantic Versioning, `1.0.0` establishes the deliberately small public contract: the named ESM function `slugify(value)`. Preparing this plan does not authorize any networked or external release action.

## Locally verifiable release candidate

The candidate is ready for release consideration only when all of these checks pass in the integrated worktree:

- `npm test` exercises normalization, separators, boundaries, empty results, digits, non-ASCII input, and invalid input.
- `npm run verify` runs the tests, creates the real npm tarball in a temporary directory, checks its exact contents, installs it with npm offline and an empty temporary cache, and imports it from a clean ESM consumer.
- Documentation examples run against the same public API.
- CI and security configuration pass local review.
- `package.json`, `CHANGELOG.md`, and the package contents all identify version `1.0.0` and the MIT license.

The local verifier deletes its temporary tarball and consumer directory after each run. Run `npm pack --dry-run` separately only when a human-readable second inspection is useful.

## Facts that must be supplied or verified

Do not infer or add these values before they are known:

- npm availability and ownership of the `tiny-slug` package name;
- the public GitHub owner/repository and default branch;
- repository, homepage, and issue-tracker URLs for `package.json`;
- the maintainer contact used for private vulnerability reports;
- the preferred copyright holder, if it should differ from `tiny-slug contributors`.

If any public API behavior changes after review, reassess the version and update the implementation, declarations, tests, documentation, changelog, and package receipt together.

## External-action gates

Every stage below requires separate explicit user approval. None was performed while preparing this repository.

1. **Name and metadata gate**
   - Check the npm registry for `tiny-slug` availability and ownership.
   - Confirm the public repository and maintainer facts.
   - Add only verified `repository`, `homepage`, and `bugs` metadata, then rerun `npm run verify`.
2. **Repository gate**
   - Create or select the public remote, push a branch, and open a pull request.
   - Let GitHub-hosted CI run on Node.js 22, 24, and 26; review the actual results and configure repository protections separately.
3. **Release gate**
   - After an approved merge, create and push the `v1.0.0` tag on the intended commit.
   - Create GitHub release notes from the reviewed `CHANGELOG.md` entry.
4. **Publication gate**
   - Authenticate to the intended npm account with the required protections.
   - Inspect the final tarball and provenance settings, then publish `tiny-slug@1.0.0` with public access.
   - Confirm the registry metadata and test installation from npm in a new clean consumer.

Approval for one gate does not imply approval for a later gate. In particular, a Git push, tag, GitHub release, or npm publication must never be inferred from approval to edit local files.
