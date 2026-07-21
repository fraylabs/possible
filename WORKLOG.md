# Worklog

## 2026-07-18 — Outcome compiler reset

- Rejected the universal-skill and skill-marketplace framings.
- Defined Possible as the composition layer above Skills.sh.
- Made Hardware Launch the Buildweek hero pack.
- Added a typed manifest for five external skills, three workstreams, five outputs, safety gates, and verification.
- Added a deterministic compiler for four install commands and one captain prompt.
- Rebuilt possible.sh as a single inspect → install → run experience.
- Published read-only `list_packs` and `compile_pack` MCP tools.
- Rewrote the installable Possible skill around source inspection, workstream delegation, integration, and independent verification.
- Removed every retired product surface and supporting artifact from the repository.
- Passed the pack, MCP, web, accessibility, build, and skill validation checks.

## 2026-07-18 — Three-pack catalog

- Added Software Launch and Open-Source Release using the same outcome contract.
- Generalized the compiler from launch-specific folders and review skills.
- Added an explicit three-choice composer without automatic or opaque routing.
- Published a static pack index and per-pack JSON, install commands, and run prompts.
- Expanded MCP, compiler, web, and skill validation across all three packs.

## 2026-07-18 — Pack gallery

- Kept `/` focused on creating a compiled outcome.
- Added `/packs` as an editorial gallery rather than a marketplace, with an asymmetric poster wall and a distinct visual cover for every outcome.
- Added a complete page for every pack with its promise, outputs, workstreams, sources, guardrails, verification, and personalized compiler.
- Added useful not-found handling and route-level tests without adding a routing dependency.

## 2026-07-18 — Live demo

- Added `/demo` as a deterministic presentation surface centered on Hardware Launch.
- Made the core thesis visible as an equation: five skills become three parallel subagents, five integrated outputs, and one independent review.
- Kept the demo real: the editable brief compiles into the canonical pack prompt and can be copied directly into Codex.

## 2026-07-18 — Recorded Hardware Launch

- Ran the Hardware Launch pack in a clean sibling workspace against a fictional e-ink focus device called Still.
- Produced the actual launch website, 24-second launch film, STEP/STL/GLB prototype CAD, local-only waitlist contract, integrated outcome room, receipts, and screenshots.
- Preserved the review story: the first browser pass found broken embedded-site assets, the captain repaired the Vite base path, and the fresh rerun recorded 50 successful browser responses.
- Replaced the synthetic `/demo` walkthrough with a timed Codex-style replay powered by the run's real artifacts and evidence.
- Linked the replay to 58/58 artifact checks, the initial failure trace, the final receipt, and the complete local launch room.
- Exported all 31 public messages from the real captain and four specialist Codex threads, with an explicit boundary excluding private reasoning, system instructions, encrypted handoffs, and raw tool output.
- Added a full-screen readable/copyable transcript and prominent “Show output” handoffs to the actual generated launch room.

## 2026-07-19 — Interview-first skill

- Changed `$possible` from a pack selector into the conversational entry point for defining an outcome.
- Made a bare invocation ask only “What are you trying to make real?” and prohibited pack names, installation, file writes, and subagents during intake.
- Added one-question-at-a-time discovery, a single recommended outcome, explicit ingredient and boundary disclosure, and a confirmation gate.
- Bundled a self-contained three-pack runtime reference so the globally installed skill can work without the Possible MCP, while still preferring newer MCP definitions when available.
- Added resumable `.possible/` state and retained independent workstream, integration, fresh-review, and external-action gates.

## 2026-07-19 — Flat demo outputs

- Promoted `/demo/still/` to the finished launch room instead of exposing the internal `outcome-room/` assembly directory.
- Published the site, film, hardware, evidence, and verification artifacts as direct sibling routes.
- Updated every live demo link and manifest path while preserving the original run receipts and traces as historical evidence.
- Added development and preview-server clean-route handling so `/demo/still/` resolves to the static output before the React SPA fallback.

## 2026-07-21 — Build Week proof and judge path

- Reframed the submission around one falsifiable claim: Possible adds the operational knowledge needed to coordinate individual Codex tasks into a verified outcome.
- Published `/proof` with the visible intent → pack → compiled contract → execution → fresh review → verified outcome flow.
- Presented the frozen five-condition pilot exactly: Direct stopped at 19/20; Possible reached 20/20 and passed treatment; Spec and Plan outcome/treatment distinctions and all pilot limits remain visible.
- Added a public proof summary that maps every headline to the frozen protocol, brief, verifier contract, raw transcripts, receipts, machine decisions, screenshots, and independent report.
- Turned the Still demo's verification evidence into an explicit produced → withheld → failed → repaired → fresh-pass sequence without changing or hiding the historical trace.
- Added a five-minute Judge Quickstart, supported-platform evidence boundary, expected files, fast evidence path, troubleshooting, non-prompt-library explanation, and Build Week provenance record.
- Prepared Devpost copy, a 2:54 video storyboard and capture list, and a claim ledger that separates benchmark failures from the independent Still repair story.
- Passed `npm run check`: 5 pack tests, 8 CLI tests, 9 MCP tests, 30 web tests, 33 static-generation steps, 28 public HTML routes, eight pack publication sets, skill validation, and demo validation.
- Attempted the required fresh browser review; the in-app browser exposed no available backend. No visual-pass claim was made. Desktop/mobile visual inspection remains open alongside npm publishing and submission-owner attestations.

## 2026-07-21 — Submission preflight and completion audit

- Packed the exact unpublished `@fraylabs/possible@0.1.7` candidate, installed it into a clean target, and preserved package hashes and installed-file evidence without changing the public registry.
- Added an automated submission validator covering canonical proof parity, bounded benchmark language, version disclosure, prohibited overclaims, and the three-minute narration budget.
- Re-ran the complete verifier successfully and committed the clean candidate at `aa29f2f2`.
- Retried browser discovery after reading the supported recovery path; the available-browser list was still empty. No unrelated browser surface or source-level screenshot was substituted for the required fresh review.
- Rechecked public state: both proof URLs remain 404 and npm remains at `0.1.6`. Push, deployment, npm publication, recording, upload, and owner attestations remain approval- or account-gated.
