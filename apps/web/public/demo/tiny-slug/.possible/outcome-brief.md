# Outcome Brief: tiny-slug Open-Source Release

## Audience

JavaScript developers who want a small ESM slugification utility, plus first-time and returning contributors who need a clear local workflow.

## Desired end state

Prepare `tiny-slug` locally as a public open-source package that another JavaScript developer can confidently understand, install, test, and contribute to. Version 1 remains deliberately small, dependency-free, ASCII-only, and exposes one documented `slugify(value)` API.

## Current reality

- The repository is an uncommitted `main` worktree with no Git history or configured release evidence.
- `index.js` exports one ESM function that trims, lowercases, replaces runs outside `[a-z0-9]` with `-`, and removes leading/trailing hyphens.
- `index.test.js` contains one happy-path test using Node's built-in test runner.
- `package.json` identifies `tiny-slug@0.1.0`, sets `type: module`, and exposes only `npm test`.
- There is no README, license, contribution guide, changelog, package smoke test, CI workflow, security guidance, or release plan.
- The Open-Source Release pack's five skills are installed repo-locally and match reviewed upstream revision `26fe2d126bf79aafb38f43344d450b69632200f8` exactly.

## Constraints

- Keep the runtime implementation deliberately tiny and ASCII-only.
- Preserve ESM as the supported module format.
- Prefer zero runtime dependencies and use Node's built-in test tooling.
- Preserve unrelated user work.
- Do not claim npm-name availability, compatibility beyond tested environments, security guarantees, production readiness, or public demand without evidence.
- Do not publish to npm or perform any external release action.

## Assumptions

- `tiny-slug` remains the working package name; npm registry availability is unverified.
- This is the first intended public release, so local release materials target `1.0.0` under the reviewed SemVer guidance.
- MIT is the permissive license default for the local release candidate, attributed to `tiny-slug contributors`; this remains reversible before publication.
- Supported Node.js versions will be limited to maintained release lines verified against official Node.js sources during implementation.
- Non-ASCII characters are separators, not transliterated characters. The API accepts strings; other input types produce a `TypeError`.

## Workstreams and interfaces

### Release engineering

Owns package metadata and exports, the public implementation contract, declarations if justified, package-install smoke verification, `CHANGELOG.md`, and `release/`. It must provide a packed-artifact receipt that documentation and verification can rely on.

### Documentation and examples

Owns `README.md`, `CONTRIBUTING.md`, `SECURITY.md`, `docs/`, and `examples/`. All documented behavior and examples must match the public API and be executable against the local package.

### CI and security assurance

Owns `.github/workflows/`, optional dependency-update configuration, and `release/security-review.md`. CI must invoke the same local verifier used by contributors and use least-privilege, immutable action references.

### Integration contract

- `package.json` scripts are the canonical contributor and CI entry points.
- README examples, type declarations, tests, and packaged behavior must describe the same one-function API.
- The release plan must separate locally verified evidence from steps that require later external approval.
- Review workstreams report findings but do not apply fixes; the captain integrates approved in-scope repairs.

## Acceptance checks

1. The public API is explicit, documented, and limited to `slugify(value)` for ASCII-oriented output.
2. Tests cover normalization, separators, boundaries, empty results, digits, non-ASCII behavior, and invalid input.
3. A clean temporary consumer can install the generated package tarball and import it as ESM without network access.
4. The packed artifact contains only intended runtime, type, license, and documentation files.
5. `npm test` and the canonical full local verification command pass.
6. CI runs that canonical command on maintained Node.js release lines, with least-privilege permissions and immutable action pins.
7. README, contribution guidance, runnable examples, changelog, security policy, and local release plan agree with actual package behavior.
8. A fresh independent reviewer verifies the integrated repository and records passed, failed, skipped, and unproven checks.

## External-action gates

The following are not authorized: npm publication, Git pushes, branch pushes, tags, GitHub pull requests or releases, repository-setting changes, package-name reservation, outreach, deployment, analytics, or collection of real user data. Each must remain an explicit later step in the release plan.

## Unproven claims

- Availability or ownership of the `tiny-slug` npm name.
- Correct public repository URL, issue tracker URL, maintainer contact, and copyright-holder identity.
- CI execution on GitHub-hosted runners; the workflow can only be reviewed locally here.
- Compatibility outside the locally executed and configured CI Node.js versions.
- Absence of all vulnerabilities; static review provides evidence, not a security guarantee.
- Successful npm publication or downstream adoption.
