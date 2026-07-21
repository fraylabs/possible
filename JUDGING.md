# OpenAI Build Week judging evidence

Possible turns one rough idea into a coordinated, independently verified outcome. A robotics novice asked for a robot snake. Possible supplied the missing engineering work and produced CAD, URDF/SRDF, MuJoCo control, obstacle avoidance, Rerun telemetry, 12 passing tests, and 186 interface checks. Fresh verification also found and repaired three defects. See the [Robot Snake run](https://possible.sh/demo/robot-snake).

Possible is a Developer Tools submission built with Codex using GPT-5.6. Its open-source Outcome Packs combine reusable execution prompts, selected agent skills, workstreams, safeguards, and completion checks. The [Build Week record](BUILD-WEEK.md) documents the session, submission period, and demo video.

## Official judging criteria

| Criterion | Claim | Evidence | Why it matters |
| --- | --- | --- | --- |
| **Technological Implementation** | Typed Outcome Packs coordinate execution and verification. | The [compiler](https://github.com/fraylabs/possible/blob/main/packages/packs/src/compiler.ts) converts manifests into skill installs, owned workstreams, approval gates, and completion requirements. | One contract governs the run from preparation through verification. |
| **Design** | Each demo presents the outcome beside its proof. | The [demo gallery](https://possible.sh/demo) exposes four visual outcomes and their preserved evidence. | Judges can inspect the work without reading agent logs first. |
| **Potential Impact** | Possible supplies work a novice did not know to request. | The [Robot Prototype pack](https://github.com/fraylabs/possible/blob/main/packages/packs/src/robot-prototype.ts) covers mechanical design, simulation, control, telemetry, safety, and review. | One rough request can start multidisciplinary work outside existing expertise. |
| **Quality of the Idea** | Outcome Packs make operational judgment reusable. | The [Robot Snake intake](https://github.com/fraylabs/possible/blob/main/apps/web/public/demo/robot-snake/INTAKE-TRANSCRIPT.md) begins with an ambition, then produces an inspectable [completion report](https://github.com/fraylabs/possible/blob/main/apps/web/public/demo/robot-snake/evidence/outcome-receipt.md). | The system transfers more than a single capability or instruction. |

## Guided evidence trail

1. **Intake:** the [confirmed Still brief](https://github.com/fraylabs/possible/blob/main/apps/web/public/demo/still/PRODUCT-BRIEF.md) records the user’s constraints and acceptance checks.
2. **Compiled workstreams:** the [run transcript](https://github.com/fraylabs/possible/blob/main/apps/web/public/demo/still/CODEX-THREAD.md#run-prompt) assigns site, film, and CAD ownership.
3. **Verification failure:** the [initial browser trace](https://github.com/fraylabs/possible/blob/main/apps/web/public/demo/still/verification/browser-results-initial-failure.json) records asset-path failures.
4. **Repair:** the [review receipt](https://github.com/fraylabs/possible/blob/main/apps/web/public/demo/still/evidence/final-receipt.md#material-failure-found-and-repaired) records the fix and required rerun.
5. **Passing completion:** the [completion report](https://github.com/fraylabs/possible/blob/main/apps/web/public/demo/still/OUTCOME-RECEIPT.md) reports the browser pass, 58/58 artifact audit, and remaining limits.
