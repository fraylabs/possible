# Alternatives and underserved gaps

**Snapshot:** 2026-07-22

## Completion evidence for AI-assisted changes

| Alternative | What it does well | Remaining gap hypothesis |
|---|---|---|
| GitHub checks and pull requests | Familiar diff/review surface with commit-level check states | A check state does not map the agent’s narrative claims to evidence; skipped checks can appear successful. |
| GitHub Copilot session logs | Agent-specific trace of actions, changes, and validation | Tied to GitHub/Copilot sessions and cloud-sync behavior; not a small vendor-neutral receipt. |
| Agentwatch | Automated out-of-band capture and claim/action comparison | Requires hook-based capture; a manual local-first evidence packer may serve ad-hoc or mixed-agent work. |
| PipeLab/Pipelock | Signed, hash-chained action receipts | Proxy/security architecture is stronger but heavier than a simple review artifact. |
| h5i | Full auditable agent workspaces and verifier evidence | Broader workspace infrastructure; higher setup surface than a browser-only receipt builder. |
| Raw terminal logs + `git diff` | Already available and authoritative at source | Reviewer must manually connect task claims, changed files, checks, failures, and missing evidence. |

**Gap to test, not claim:** a browser-only tool that accepts a task, unified diff, test logs, and optional artifacts; deterministically flags failed/skipped or unsupported claims; and exports a portable JSON/Markdown completion receipt without accounts, hooks, repository upload, or pretending to verify code correctness.

## Repository readiness

GitHub community profiles, Driftless, EnvDrift, RepoReady, OpenSSF Scorecard, and other health analyzers already cover overlapping pieces. The visible gap is not “another score”; it would need a sharply defined contract or audience. This candidate is rejected for now because whitespace is weak.

## OpenAPI example integrity

Swagger/OpenAPI validators, IBM service-validator, and related tools already validate structures and implementations. A visual explanation layer might help, but it is a narrower audience and needs stronger current demand evidence.

## CI parity

`act` and `actionlint` are mature and well scoped. A new tool would need to explain environment-specific failures those tools cannot, which raises implementation cost beyond the desired first outcome.
