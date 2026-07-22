# Outcome brief

## Audience and desired end state

- Operator: a developer testing whether a narrow developer-tool hypothesis can become a useful local product.
- Current stage: build and verify PatchProof, a browser-only completion-receipt builder.
- Finished stage: a locally runnable application that turns a task, unified diff, check logs, and optional artifacts into truthful Markdown and JSON receipts through one complete browser flow.

## Inherited evidence and claim classes

- Fact: the archived Software Opportunity Discovery run passed its fresh review and produced a `pursue` receipt at workspace revision `3cdefb90807a8a7d65a2131b73cf568a490fe43a`.
- Fact: the inherited handoff hashes and archive manifest pass `.possible/verify-chain-handoff.mjs`.
- Hypothesis: developers will value a lightweight manual receipt builder across agents.
- Hypothesis: a browser-only local workflow will be easier than reviewing raw logs.
- Hypothesis: portable Markdown and JSON receipts will fit existing review habits.
- Unknown: willingness to use or pay, preferred capture method, distribution channel, and commercial model.

## Product job and primary flow

A developer can load a reproducible fixture, enter or edit a task, diff, and check log, classify evidence without collapsing unknown states into success, generate an inspectable receipt, copy or download Markdown and JSON, reload the browser, and recover the saved draft locally.

The product must also demonstrate one material failure path: malformed imported JSON must be rejected without replacing the current draft, with actionable recovery guidance.

## Constraints and interfaces

- Browser-only and local-first: no server, account, analytics, upload, repository execution, or network dependency in the product flow.
- Treat all pasted content as untrusted text. Never render it as HTML or execute it.
- Preserve `passed`, `failed`, `skipped`, `unknown`, and `unsupported` as distinct states.
- Receipt claims describe supplied evidence, not semantic code correctness, security, production readiness, or market validation.
- `product/` owns the flow, state, and data contracts.
- `src/`, `public/`, fixtures, and build configuration own the working application.
- `tests/` and `outcome-room/` own repeatable verification and completion evidence.

## Acceptance checks

- Clean install and local run are documented and reproducible.
- One complete browser job works across desktop and mobile viewports.
- Fixture loading, draft persistence, refresh recovery, export, and malformed-import recovery are verified.
- The production build succeeds.
- Unit and browser checks pass from explicit commands.
- A scoped dependency, secret, and browser-input security review is preserved without calling the app secure.
- A fresh reviewer runs after integration; material failures are repaired and rechecked.
- `outcome-room/product-receipt.json` records `passed`, `repair-required`, or `no-go`, exact evidence, limitations, and the immutable workspace revision.

## External-action gates

Deployment, publication, outreach, spending, account creation, analytics, third-party services, real customer data, and repository execution remain unauthorized and will not occur.

## Unproven claims

Demand, usability beyond this tested flow, willingness to pay, product-market fit, semantic patch correctness, comprehensive security, scale, reliability, and production readiness remain unproven.
