# Possible — submission claim ledger

Use this ledger when editing the Devpost page, captions, overlays, or narration. A claim is safe only at the stated scope.

| Claim | Evidence | Safe scope / required qualifier |
| --- | --- | --- |
| Possible.sh is an open-source library of Outcome Packs for Codex. | `packages/packs/src/types.ts`, `packages/packs/src/compiler.ts`, `skills/possible/SKILL.md`, `ARCHITECTURE.md` | Product description, not a performance result. |
| The compiler is deterministic and the typed registry feeds the website, static publications, and MCP tools. | `packages/packs/src/compiler.ts`, `packages/packs/test/compiler.test.mjs`, `ARCHITECTURE.md` | Deterministic for a given manifest; do not imply deterministic model execution. The installed skill has a separate fallback snapshot that can lag. |
| Possible waits for approval before agent-skill installation, project-state writes, or production execution. | `skills/possible/SKILL.md` under “Recommend one pack” and “Compile after confirmation” | Read-only intake and project inspection may happen before approval; the Possible skill itself was installed earlier. Run approval authorizes disclosed repo-local work only. |
| Outcome Packs define reviewed capabilities, bounded work, outputs, safeguards, and verification. | `packages/packs/src/types.ts`, `packages/packs/src/hardware-launch.ts` | The manifest has no dependency/order or typed completion-check field. The generator supplies a fixed coordination sequence; the approved run writes outcome-specific checks into the shared brief. |
| The Still run produced a site, 24-second 1080p film, STEP-first CAD, waitlist contract, and evidence room. | `apps/web/public/demo/still/OUTCOME-RECEIPT.md`, `apps/web/public/demo/still/manifest.json` | Still is fictional; artifacts were produced and checked locally, not deployed or fabricated. |
| A fresh reviewer found an integrated-site asset-path failure. | `apps/web/public/demo/still/CODEX-THREAD.md`, `apps/web/public/demo/still/evidence/final-receipt.md`, `apps/web/public/demo/still/verification/browser-results-initial-failure.json` | The JavaScript and CSS returned 404 inside the integrated room; the raw site itself was not the failed claim. |
| The reviewer did not repair implementation. | `apps/web/public/demo/still/CODEX-THREAD.md` at the independent-review step; `evidence/final-receipt.md` | The coordinating agent made the Vite `base: "./"` repair, then review reran. |
| The repaired Still outcome passed 58/58 artifact checks. | `apps/web/public/demo/still/verification/artifact-results.json`, `evidence/final-receipt.md` | Artifact audit only; do not inflate this into 58 user tests. |
| The final Still browser trace had 50 successful responses and zero console/page/non-OK errors. | `apps/web/public/demo/still/verification/browser-results.json`, `evidence/final-receipt.md` | Say “50 browser responses,” not “50 browser checks.” Headless browser video playback remained unproven. |
| The controlled pilot gave the same brief to five fresh Codex workflow conditions and used a common independent verifier. | `benchmarks/outcome-v1/PROTOCOL.md`, `benchmarks/outcome-v1/independent/RESULT.md` | Same model configuration was inherited; the repository does not independently attest the GPT-5.6 label. Conditions differed by required coordination treatment. |
| Direct stopped at 19/20; Possible reached 20/20. | `benchmarks/outcome-v1/independent/RESULT.md`, `apps/web/public/benchmarks/outcome-v1/summary.json` | Exact observation from one run per condition. Direct's failing check was production-browser keyboard addition. |
| Possible took 1,850 seconds and required two follow-ups, 14 words, and one approval. | Same independent result and summary JSON | Include when comparing outcomes so the tradeoff remains visible. Direct stopped at 715 seconds with no follow-ups. |
| The pilot proves Possible is typically better or causes superior outcomes. | No supporting evidence. Protocol explicitly rejects this. | **Do not claim.** No replication, randomization, variance estimate, or confidence interval. |
| Spec and Plan both produced verified outcomes. | `benchmarks/outcome-v1/independent/RESULT.md` | Their assigned treatments failed. Do not count them as treatment-compliant wins or hide them. |
| Possible CLI source candidate is version 0.1.8 and requires Node 22+. | `apps/cli/package.json` | npm serves 0.1.7. The Possible pilot used 0.1.6. Never imply the pilot tested 0.1.7 or 0.1.8. |
| Possible works across macOS, Linux, and Windows. | Not established by the demo or pilot. | **Do not claim cross-platform outcome equivalence.** State Codex + Node 22+ requirements and the locally verified environment. |
| Possible has customer validation or proven productivity gains. | No supporting evidence in this repository. | **Do not claim.** The target user and impact are product hypotheses pending user studies and repeated runs. |

## Language to keep consistent

**Thesis:** Models know how to perform individual tasks. Possible provides the operational knowledge to coordinate those tasks into a verified outcome.

**Mechanism:** Skills give agents capabilities. Outcome Packs coordinate them toward a complete result.

**Verification turn:** Production is not completion. Possible stops only when the outcome passes—or returns an honest no-go.

**Pilot qualifier:** This one-run pilot is evidence from these runs—not proof of typical superiority.

**Close:** Stop prompting tasks. Start specifying outcomes. Make it Possible.
