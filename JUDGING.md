# OpenAI Build Week judging evidence

Possible is a Developer Tools submission built with Codex using GPT-5.6. It is an open-source library of Outcome Packs: reusable execution prompts and selected agent skills that coordinate ambitious outcomes involving dozens of tasks. The [Build Week record](BUILD-WEEK.md) fixes the submission window, commit range, Codex session and demo video.

## Official judging criteria

| Criterion | Claim | Implementation fact and direct evidence | Significance |
| --- | --- | --- | --- |
| **Technological Implementation** | Possible compiles outcomes instead of returning a static prompt. | The [compiler](https://github.com/fraylabs/possible/blob/main/packages/packs/src/compiler.ts) transforms typed manifests into install commands and an execution prompt with owned workstreams, approval gates, verification and completion reporting. | One reviewed contract controls preparation, execution and completion. |
| **Design** | Complete outcomes remain inspectable instead of disappearing into agent logs. | The public [Still demo](https://possible.sh/demo/hardware) presents the generated site, film, CAD, receipts and review evidence together. | People can inspect both the product and its proof. |
| **Potential Impact** | A rough ambition can become coordinated specialist work without requiring the user to enumerate every task. | The preserved [Still run](https://github.com/fraylabs/possible/blob/main/apps/web/public/demo/still/CODEX-THREAD.md) expands one hardware brief into site, film, CAD and independent-review workstreams. | Possible reduces coordination burden while preserving explicit limits. |
| **Quality of the Idea** | Outcome Packs are a distinct layer above prompts, skills and agents. | The [Hardware Launch manifest](https://github.com/fraylabs/possible/blob/main/packages/packs/src/hardware-launch.ts) binds reviewed skills to owned workstreams, outputs, safeguards and fresh verification. | It packages operational judgment, not only model capability. |

## Why this is not a wrapper

| Approach | Primary unit | Workstreams and gates | Independent verification | Completion evidence |
| --- | --- | --- | --- | --- |
| Prompt library | Text | Not inherent | Not inherent | Not inherent |
| Skill wrapper | Capability | Not inherent | Not inherent | Not inherent |
| Agent wrapper | Agent or tool call | Runtime-dependent | Optional | Optional |
| **Possible** | Typed outcome manifest | Declared | Required | Required |

Possible uses prompts, skills and agents as ingredients. Its product boundary is the compiled outcome contract: ownership, dependencies, approvals, definition of done and preserved evidence.

## Guided evidence trail: Still

1. **Intake:** the [confirmed product brief](https://github.com/fraylabs/possible/blob/main/apps/web/public/demo/still/PRODUCT-BRIEF.md) records facts, constraints, required outputs and acceptance checks.
2. **Compiled workstreams:** the [generated run prompt](https://github.com/fraylabs/possible/blob/main/apps/web/public/demo/still/CODEX-THREAD.md#run-prompt) assigns site, film and CAD ownership before execution.
3. **Verification failure:** the [first browser trace](https://github.com/fraylabs/possible/blob/main/apps/web/public/demo/still/verification/browser-results-initial-failure.json) preserves the integrated site’s asset-path 404s.
4. **Repair:** the [fresh-review receipt](https://github.com/fraylabs/possible/blob/main/apps/web/public/demo/still/evidence/final-receipt.md#material-failure-found-and-repaired) records the relative-base fix and mandatory rerun.
5. **Passing completion:** the [outcome receipt](https://github.com/fraylabs/possible/blob/main/apps/web/public/demo/still/OUTCOME-RECEIPT.md) reports the post-repair browser pass, 58/58 artifact audit and remaining limitations.
