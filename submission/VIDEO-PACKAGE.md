# Possible — Build Week video package

Target cut: **2:55**. Hard cap: **2:57**. Do not upload a cut that reaches 3:00.

Verified narration: **252 words** — about **2:18 at 110 wpm** or **2:06 at 120 wpm**, leaving roughly 37 seconds at the slower pace for pauses, cursor movement, and artifact audio inside the 2:55 target.

The narration below is intentionally short enough for pauses, cursor movement, and artifact audio. Read with calm authority, not ad-speed energy. Show real interfaces and evidence; avoid animated architecture theater when the actual compiler, manifest, trace, or artifact is available.

## Timecoded script and storyboard

### 0:00–0:15 — The knowledge gap

**Picture:** Begin with a deliberately naïve request in Codex: `Launch my e-ink focus device.` Rapidly reveal the work the user did not name: product, site, film, CAD, safety, launch, and proof. End on the Possible homepage thesis.

**Narration:**

> AI made execution accessible. But people still need to know what a good outcome requires—and when it remains incomplete. Non-experts often do not.

**On-screen text:** `EXECUTION IS ACCESSIBLE. OPERATIONAL JUDGMENT IS NOT.`

### 0:15–0:29 — What Possible changes

**Picture:** Homepage hero, then install card and `$possible`.

**Narration:**

> Possible.sh is an open-source library of Outcome Packs for Codex. Each pack combines a reusable execution prompt, selected agent skills, and completion checks for one outcome.

**On-screen text:** `ROUGH AMBITION → EXPERT-SHAPED OUTCOME`

### 0:29–0:51 — Intent and approval

**Picture:** Show a real `$possible` exchange: rough Still idea, one clarifying question, Hardware Launch recommendation, outputs and boundaries, then `Yes, proceed.` Do not simulate a long chat.

**Narration:**

> The user chooses neither tasks nor packs. Possible clarifies the outcome, recommends a reviewed path, states its outputs and boundaries, then waits. Before approval, intake is read-only.

**On-screen text:** `THE USER NAMES THE AMBITION. POSSIBLE SUPPLIES THE MISSING MAP.`

### 0:51–1:17 — Show the Outcome Pack

**Picture:** Open Hardware Launch pack JSON, then the workstream table, independent-review callout, guardrails, and compiled run prompt. Hold long enough to read `site/`, `film/`, `hardware/`, and `fresh verification subagent`.

**Narration:**

> The prompt is only one part. Typed manifests define outputs, specialist work, safeguards, and verification. Each approved run coordinates execution, integration, and fresh review, using completion checks written for that project.

**On-screen flow:** `INTENT → OUTCOME PACK → EXECUTION → FRESH REVIEW → COMPLETION REPORT`

### 1:17–1:44 — Real outcome

**Picture:** Still outcome room. Move from launch site to the 24-second film, STEP-first CAD views/downloads, then evidence index. Let the artifacts dominate the frame.

**Narration:**

> The user supplied one rough hardware idea. Possible coordinated the product story, launch site, 24-second film, STEP-first CAD, local waitlist contract, and evidence room for a credible launch package.

**On-screen text:** `SITE · FILM · STEP CAD · WAITLIST CONTRACT · EVIDENCE`

### 1:44–2:16 — Failure, repair, fresh pass

**Picture:** Show the coordinating agent saying the room is ready, then the verifier's exact 404 finding. Open the preserved initial JSON trace. Show the narrow `base: "./"` repair as a one-line overlay or diff. Finish on the independent report and passing browser trace.

**Narration:**

> Production checks were green, but completion stayed open. A fresh reviewer found the embedded site's JavaScript and CSS returned 404. The coordinating agent repaired the base path. Fresh verification passed 58 artifact checks and 50 browser responses, with no console, page, or HTTP errors.

**On-screen text:** `PRODUCED ≠ PASSED` then `FAILURE PRESERVED → REPAIR → FRESH PASS`

### 2:16–2:42 — Controlled pilot, honestly

**Picture:** Simple two-column Direct/Possible table first; then pull back to show all five preserved conditions and a visible `ONE RUN PER CONDITION` limitation.

**Narration:**

> We froze one brief across five Codex workflows with the same model configuration and independent checks. Direct stopped at 19 of 20 when keyboard submission failed. Possible reached 20 of 20, but took longer and required approval. One run cannot prove typical superiority; every trace and limitation is public.

**On-screen text:** `DIRECT 19/20 · NOT VERIFIED` / `$POSSIBLE 20/20 · VERIFIED` / `ONE-RUN PILOT — NOT A GENERAL PERFORMANCE CLAIM`

### 2:42–2:55 — Install and close

**Picture:** Three-beat architecture graphic using actual repository labels, then return to the one-command install card. End on wordmark.

**Narration:**

> Possible packages reviewed operational knowledge as open-source TypeScript and installs into a Codex project with one command. Stop prompting tasks. Start specifying outcomes. Make it Possible.

**On-screen text:** `npx @fraylabs/possible@0.1.6 init` then `possible.sh` until `0.1.7` is published and verified

## Exact capture list

Use the production origin when stable; every route below also works from the local web app.

| ID | Route or asset | Capture |
| --- | --- | --- |
| A01 | `https://possible.sh/` | Hero thesis without scrolling. |
| A02 | `https://possible.sh/#try` | One-command install and `$possible` invocation. |
| A03 | `apps/web/public/demo/still/CODEX-THREAD.md` lines 1–51 | Generated Hardware Launch execution prompt. Prefer the public `/demo/still/CODEX-THREAD.md` route for filming. |
| A04 | `https://possible.sh/packs/hardware-launch.json` | Raw typed pack publication; frame outputs, workstreams, guardrails, and verification. |
| A05 | `https://possible.sh/packs/hardware-launch#workstreams` | Owned workstream table and independent-review callout. |
| A06 | `https://possible.sh/packs/hardware-launch#run-prompt` | Generated coordination workflow; expand the prompt and frame the fresh-verifier instruction. |
| A07 | `https://possible.sh/demo/hardware` | Outcome header and `58 / 58 ARTIFACT CHECKS`. |
| A08 | `https://possible.sh/demo/hardware#artifacts` | Integrated launch site. |
| A09 | `https://possible.sh/demo/hardware#film-output` | Film player; use the actual MP4 at `/demo/still/film/still-launch.mp4` for clean full-frame inserts. |
| A10 | `https://possible.sh/demo/hardware#hardware-output` | Four CAD views plus STEP/GLB/STL/source downloads. |
| A11 | `https://possible.sh/demo/hardware#evidence-output` | Evidence index, including the preserved failure. |
| A12 | `https://possible.sh/demo/still/verification/browser-results-initial-failure.json` | Root-relative asset requests and 404 responses. Crop tightly; do not scroll through the full trace. |
| A13 | `apps/web/public/demo/still/CODEX-THREAD.md` lines 247–287 | Exact verifier finding, coordinating-agent repair, fresh rerun, and pass. Prefer the public raw Markdown route or the “FULL CODEX THREAD” panel on `/demo/hardware`. |
| A14 | `https://possible.sh/demo/still/evidence/final-receipt.md` | “Material failure found and repaired” and passed evidence. |
| A15 | `https://possible.sh/demo/still/verification/browser-results.json` | Empty console/page errors and successful post-repair asset paths. |
| A16 | `https://possible.sh/demo/still/verification/artifact-results.json` | `58/58` artifact proof. |
| A17 | `https://possible.sh/benchmarks` | Benchmark gallery. Frame the two outcome comparisons and their one-prompt setup. |
| A18 | `https://possible.sh/benchmarks/outcome-v1/result.md` | Repository-backed fallback for the exact result table and limitations. |
| A19 | `https://possible.sh/benchmarks/outcome-v1/summary.json` | Machine-readable pilot summary; frame `canSupportPerformanceClaim: false`. |
| A20 | `ARCHITECTURE.md` and `packages/packs/src/compiler.ts` | Three-beat source/architecture close. Use editor line highlighting, not a tiny full-file capture. |

## Filming notes

- Capture desktop at 1920×1080 and deliver 1080p. Keep browser zoom consistent.
- Use a large cursor and purposeful movement; remove idle loading and terminal setup.
- Record the real UI first, then add only labels, crops, and the one-line architecture flow in edit.
- Open with the user's knowledge gap, not installation, architecture, pack inventory, or agent counts.
- Make the naïve request and the work Possible inferred visible in the same sequence.
- Keep the initial failure visible for at least three seconds and the limitation disclaimer visible for at least four.
- Say “50 browser responses,” not “50 browser checks.”
- Say “one-run pilot,” never “benchmark proves,” “faster,” or “wins.”
- The repository does not itself prove the GPT-5.6 label. Show or link the official task/session evidence before naming the model in the final submission.
- The Possible pilot used package `0.1.6`; do not imply that the pilot tested the separate `0.1.7` source candidate.
- Do not claim deployment, customer demand, fabrication, production readiness, physical validation, or cross-platform equivalence.
- Keep code and JSON readable: 16–20 px minimum after final 1080p export.
- End no later than 2:57 even if title cards or transitions run long.

## Edit checklist

- [ ] Runtime is 2:57 or less after final encode.
- [ ] The approval gate is visible before execution.
- [ ] A real manifest and compiled workflow are legible.
- [ ] Site, film, and CAD appear as real artifacts.
- [ ] Initial failure, repair, and fresh pass all appear.
- [ ] Pilot tradeoffs and one-run limitation remain on screen.
- [ ] Install command and repository/site identity are readable.
- [ ] The shown npm version matches the published, independently checked package.
- [ ] Captions are burned in or supplied with the upload.
- [ ] Final audio has no clipping and speech remains intelligible at phone volume.
