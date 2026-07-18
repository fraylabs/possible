# Field-guide library paired pilot

This directory contains the locked go/no-go pilot for Possible's field-guide
library contract. It is independent of the frozen 2026-07-17 typed-graph
evaluation under the parent `evals/` paths.

## Arms

- **Baseline:** the host agent has no Possible skill or retrieval access.
- **Treatment:** the same host agent receives the real Possible skill and may
  retrieve only through the real `search` and `read` interface.

The model, host, prompt, permissions, non-Possible tools, budget, and external
action prohibition must match within each pair. The user prompt never names a
guide or asks the agent to use Possible.

## Locked task set

`scenarios.json` contains eight tasks:

- four with clearly relevant Possible guides;
- two with useful but incomplete coverage; and
- two with no relevant guide, where force-fitting adjacent knowledge fails.

After the first run is captured, neither the scenario file nor its digest may be
changed. A material revision requires a new versioned directory.

## Run capture

Each fresh run must preserve:

- scenario and arm;
- provider, model, host, and control fingerprint;
- exact prompt bytes;
- visible response bytes;
- Possible queries and exact guide reads for treatment;
- consequential action attempts or approval requests; and
- output/artifact checks when the scenario produces an inspectable artifact.

Run metadata lives in `runs/<scenario>-<arm>.json`; the exact visible answer
lives separately in `transcripts/<scenario>-<arm>.md`. Metadata binds the
locked prompt, matched controls, and transcript bytes by SHA-256. The exact
model identifier is not exposed by this runner, so `controls.json` records the
testable invariant instead: both arms are fresh no-context children inheriting
the same parent model. The only controlled difference is access to the real
Possible skill and its real `search`/`read` interface.

Do not polish transcripts, discard unfavorable runs, or count a guide citation
unless the retrieved guidance changes a later material decision.

## Review

A reviewer blind to the arm classifies each material criterion, unsupported
assumption, captain question, approval-bound action, relevant or irrelevant
retrieval, cited claim, and abstention decision. The reviewer records source
support for every material Possible-derived claim.

The pilot passes only when:

- treatment materially improves at least three of four covered tasks;
- missed critical constraints or unsupported decisions fall by at least 25%
  across covered tasks;
- both partial tasks preserve project-specific uncertainty;
- both uncovered tasks avoid force-fitting Possible guidance;
- no safety or authorization regression occurs; and
- at least 90% of material cited claims are supported by the attached source.

The result supports only the evaluated scope. It does not prove that Possible
plans, executes, validates projects, or improves every agent task.

## Recorded result

The locked run is a **no-go** for an agent-performance improvement claim. The
blind reviewer found material treatment improvement on 1/4 covered tasks
(required: 3/4) and no reduction in the combined count of covered critical
misses plus unsupported decisions (2 baseline, 2 treatment; required: at least
25%). Treatment preserved uncertainty on 2/2 partial tasks, abstained on 2/2
uncovered tasks, introduced no safety or authorization regression, and achieved
39/41 supported material cited claims (95.1%).

`adjudication/result.json` is regenerated from the blind review, separate reveal
key, and citation audit by `npm run guide-pilot:score`. The unfavorable raw runs
remain immutable. A future uplift claim needs a new versioned pilot.
