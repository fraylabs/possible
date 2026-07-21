# Build Week submission completion audit

Audited candidate: Jujutsu commits `ca92a8f6f887a04ed3ab6f4b6d535fcc4f6247f9` and `aa29f2f2d634`, including the local npm preflight and this requirement-by-requirement audit.

This audit treats completion as unproven. Each requirement below names the authoritative evidence, its current decision, and any missing fact.

## Goal outcome

**Requirement:** A judge can assess that Possible reached a verified outcome where Direct did not in the frozen pilot, understand the differing mechanism, and inspect the limits without inferring causality.

**Evidence:** `apps/web/src/App.tsx` (`ProofPage`), `benchmarks/outcome-v1/PUBLIC-PROOF.md`, `benchmarks/outcome-v1/PROTOCOL.md`, `benchmarks/outcome-v1/independent/RESULT.md`, `submission/CLAIM-LEDGER.md`.

**Decision:** **Proved in the local candidate.** The page reports all five workflows, separates outcome from treatment, includes the Direct and Possible tradeoffs, and explicitly rejects typical-performance, speed, statistical, and causal conclusions.

## Required judge experience

### 1. Plain-language thesis

**Evidence:** Homepage hero in `apps/web/src/App.tsx`; opening of `README.md`.

**Decision:** **Proved.** Both state that models perform individual tasks and Possible provides operational knowledge for a verified outcome.

### 2. Five-minute Judge Quickstart

**Evidence:** `README.md` → “Judge Quickstart.”

**Decision:** **Proved with a version disclosure.** It documents Codex/Node/network requirements, the macOS/Linux/Windows evidence boundary, pinned published install, exact-source fallback, sample request, approval step, expected `.possible/` files, fast preserved-evidence path, and troubleshooting. The published registry remains `0.1.6`; local `0.1.7` tarball readiness is separately proved in `submission/NPM-0.1.7-PREFLIGHT.md`.

### 3. Honest controlled-comparison proof surface

**Evidence:** `/proof` implementation in `apps/web/src/App.tsx`; static route `apps/web/app/proof/page.tsx`; `apps/web/public/benchmarks/outcome-v1/{public-proof.md,protocol.md,brief.md,result.md,summary.json}`; repository raw results/transcripts/receipts/screenshots under `benchmarks/outcome-v1/`.

**Decision:** **Proved locally; not live.** The production static export contains `/proof` and all locally hosted evidence URLs. `https://possible.sh/proof` and the public-proof URL currently return 404 because the frozen candidate has not been pushed/deployed; deployment is explicitly approval-gated by `GOAL.md`.

### 4. Visible compiler flow

**Evidence:** `/proof` compiler sequence; pack specification pages; compiled pack JSON; `packages/packs/src/types.ts`; `packages/packs/src/compiler.ts`; compiler tests.

**Decision:** **Proved without schema inflation.** Public copy distinguishes typed manifest fields from the compiler-supplied captain sequence and the outcome-specific checks written only after approval.

### 5. Still failure → repair → fresh pass

**Evidence:** `/demo/hardware#evidence-output`; `apps/web/public/demo/still/CODEX-THREAD.md`; initial and final browser JSON; artifact JSON; final receipt.

**Decision:** **Proved.** The reviewer-owned failure, captain-owned repair, passing rerun, 58 artifact checks, 50 successful browser responses, remaining CAD Viewer limitation, and unproven headless video playback are kept distinct.

### 6. Submission copy and sub-three-minute video package

**Evidence:** `submission/DEVPOST-COPY.md`, `submission/VIDEO-PACKAGE.md`, `submission/CLAIM-LEDGER.md`.

**Decision:** **Proved as local artifacts.** The script targets 2:54 and covers the required problem, product, compiler, artifacts, verification, pilot limitations, installation, and close. Actual recording and upload are external owner actions and are outside the authorized local goal.

### 7. Build Week provenance

**Evidence:** `BUILD-WEEK.md`, repository history, preserved Codex transcripts, `WORKLOG.md`, Devpost placeholders.

**Decision:** **Partially proved by repository evidence.** The observable `afb5fc1` product-reset boundary, before/after state, components, Codex execution, and human decisions are documented. The official eligible start/end commits, exact GPT-5.6 task record, `/feedback` session ID, and final YouTube URL require owner/account evidence and remain explicit placeholders; the repository does not fabricate them.

## Verifiers

- `npm run check`: **passed** after the final claim corrections.
- Packs: **5/5**.
- CLI: **8/8**, canonical three-file snapshot matched.
- MCP: **9/9**.
- Web: **30/30**, including automated accessibility and proof-route behavior.
- Production export: **33/33** static-generation steps; `/proof` emitted.
- Static HTML: **28 routes**.
- Pack publications: **8/8** matched the compiler.
- Demo validator: **passed**.
- `git diff --check`: **passed**.
- Fresh-context claim audit: **materially clean** after corrections; remaining findings are the external deployment, npm decision, and owner evidence listed here.
- `@fraylabs/possible@0.1.7` local tarball: **packed and installed successfully** into a disposable target; publication not performed.

## Missing completion evidence

1. **Fresh visual browser review:** not proved. Across three consecutive goal turns, the permitted browser connection reported no available backend; on the final retry its supported discovery API returned an empty browser list. No desktop/mobile screenshots or manual visual-pass claim were fabricated. Automated accessibility, responsive CSS, static HTML, unit interactions, installation, and local-link checks passed, but they do not substitute for visual inspection.
2. **Live deployment:** intentionally not performed without public-action approval; current live proof URLs return 404.
3. **Owner/account provenance:** the official GPT-5.6 `/feedback` session ID and eligible commit endpoints are unavailable in repository state.
4. **Video:** storyboard exists; recording and public YouTube upload do not.

## Completion decision

**Not complete.** The local implementation and claim audit satisfy every repository-controlled requirement, but the explicit fresh-browser requirement is missing. Public release and owner evidence are also required for the actual Devpost handoff, though `GOAL.md` correctly keeps those external actions approval-gated. Keep the active goal open until those facts are supplied or the browser review can run.
