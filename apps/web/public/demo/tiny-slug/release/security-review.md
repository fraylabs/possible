# Security review: tiny-slug 1.0.0 release candidate

Reviewed: 2026-07-19  
Scope: every non-Git project file present before this report was generated  
Languages and formats: JavaScript ESM, TypeScript declaration, YAML, JSON, Markdown  
Frameworks: none

## Findings summary

| Severity | Count |
| --- | ---: |
| 🔴 CRITICAL | 0 |
| 🟠 HIGH | 0 |
| 🟡 MEDIUM | 0 |
| 🔵 LOW | 1 |
| ⚪ INFO | 0 |
| **Total** | **1** |

Dependency audit: **0 declared or installed dependencies; 0 vulnerable packages identified by the local manifest review**  
Secrets scan: **0 exposed credentials found**  
GitHub Actions hardening: **0 workflow findings**

This is static, local evidence, not a security guarantee. The review was frozen before remediation so the finding below remains visible for captain integration.

## Findings

### 🔵 LOW — Secret-file ignore coverage is incomplete

Confidence: **High**  
Location: `.gitignore`, lines 8–12

Reviewed configuration:

```gitignore
.env
.env.*
!.env.example
*.key
*.pem
```

Risk: the current rules protect common environment, PEM, and key files, but do not protect several other credential containers and conventional credential filenames. A contributor could accidentally stage one of those files in a future worktree. No such file exists in the reviewed repository, so this is a preventive hardening gap rather than an exposed credential.

Recommended fix: consider ignoring `*.p12`, `*.pfx`, `id_rsa`, `id_ed25519`, `credentials.json`, `service-account.json`, `gcp-key.json`, `secrets.yaml`, `secrets.json`, and `config/secrets.yml`. Keep intentional public examples explicitly allowlisted when needed.

Status at review freeze: **Open; not patched by the review workstream.**

## GitHub Actions hardening review

No issues found. Checked triggers, trust boundaries, injection sinks, permissions, action pinning, checkout credentials, caching, secret handling, runner type, and execution limits.

- `.github/workflows/ci.yml` uses only `pull_request` and `push` to `main`; it does not use `pull_request_target`, `workflow_run`, `issue_comment`, or another privileged external trigger.
- Fork pull requests may execute contributor code only in the normal unprivileged `pull_request` context. The workflow supplies no secrets and grants only `contents: read`.
- The only `run:` command is the repository's canonical `npm run verify`; it contains no `${{ }}` interpolation. The two expressions elsewhere resolve only the static matrix value.
- The runner is GitHub-hosted (`ubuntu-latest`), with `timeout-minutes: 10`.
- Checkout sets `persist-credentials: false`; setup-node caching is disabled.
- `.github/dependabot.yml` enables weekly reviewable updates for the `github-actions` ecosystem.

### Immutable action evidence

Official GitHub release endpoints reported `v7.0.0` as the latest release for both actions on 2026-07-19. Official repository refs resolved as follows:

| Action | Pinned commit | Version evidence |
| --- | --- | --- |
| `actions/checkout` | `9c091bb21b7c1c1d1991bb908d89e4e9dddfe3e0` | [`v7.0.0`](https://github.com/actions/checkout/releases/tag/v7.0.0) |
| `actions/setup-node` | `820762786026740c76f36085b0efc47a31fe5020` | [`v7.0.0`](https://github.com/actions/setup-node/releases/tag/v7.0.0) |

Both workflow references use the full 40-character commit and retain the human-readable version comment. Evidence commands were read-only calls to the official GitHub API/repositories:

```sh
curl -fsSL https://api.github.com/repos/actions/checkout/releases/latest
curl -fsSL https://api.github.com/repos/actions/setup-node/releases/latest
git ls-remote https://github.com/actions/checkout.git refs/tags/v7.0.0
git ls-remote https://github.com/actions/setup-node.git refs/tags/v7.0.0
```

### Node.js matrix evidence

The official [Node.js Release Working Group schedule](https://github.com/nodejs/Release/blob/main/schedule.json) showed these maintained lines on 2026-07-19:

| Line | Phase/date evidence | End of life |
| --- | --- | --- |
| 22 | Maintenance since 2025-10-21 | 2027-04-30 |
| 24 | LTS since 2025-10-28; maintenance begins 2026-10-20 | 2028-04-30 |
| 26 | Current since 2026-05-05 | 2029-04-30 |

Accordingly, CI statically configures Node.js 22, 24, and 26.

## Codebase security review

### Dependency audit

- `package.json` is the only dependency manifest and declares no runtime, development, peer, or optional dependencies.
- No package-manager lockfile or installed dependency tree is present.
- `npm ls --all --json --long` exited 0 and reported empty dependency objects.
- The curated vulnerable-package watchlist therefore had no package/version to compare. A registry-backed advisory query was not used because this review is static/local and there is no dependency graph.

### Secrets and exposure scan

- Scanned all 43 pre-report files outside `.git`, including executable source, workflows, documentation, `.possible` state, and installed `.agents` skill text.
- No prohibited credential file was present.
- High-confidence token, private-key/certificate, credential-bearing connection-string, secret-assignment, and assignment-context entropy scans found no real credential.
- Three key/credential-shaped hits were self-verified as illustrative detection examples inside `.agents/skills/security-review/references/`; they are documentation, not credentials or executable configuration, and the npm package allowlist excludes `.agents`.
- Git history could not be scanned because the repository has no `HEAD` commit.

### Vulnerability and data-flow scan

No exploitable injection, authentication/access-control, sensitive-data, cryptography, path-traversal, SSRF, XSS, SQL, or business-logic issue was found.

- Public input flows through `slugify(value)` to a type check and fixed regular-expression/string transformations, then returns. It does not reach a filesystem, process, network, database, HTML, or dynamic-code sink.
- The regular expressions are fixed and contain no nested ambiguous repetition that suggests catastrophic backtracking.
- `scripts/verify-package.mjs` uses `execFileSync`, not a shell. Executables and arguments are fixed or derived from the asserted manifest and fresh temporary paths.
- Verification file writes and recursive cleanup stay under the path returned by `mkdtempSync`; npm is run offline with lifecycle scripts, audit, funding, and update checks disabled.

## Verification receipts

| Check | Result |
| --- | --- |
| YAML syntax parse for workflow and Dependabot files | Passed |
| Static workflow assertions for triggers, permissions, runner, timeout, matrix, pins, credentials, cache, and canonical command | Passed |
| `npm run verify` | Passed: 9/9 tests; exact six-file tarball; offline clean-consumer install and named ESM import |
| `node examples/basic.js` | Passed |
| `node examples/edge-cases.js` | Passed |
| `npm ls --all --json --long` | Passed: empty dependency tree |
| Secret-pattern and entropy scans | Passed with only self-verified instructional examples |
| Sink/source and cross-file data-flow review | Passed |

The canonical verifier ran locally on Node.js `v25.2.1`. That successful run does not prove behavior on the configured 22/24/26 matrix.

## Limitations and unproven checks

- GitHub-hosted CI was reviewed but not executed; runner behavior and the Node.js matrix remain unproven until an authorized push or pull request.
- There is no Git history, so removed or previously committed secrets cannot be assessed.
- No registry advisory service, dynamic application scanner, fuzzing campaign, penetration test, or third-party security audit was performed.
- Static review cannot prove the absence of every vulnerability, malicious future contribution, compromised upstream action commit, or platform-level issue.
- npm-name ownership, public repository settings, branch protection, private vulnerability reporting, publication, provenance, and downstream adoption remain unverified or unauthorized.

No CRITICAL or HIGH finding exists, so no patch proposal was generated.

> Review each change before committing. Nothing was modified in response to this frozen review pass.
