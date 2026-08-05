# Smallest falsifiable validation experiment

## Hypothesis

A developer can use PatchProof to identify unsupported or contradictory completion claims faster and more reliably than by reading an unstructured agent summary plus raw logs.

## Phase A — local product truth

Build one browser-only flow with no backend:

1. paste a task, unified diff, and command log;
2. parse changed files and command outcomes;
3. let the user create or confirm completion claims;
4. require every claim to reference evidence or remain `unsupported`;
5. export deterministic Markdown and JSON receipts.

Test with at least 12 repository-local fixtures covering:

- passing test evidence;
- a non-zero command hidden below later output;
- skipped checks;
- claimed tests with no test command;
- claimed files absent from the diff;
- UI completion with no visual evidence;
- stale or ambiguous logs;
- unrelated file changes;
- binary files;
- empty diff;
- malformed input;
- explicit limitations.

**Pass gate:** 12/12 fixtures produce the expected verdict, the same input produces byte-equivalent normalized JSON, and no fixture is labeled verified when required evidence is absent.

## Phase B — user-value test (requires separate outreach approval)

Give five developers two blinded review tasks each: one raw summary/log bundle and one PatchProof receipt for matched fixtures. Counterbalance order.

Record:

- time to correctly identify the unsupported claim;
- incorrect accept/reject decisions;
- whether the receipt was understood without explanation;
- preference and reason.

**Pursue launch work if:** at least four of five correctly identify the unsupported claim with PatchProof, median review time improves by at least 30%, and no participant mistakes “receipt generated” for “code proven correct.”

**Investigate if:** accuracy improves but the interaction is slower or confusing.  
**No-go if:** raw logs perform as well or better, or users treat the receipt as false assurance despite revised language.

Phase B has not run. No outreach is authorized in this stage.
