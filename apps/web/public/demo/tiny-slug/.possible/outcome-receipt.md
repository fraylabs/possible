# Outcome Receipt: tiny-slug Open-Source Release

Completed: 2026-07-19  
Outcome: a local, release-ready `tiny-slug@1.0.0` candidate for a deliberately tiny, dependency-free, ASCII-only ESM API.

## Artifacts

### Package and release engineering

- `package.json` — ESM exports, TypeScript declaration mapping, Node `>=22.0.0`, exact package allowlist, and canonical scripts.
- `index.js` / `index.d.ts` — one named `slugify(value)` API with strict string input and non-ASCII separator behavior.
- `index.test.js` — nine behavioral tests.
- `scripts/verify-package.mjs` — exact tarball inspection plus offline clean-consumer install/import.
- `LICENSE` — MIT default attributed to `tiny-slug contributors`.
- `CHANGELOG.md` — initial `1.0.0` entry.
- `release/release-plan.md` — local evidence and separately authorized external gates.

### Documentation and examples

- `README.md`
- `CONTRIBUTING.md`
- `SECURITY.md`
- `docs/api.md`
- `docs/design.md`
- `docs/local-install.md`
- `examples/basic.js`
- `examples/edge-cases.js`

### CI and assurance

- `.github/workflows/ci.yml` — least-privilege verification on Node.js 22, 24, and 26 with full action SHA pins.
- `.github/dependabot.yml` — weekly GitHub Actions updates.
- `.gitignore` — build output plus credential/key-file protection.
- `release/security-review.md` — frozen pre-remediation audit evidence.

### Possible provenance

- `.possible/outcome-brief.md`
- `.possible/pack.json`
- `.possible/skills-lock.json`
- `skills-lock.json`
- `.agents/skills/` — the five repo-local reviewed ingredient skills plus Possible.

The installed Open-Source Release skills byte-match reviewed upstream revision `26fe2d126bf79aafb38f43344d450b69632200f8`; all locked content hashes recomputed successfully.

## Verification commands

```sh
npm test
npm run verify
npm pack --dry-run --json --ignore-scripts
node examples/basic.js
node examples/edge-cases.js
npm ls --all --json
```

Additional static checks parsed every JSON/YAML artifact, resolved local Markdown links, recomputed skill hashes, checked the credential ignore patterns, inspected code/data flows, and resolved action tags through the official repositories.

## Passed

- 9/9 tests passed.
- The package verifier created `tiny-slug-1.0.0.tgz` in a temporary directory, found exactly `CHANGELOG.md`, `LICENSE`, `README.md`, `index.d.ts`, `index.js`, and `package.json`, installed it offline with an empty npm cache, and imported its named ESM API from a clean consumer.
- Both examples produced their documented output.
- Package code, declaration, tests, README, API docs, changelog, and release plan agree on the API, version, license, and Node floor.
- The dependency tree is empty.
- CI uses safe `pull_request`/`push` triggers, `contents: read`, a GitHub-hosted runner, a 10-minute timeout, non-persisted checkout credentials, disabled setup-node caching, and `npm run verify`.
- `actions/checkout@v7.0.0` and `actions/setup-node@v7.0.0` full commit pins matched official refs.
- The fresh review found 0 Critical, High, Medium, Low, or Info findings; 0 exposed credentials; and 0 workflow findings.
- No local evidence of a remote, tag, commit, retained tarball, npm credentials file, or other release activity exists.

## Failed reviews and repairs

The frozen CI/security review recorded one LOW preventive finding: incomplete `.gitignore` coverage for conventional credential containers and filenames. The captain added all recommended patterns. A fresh verification pass confirmed the repair and reported zero remaining findings. The original evidence remains in `release/security-review.md`.

## Failed

None after remediation.

## Skipped

- Registry-backed dependency advisory lookup, because the project has no dependency graph.
- Historical Git secret scanning, because the repository has no `HEAD` commit.
- GitHub-hosted workflow execution, publication, pushes, tags, releases, repository-setting changes, outreach, and real user-data collection.

## Unproven

- GitHub-hosted CI behavior on Node.js 22, 24, and 26; local execution used Node.js `v25.2.1`.
- Availability or ownership of the `tiny-slug` npm name.
- Public repository, homepage, issue tracker, maintainer security contact, and the preferred legal copyright-holder identity.
- npm publication/provenance, compatibility outside executed or configured environments, downstream adoption, and absolute absence of every possible vulnerability.

## External actions not taken

No npm publication, registry-name reservation, Git push, branch push, tag, GitHub pull request or release, repository-setting change, deployment, outreach, analytics setup, credential use, or real customer-data collection was performed.

Before any public release, follow the separately approved gates in `release/release-plan.md` and confirm the working package name, repository metadata, private security contact, MIT/copyright choice, and final release authority.
