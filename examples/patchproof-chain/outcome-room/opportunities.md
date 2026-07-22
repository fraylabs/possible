# Traceable opportunities

## 1. PatchProof — local completion receipts for AI-assisted changes

**User:** developers reviewing work from Codex, Copilot, Claude Code, Cursor, or mixed/manual sessions.  
**Job:** determine whether “done” claims are backed by a diff, a check result, or an artifact.  
**First product:** a browser-only receipt builder accepting task text, unified diff, command/test logs, and optional screenshots; it produces a claim/evidence ledger and portable Markdown/JSON receipt.  
**Evidence:** S01–S07.  
**Key unknown:** whether manual import is sufficiently easier than reviewing raw logs.

## 2. Repo Contract Doctor — cross-file onboarding consistency

**User:** maintainers preparing a repository for contributors or agents.  
**Job:** find contradictions among README setup, package scripts, lockfiles, environment examples, CI, and license metadata.  
**First product:** local folder scan with evidence-linked findings.  
**Evidence:** S08–S15.  
**Key unknown:** why users would choose it over the many current repo-readiness and drift tools.

## 3. ExampleLens — OpenAPI example contract debugger

**User:** API developers whose schemas validate but examples render or execute incorrectly.  
**Job:** show exactly where an example conflicts with its schema/version/tool behavior.  
**First product:** paste an OpenAPI fragment and receive a visual path-level explanation.  
**Evidence:** S16–S18.  
**Key unknown:** frequency and willingness to adopt another validator.

## 4. RunnerGap — local-versus-hosted CI explainer

**User:** developers debugging GitHub Actions that behave differently locally and on hosted runners.  
**Job:** identify likely environment, path, secret, image, or event-context gaps before another push.  
**First product:** static comparison of a workflow against a declared local environment.  
**Evidence:** S19–S21.  
**Key unknown:** whether useful diagnosis is possible without emulating the workflow.
