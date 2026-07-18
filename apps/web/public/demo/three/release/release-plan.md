# Three release readiness plan

Plan status: **local package ready; public release not ready and not authorized**  
Scope: the locally runnable launch package described in `.possible/outcome-brief.md`  
Readiness basis: evidence, not a calendar date  
Last plan update: 2026-07-19

## Decision summary

Three is ready as a **local launch package** because every required local gate in this plan has a passing post-repair receipt from a fresh reviewer. That local decision covers a real browser product, a truthful launch site, a rendered demo film, and this release plan. It does not mean that Three is deployed, publicly available, production-ready, secure, legally reviewed, validated by users, or supported.

Three is **not ready for public release**. Public-release work remains both unproven and unauthorized. The future checklist below is planning material only; checking a box never substitutes for fresh, explicit authorization before an external action.

## Readiness states

| State | Meaning | Current state |
| --- | --- | --- |
| Local package ready | All gates `L0`–`L8` pass in one integrated revision, required evidence is retained, and there are no unresolved critical findings. | **Ready locally; L0–L8 passed** |
| Public-release ready | A separately authorized release candidate has hosting, representative browser/device coverage, security/privacy review, accessibility validation, legal review, support ownership, and rollback rehearsal. | **Unproven / not ready** |
| Publicly released | An authorized operator has deliberately published a reviewed revision and recorded the resulting URL, revision, time, and owner. | **Prohibited in this workstream / not taken** |

No artifact should display a “ready,” “launched,” “live,” “available now,” or equivalent public-status statement on the strength of local readiness alone.

## Artifact inventory and ownership

The paths below are the integration contract. If implementation chooses a different file name, update this inventory before final verification rather than leaving an ambiguous receipt.

| ID | Expected artifact | Required content | Current evidence state |
| --- | --- | --- | --- |
| A1 | `product/` | Real browser product implementing the product contract and versioned `localStorage`. | **Verified locally** by L2, L4, L5, and L6 |
| A2 | `site/` | Local launch page with truthful audience, behavior, privacy boundary, status, demonstration, and run instructions. | **Verified locally** by L3, L5, and L6 |
| A3 | `film/` | Editable Remotion source consistent with verified product states. | **Verified locally** by L3 and L7 |
| A4 | `film/out/three-demo.mp4` | Locally rendered 16:9 MP4, approximately 15–30 seconds. | **Verified locally** by L7; 22.059 s, 1920×1080 H.264 |
| A5 | `release/RELEASE-PLAN.md` | This readiness, risk, claims, recovery, and future-release plan. | **Current and verified** by L1 and final sign-off |
| A6 | `release/verify-release-plan.mjs` | Dependency-free structural verifier for this plan. | **Executed successfully** in L1 and L8 |
| A7 | `README.md` | Integrated local install, run, test, build, film-render, and evidence instructions. | **Present and reviewed** in L8 |
| A8 | `package.json` and lockfile | Root command contract below and a reproducible dependency graph. | **Verified locally** by L0, L3, and L8 |
| A9 | `evidence/` | Fresh receipts for `L0`–`L8`, including failures, repairs, skips, and unproven checks. | **Complete**; first failure retained under `evidence/failed-review-01/` |

Generated dependencies, caches, development servers, and build directories are not release artifacts. The film MP4 is a deliverable; other generated outputs should be reproducible from source.

## Exact local verification gates

All commands run from the repository root on the same integrated tree. The root script names are the verified command interface. The post-repair reviewer reran them from a clean root lockfile install; the final exact-tree rerun is recorded under `evidence/`.

For every gate, record the command, UTC timestamp, revision or tree identifier, environment versions, exit code, and output summary under `evidence/`. A zero exit code without the described assertions is insufficient. Do not convert skipped or unavailable checks into passes.

| Gate | Exact command | Pass condition | Required receipt | Status |
| --- | --- | --- | --- | --- |
| L0 — toolchain | `node --version && npm --version && test -f package-lock.json && npm ci` | Supported Node/npm versions are recorded; the committed lockfile exists; clean install exits 0. | `evidence/L0-toolchain.md` | **Pass** |
| L1 — release-plan consistency | `node release/verify-release-plan.mjs` | Required sections, claim classifications, and “not taken” external-action records are present. | `evidence/L1-release-plan.md` | **Pass** |
| L2 — static and unit checks | `npm run test:unit` | Storage parsing and schema versioning, malformed/unknown data handling, empty-input rejection, the hard three-item invariant, completion toggling, deletion, and slot reuse are asserted and pass. | `evidence/L2-unit.md` | **Pass** |
| L3 — production builds | `npm run build` | Product, site, and editable film source compile from a clean install with no build errors; output paths are recorded. | `evidence/L3-build.md` | **Pass** |
| L4 — real-browser contract | `npm run test:browser` | In a real browser: add three, reject a fourth, complete and uncomplete, reload and retain text/state, delete, reuse freed slot; no unexpected console/page errors. | `evidence/L4-browser.md` | **Pass** |
| L5 — responsive and accessibility review | `npm run verify:ui` | Product and site are inspected at narrow mobile and desktop widths; no overlap/horizontal scroll; keyboard flow, visible focus, accessible names, contrast, and reduced motion pass. Findings include file/line or captured-state references. | `evidence/L5-ui.md` | **Pass** |
| L6 — privacy/runtime boundary | `npm run verify:privacy` | Source and runtime review find no account, sync, backend, analytics, telemetry, tracking cookie, remote font, or commitment-data request; the tested network conditions and known exceptions are recorded. | `evidence/L6-privacy.md` | **Pass** |
| L7 — film render and inspection | `npm run film:render && npm run film:verify` | `film/out/three-demo.mp4` renders; duration is 15–30 seconds; representative frames show overload → choose up to three → complete → done, without clipping, contradiction, or prohibited claims. | `evidence/L7-film.md` | **Pass** |
| L8 — integrated verifier | `npm run verify` | Runs or explicitly aggregates `L1`–`L7` after `L0`; reports passed, failed, skipped, and unproven checks; no required gate is failed or skipped. | `evidence/L8-integrated.md` | **Pass** |

### Browser evidence minimum

`L4` must record browser name/version, viewport, initial storage state, each action, the rejected fourth-item behavior, the exact reload observation, and console errors. At minimum, run one current Chromium-family browser locally. Other engines and real devices stay unproven unless actually tested; simulated viewport resizing is not physical-device evidence.

`L5` must inspect at least 360 × 800 and 1440 × 900 CSS pixels for both product and site, plus 200% text zoom or the nearest repeatable equivalent. Test complete keyboard operation and a reduced-motion preference. Automated accessibility output may support but cannot replace manual keyboard and visual inspection.

The `L5` code review must use the then-current Web Interface Guidelines source named by the reviewed repository skill and retain concise `file:line` findings. In particular, inspect semantic controls and heading order, input labels/names/autocomplete behavior, live announcement of validation, visible `:focus-visible` treatment, zoom availability, reduced-motion handling, explicit transition properties, long commitment text, mobile safe areas, image dimensions/alt text, and confirmation or undo for destructive removal. A guideline finding is not a pass merely because the interface looks acceptable in screenshots.

### Film evidence minimum

`L7` must record the exact output path, codec/container metadata, pixel dimensions, frame rate, duration, render command, and at least four representative frame timestamps. Frame review must compare product copy, colors, limit behavior, and completion state against the integrated product—not an earlier mockup.

### Evidence decision rule

- **Pass:** the required assertion was directly exercised on the integrated revision and its receipt is reproducible.
- **Fail:** an assertion was exercised and did not meet the pass condition.
- **Skipped:** the check was expected but not run or its tool/environment was unavailable.
- **Unproven:** the proposition cannot be established by the available local check (for example real-user benefit or production security).
- **Pending:** evidence is expected from an unfinished workstream or has not yet received independent review.

Only Pass satisfies a required local gate. A later repair must retain the meaningful failure in the receipt and append the rerun result.

## Claims ledger

This ledger is the source of truth for public-facing product, site, film, README, and release copy. Any new factual or comparative claim must be added here with a classification and evidence before use. “Verified” means locally verified only unless the evidence explicitly says otherwise.

| Claim ID | Public-facing claim or topic | Classification now | Allowed wording / rule | Evidence needed to change status |
| --- | --- | --- | --- | --- |
| C01 | Three lets a person commit to up to three things. | **Verified** | Use “up to three”; do not say people must invent exactly three. | L2 unit and L4 browser invariant receipts |
| C02 | “Three things. Then you’re done.” | **Verified** | Positioning line tied to the conclusive UI, not evidence that users feel better. | L4 all-done-state receipt |
| C03 | Commitments and completion survive reload. | **Verified** | Say “survives a browser reload,” not “never loses data.” | L2 storage and L4 reload receipts |
| C04 | Commitment data is stored locally in this browser. | **Verified** | Disclose that browser/site-data clearing can remove it and origins do not share it. | L6 storage source and runtime network receipt |
| C05 | No account is required or offered. | **Verified** | Precise statement about this local build only. | L5 UI and L6 source/runtime receipts |
| C06 | No backend, sync, analytics, telemetry, or tracking is included. | **Verified** | Name the checked behaviors; do not collapse them into “perfect privacy.” | L6 source, dependency, storage, and network receipt |
| C07 | Three is local-only: commitments use versioned `localStorage` in this browser and are not synced. | **Verified** | Explain browser storage; clearing data can remove it, and another browser, device, or origin has no copy. Do not imply sync-aware architecture or certified privacy. | L6 plus reviewed product/site/film copy |
| C08 | Three works offline. | **Prohibited** | Do not claim unless a defined cold/repeat-load offline scenario is implemented and tested. Running a local dev server is not offline support. | Explicit offline specification and browser receipt |
| C09 | Three is private, secure, compliant, or production-ready. | **Unproven** | Do not use broad assurances. State only the precise locally verified data boundary. | Appropriate independent security/privacy/legal review; production evidence |
| C10 | Three is accessible or WCAG-conformant. | **Unproven** | Describe tested features only: keyboard, focus, names, contrast, reduced motion. Do not claim certification or conformance. | Scoped accessibility audit and assistive-technology/user evidence |
| C11 | Three makes people feel done, less buried, calmer, or more productive. | **Unproven** | “Designed to help” is an aspiration; never present it as measured effect. | Ethical user research with defined method and authorization |
| C12 | Builders love, use, recommend, or pay for Three. | **Prohibited** | No testimonials, counts, ratings, demand, retention, or willingness-to-pay claims. | Authorized, genuine, auditable user evidence |
| C13 | Three is live, launched, publicly available, or available at a URL. | **Prohibited** | Say “local prototype/package” or “not publicly released.” | Separately authorized publication and recorded live verification |
| C14 | Three is fast, reliable, cross-browser, or works on all devices. | **Unproven** | Report only named local measurements and tested browser/version/device combinations. Never say “all.” | Defined budgets and representative test matrix |
| C15 | Commitments reset, archive, or change automatically at midnight. | **Prohibited** | “Today” is the focusing frame; do not imply rollover behavior unless specified and tested. | Product decision plus date/time-zone and rollover tests |
| C16 | Three is free, free forever, or has a particular license. | **Prohibited** | No pricing, permanence, or licensing promise has been authorized. | Owner decision and published legal/license terms |
| C17 | The demo film depicts the real product contract. | **Verified** | State only that the local film depicts the verified limit, completion, and done states; it does not prove user benefit or public availability. | L7 integrated comparison receipt |

## Known limitations and unresolved decisions

- Browser storage can be cleared by the person, browser, private-session policy, device management, storage pressure, or site-origin changes. There is no verified export, import, backup, recovery, or sync mechanism.
- The behavior across calendar-day and time-zone changes is not specified by the confirmed contract. Copy must not imply an automatic midnight reset, history, or archive.
- A local server origin and a future hosted origin do not share `localStorage`; a public deployment would begin with separate storage and could create origin-migration questions.
- “Feel done rather than buried” has only a heuristic design target, not user-validation evidence.
- Coverage beyond the exact browser, OS, viewports, and assistive technologies recorded in evidence is unproven.
- Static/local-only architecture reduces server-side exposure but does not eliminate client-side injection, dependency, build-chain, browser-storage, or hosting risks.
- No public support channel, incident owner, service expectation, privacy contact, or vulnerability-reporting path exists.
- No trademark, copyright, third-party asset/license, terms, consumer-law, or jurisdiction-specific privacy review has been completed.

## Risk register before any public release

| Area | Concrete risk | Required mitigation/evidence | Public status |
| --- | --- | --- | --- |
| Browser/device | `localStorage`, focus, viewport, fonts, and media behavior vary by engine, OS, private mode, and embedded browser. | Test a named, supported matrix including current Chrome/Edge, Firefox, desktop/mobile Safari, real narrow device, zoom, and storage-disabled/cleared cases; publish the matrix. | **Unproven** |
| Data recovery | Local data may disappear and cannot currently move between origins/devices. | Decide whether clear-data warning, export/import, backup, or explicit ephemerality is appropriate; test recovery and schema migration. | **Unproven** |
| Security | Stored text is untrusted input; dependency/build compromise or unsafe DOM rendering could introduce XSS. | Threat model; dependency/license review; test escaping and malformed storage; inspect CSP/headers for hosted build; independent review before production claims. | **Unproven** |
| Privacy | A host may retain request/IP logs even when the app sends no commitment data or analytics. | Document exact data flow, dependencies, storage keys/retention, hosting logs, cookies, subprocessors, deletion behavior, and jurisdictional obligations. | **Unproven** |
| Accessibility | Heuristic and automated checks may miss screen-reader, switch, cognitive, zoom, and high-contrast barriers. | Test with named assistive technologies and representative users; remediate findings; scope any conformance claim. | **Unproven** |
| Performance/reliability | Local build success does not establish field performance, cache behavior, availability, or safe upgrade behavior. | Set budgets; measure representative devices/networks; validate cache and storage-schema upgrades; define monitoring without violating the no-analytics decision. | **Unproven** |
| Legal/licensing | Name, copy, fonts, visuals, music, code, and dependencies may carry rights or notice obligations. | Trademark search/advice as appropriate; dependency/asset license inventory; privacy/terms decision; correct notices and consent posture. | **Unproven** |
| Support/operations | A public user may lose data or encounter a broken build without a response or recovery path. | Name owner/channel/hours; create troubleshooting and data-loss language; incident severity and response flow; vulnerability contact. | **Unproven** |
| Product truth | “Today,” local-first, privacy, benefit, and film imagery may be interpreted more broadly than implemented. | Enforce claims ledger during copy review; test real flows; run user research only with separate authorization. | **Unproven** |

## Rollback and recovery

### Local package recovery

1. Preserve the last passing source revision, lockfile, generated MP4 hash, and `L0`–`L8` receipts together. Do not call an uncommitted working tree a recoverable release.
2. Reproduce a candidate with `npm ci`, then rerun `npm run verify`. A prior passing receipt does not transfer to changed source or dependencies.
3. If a change fails, restore only the known affected files from the preserved revision through a reviewable change; do not erase unrelated user work or use a destructive workspace reset.
4. Before changing the storage schema, keep a fixture for every supported version and prove forward migration, malformed-data handling, and behavior when a newer schema is encountered.
5. Never instruct a person to clear site data as the first repair: it deletes commitments. Explain the consequence and capture/export data first if a supported mechanism exists.

### Future public rollback (planning only)

A future authorized release must identify an immutable deployment/revision, the preceding known-good revision, an owner, and a tested rollback command specific to the selected host. Rollback must cover both static assets and storage compatibility. Reverting JavaScript cannot restore deleted browser data, and an older client must not corrupt a newer local schema. If rollback changes origin or domain, explicitly disclose that existing local data will not automatically follow.

Do not invent a provider-specific rollback command now. No hosting provider, account, project, team, domain, or release mechanism has been selected or authorized.

## Gated future deployment checklist

Every box is intentionally unchecked. This checklist becomes actionable only after the owner gives fresh, explicit authorization identifying the action and scope. Authorization to preview does not authorize production, DNS, outreach, analytics, or data collection.

### Candidate and evidence

- [ ] Freeze an identified source revision and reproduce `L0`–`L8` from a clean checkout.
- [ ] Resolve every critical/high finding; retain failure and rerun receipts.
- [ ] Review all product, site, film, metadata, social preview, and README copy against C01–C17.
- [ ] Record exact supported browser/device matrix and remaining limitations.
- [ ] Complete independent security, privacy, accessibility, legal/license, and support reviews appropriate to the release scope.

### Hosting and privacy design

- [ ] Choose a host and region with documented logging, retention, subprocessors, headers, cache, rollback, and incident behavior.
- [ ] Decide preview versus production and obtain explicit authorization for that exact deployment.
- [ ] Verify build/output settings locally; inventory environment variables and prove no secret is shipped to client code.
- [ ] Define CSP and other response headers; test direct navigation, 404s, cache updates, and storage-schema compatibility.
- [ ] Reconcile “local-only” copy with inevitable hosting request logs; state precisely whether commitment text ever leaves the browser.

### Controlled preview

- [ ] With explicit authorization, create/link the selected provider project and authenticate the authorized operator.
- [ ] Deploy the frozen revision to a non-production preview; record URL, revision, owner, time, build log, and provider settings.
- [ ] Rerun smoke, browser, accessibility, privacy/network, metadata, and film/link checks against the preview.
- [ ] Exercise and time the provider-specific rollback; verify that rollback does not corrupt the storage schema.
- [ ] Obtain separate approval before collecting any tester data, sending a link, or performing outreach.

### Production and distribution

- [ ] Obtain explicit production-deployment authorization.
- [ ] Obtain separate authorization for domain purchase/configuration and DNS changes, if any.
- [ ] Confirm legal copy, privacy contact, asset/dependency notices, support route, incident owner, and vulnerability-reporting path.
- [ ] Deploy the exact reviewed revision; verify URL, TLS, headers, cache, browser matrix, network behavior, and rollback target.
- [ ] Obtain separate authorization for announcement, email, social posting, directory submission, advertising, or other distribution.
- [ ] Record outcome without claiming demand, reliability, compliance, or benefit beyond collected evidence.

## External-action register

The actions below were outside the confirmed local-only scope. Their status is a factual record, not merely a recommendation.

| Action ID | External action | Authorization | Status |
| --- | --- | --- | --- |
| X01 | Preview deployment to Vercel or any other host | Not granted | **Not taken** |
| X02 | Production deployment or publication | Not granted | **Not taken** |
| X03 | Vercel/provider CLI install, login, account/team lookup, project creation, linking, deploy, or inspect | Not granted | **Not taken** |
| X04 | Domain registration, purchase, transfer, or DNS change | Not granted | **Not taken** |
| X05 | Git remote push, tag, pull request, hosted repository release, or package publishing | Not granted | **Not taken** |
| X06 | Account, authentication, backend, API, hosted database, or cloud-storage creation | Not granted | **Not taken** |
| X07 | Analytics, telemetry, tracking cookie, session replay, crash reporting, or monitoring integration | Not granted | **Not taken** |
| X08 | Real customer/tester data collection, waitlist, survey, or signup collection | Not granted | **Not taken** |
| X09 | Email, direct outreach, tester invitation, or support-message sending | Not granted | **Not taken** |
| X10 | Social post, advertisement, directory submission, press contact, or public announcement | Not granted | **Not taken** |
| X11 | Purchase, paid service, subscription, credit use, or other spending | Not granted | **Not taken** |
| X12 | Public user research or sharing the demo film/site outside the local workspace | Not granted | **Not taken** |

## Final local sign-off record

This record was filled by the independent post-repair reviewer after the integrated checks passed. Evidence receipts remain the detailed source for scope and limitations.

| Decision field | Required value | Current value |
| --- | --- | --- |
| Integrated tree/revision | Immutable identifier or archived tree hash | **SHA-256 `f5f440bd59bb85aa348f43b0266baf9fdc4512a0a6ab87c215a5d9a747bc6429` normalized source/outcome manifest; no Git HEAD or archive exists** |
| Required gates | `L0`–`L8` | **L0–L8 Pass** |
| Failed gates | None permitted | **None** |
| Skipped required gates | None permitted | **None** |
| Unproven checks | Explicit list retained | **Real-user benefit/demand; security/privacy/legal/accessibility conformance; representative browsers/devices; hosted behavior; support and public rollback** |
| Material limitations | Explicit list retained | **Browser-local data can be cleared and has no sync/export/recovery; Chromium viewport checks are not a device matrix; 2 low-severity film ESLint-toolchain advisories remain; the workspace has no commit or immutable archive** |
| Local package decision | Ready / not ready | **Ready — all L0–L8 passed locally** |
| Public release decision | Ready / not ready | **Not ready — unproven and unauthorized** |
| Reviewer and UTC time | Name/agent plus timestamp | **post_repair_verification independent subagent · 2026-07-18T20:58:50Z** |
