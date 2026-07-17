# Independent MVP review

Review date: 2026-07-17
Scope: the standalone Possible repository and its current Fray-root registration.

## Verdict

**LOCAL CLOSURE PASS; ONLY RENDERED VISUAL ACCEPTANCE REMAINS.** The current
local checkout
supports the narrow claim that an agent can retrieve the same validated,
contributor-authored graph used by the production web build through exactly four
read-only MCP operations, and that the locked evaluation artifacts regenerate
the reported scores deterministically. The evidence also clearly limits those
scores to handoff dialogue: it proves no deployed dashboard, CAD model, live
quote, purchase, order, fabrication, or rendered visual quality.

The two prior local findings are resolved: the real-graph website integration
suite now runs inside the primary verifier, and the provenance count is scoped
precisely. No local code, verifier, receipt, or claim-alignment finding remains
open from this audit. The MVP must not be called fully complete until the sole
rendered visual-review gate is satisfied.

## Commands and concrete receipts

- `npm run check` in this repository: exit 0. It validated 48 nodes, 134 edges,
  and 11 collections; validated the Skill; passed knowledge 8/8, MCP 6/6, web
  behavior/accessibility 14/14, **real-graph integration 2/2**, and eval 18/18
  tests; built every workspace; and regenerated a scored report containing four
  pairs and no pending scenario. The command output confirms `test:data` is in
  the primary `test` chain rather than an out-of-band reviewer command.
- `npm run check` at `/Users/brianlim/coding/fray`: exit 0 (29 workspace cases
  and 5 media-harness cases). `git diff --check` exited 0 in both repositories;
  the additional child index check also exited 0 (the index itself was empty).
- Independent graph readback: 48 nodes and 134 edges; domains are Web 18 and
  manufacturing 30; node types are 12 topics, 11 practices, 12 tools, 7
  providers, and 6 actions. All 6 actions are `external-approval` actions and
  all 7 providers require a live check.
- Real stdio MCP probes all exited 0: search returned
  `web/outcomes/dashboards`; exact read returned that node; one-hop expansion
  returned 4 nodes/8 edges; CNC capability matching returned Protolabs and
  Xometry with approval-gated quote actions.
- `npm run test:data -w @possible/web`: 2/2 against the real graph export. The
  closure rerun reached this command through `npm run check`. The production
  bundle contains real Web/manufacturing node IDs and no test-fixture IDs. The
  production build emitted `index.html`, 26.17 kB CSS, and 364.19 kB JavaScript
  (pre-gzip sizes for assets as reported by Vite). A curl-only local
  development-server check returned HTTP 200 during the initial audit; no
  browser was opened.
- Locked scenario SHA-256 values match the manifest:
  `181301af...a063bc` (dashboard) and `bd19b663...852aa` (motor bracket). The
  current Skill matches the revision-2 receipt digest
  `145dd8bd...85641`.
- A fresh report generated outside the repository was byte-identical to
  `evals/reports/latest.json`; both SHA-256 values were
  `84d800f3...f22b`, matching `WORKLOG.md`. All 8 transcript digests match their
  receipts, and all receipt/scenario digests match the locked scenarios. The
  strengthened closure run regenerated the same report hash.

## Claim-by-claim findings

| Claim | Finding |
| --- | --- |
| Shared graph and read-only agent interface | **Verified locally.** The MCP server exposes exactly `search_knowledge`, `read_node`, `expand_node`, and `find_capabilities`, all annotated read-only/non-destructive/idempotent. No provider-write path was found. |
| Human projection uses the shared graph | **Verified for code, integration, and production build.** Search/path/graph/detail behavior and trust fields are covered by tests, and the production bundle carries the real graph. Rendered layout and polish are not verified. |
| Deterministic evaluation | **Verified.** Scenario locks, transcript/receipt binding, current-node revision checks, pair controls, raw metrics, score arithmetic, report ordering, and byte-identical regeneration all passed. Determinism validates the calculation, not the truth of human/agent annotations. |
| Revision-1 failure and revision-2 iteration | **Honestly disclosed and aligned.** V1 dashboard implementation questions worsened 1 to 2 and bracket tied 2 to 2. V2 improved dashboard 3 to 0 and bracket tied 0 to 0 after the Skill added an explicit captain-versus-implementation boundary whose current digest and validator both pass. |
| Score claims | **Exact match.** V1 dashboard `51.49 -> 69.29 (+17.80)`; V1 bracket `42.19 -> 61.94 (+19.75)`; V2 dashboard `41.22 -> 81.00 (+39.78)`; V2 bracket `51.09 -> 71.09 (+20.00)`. |
| Supported-claim limitation | **Correctly disclosed.** Supported-claim points are 0 in every V2 arm. Unsupported material claims fell 23 to 10 (dashboard) and 21 to 6 (bracket), so they were reduced by 13 and 15, not eliminated. The V2 bracket's entire +20 score delta is contributor-knowledge credit, not outcome proof. |
| Controls and timestamps | **Internally consistent and honestly described.** Each pair has the same provider/model/host/fingerprint, distinct session IDs, disabled baseline access, and enabled treatment access. The V1/V2 control descriptors hash exactly to their recorded fingerprints. Event indexes/times are ordered and in-window. The receipts explicitly say event times are monotonic reconstructions around source-copy time, not original model timestamps; the exact model is recorded only as `inherited-parent-model`. |
| External actions and artifacts | **No completion claim.** Across all 8 transcripts there are zero `action-attempted`, zero `action-completed`, and zero artifact events. Deployment, local app/CAD creation, upload, quote, payment, order, and fabrication appear only as proposed approval gates. `RESULT.md:86-104` states the resulting non-proof accurately. |
| Fray-root registration | **Verified in the current working copy.** `possible` appears consistently in `AGENTS.md`, root `README.md`, `repos/README.md`, and `registry.json`; the registry name is unique, the path is `repos/possible`, the child is ignored by the root, and it is a separate Git/jj repository. |

## Resolved closure findings

1. **Primary-verifier web coverage — resolved.** `package.json:13` now places
   `npm run test:data -w @possible/web` directly after the fixture-backed web
   behavior suite. The independent closure run showed 14/14 behavior and
   accessibility tests followed by 2/2 tests against the real graph export;
   `RESULT.md:41-42` reports those receipts separately.
2. **Provenance wording — resolved.** `RESULT.md:17-18` now says exactly
   “recommendation-provenance” and “recommendation source URLs.” Independent
   recount is 61 recommendation references across 43 recommendation URLs; the
   broader graph still contains 87 source objects across 49 URLs, so the revised
   wording no longer overgeneralizes the narrower count.

`WORKLOG.md:68-79` durably records the audit, both findings, remediation, and the
unchanged visual gate.

## Remaining risks and limitations

1. Evaluation receipts are strong local audit artifacts, not provider-signed
   telemetry. The source captures declare fresh sessions, fixed answers, and
   discarded-run reasons; discarded run contents are not retained, and the
   original model timestamps/model version are unavailable. Independent trust
   therefore ends at the captured bytes, hashes, metadata, and scorer behavior.
2. Live provider suitability, prices, plans, regions, materials, inspection,
   delivery, and terms remain intentionally unverified. No external action is
   authorized by this review.
3. **Local commit durability is verified; remote durability is not.** The
   verified Possible implementation snapshot is local jj commit `a2d3c7a4`
   (`Build and verify Possible agent knowledge MVP`), which is contained in the
   child repository's `main` history together with this audit receipt. The Fray
   registration is local jj commit `38606e25` on bookmark
   `codex/register-possible` (`Register Possible child repo`). Independent
   inspection found both working copies clean immediately above the verified
   commits. The child has no configured Git remote; Fray has `origin`, but the
   registration bookmark has no `@origin` remote bookmark. Neither bookmark was
   pushed or deployed, so remote publication and deployment remain untrusted.

## Exact remaining completion gate

No local remediation remains open. The **single remaining product-completion
gate** is a **human-visible rendered review of the
current reviewed web build**. The approved in-app Browser denied the localhost
URL, and this audit used no Browser, Playwright, Chrome, Computer Use, or policy
bypass. Completion therefore requires explicit approval for a non-production
public preview on a provider-generated URL, with no custom DNS, production
promotion, unbounded credentials, or cost exposure; then the rendered desktop,
tablet, and mobile search/path/graph/detail flows, trust fields, links, and
approval labels must be visually inspected and the result recorded. The local
checks and diff checks must still pass afterward. Until that receipt exists,
Possible is independently trusted as a runnable local MVP mechanism, not as a
visually accepted or externally delivered product. This closure review neither
performs nor authorizes the preview deployment.
