# Three — confirmed outcome brief

## Audience

Three is for overloaded solo builders who need a finite definition of a good day.

## Desired end state

Ship a coherent, locally runnable launch package for **Three**, a browser app that lets a person commit to no more than three things for the current day, complete them, reload without losing them, and reach a visually conclusive “done” state instead of encountering more productivity backlog.

The finished local package contains four outcome surfaces:

1. `product/` — the real browser product.
2. `site/` — a launch site with an honest, specific narrative.
3. `film/` — a short demo film and its editable Remotion source.
4. `release/` — an evidence-backed release plan that does not perform a release.

Verification receipts live in `evidence/`.

## Current reality

- The repository began with no commits, a two-line `README.md`, and a minimal private ESM `package.json`.
- No product, site, film, tests, users, assets, deployment, backend, or release evidence existed at confirmation.
- The repository-local Possible skill was already present in `.agents/skills/possible/`.
- The reviewed Software Launch ingredients were installed repo-locally after direct confirmation.

## Product contract

- A person can add commitments from zero up to a hard maximum of three.
- Empty or whitespace-only commitments are rejected without creating an item.
- A commitment can be marked complete and returned to incomplete.
- A commitment can be removed deliberately.
- Commitments and completion state survive a full browser reload through versioned `localStorage` data.
- The app does not require or offer an account, network sync, backend, analytics, or tracking.
- The interface clearly shows remaining capacity and provides a conclusive all-done state when every existing commitment is complete.
- The experience works with keyboard input, visible focus, reduced motion, and responsive layouts.

“Exactly three” is the product's focusing idea; the behavioral contract is **up to three**, as confirmed by the user. The app must never pressure someone to invent filler work.

## Design direction and assumptions

- Product promise: “Three things. Then you’re done.”
- Tone: calm, decisive, useful, and respectful of limited attention; no streaks, scores, feeds, gamification, or guilt.
- Aesthetic concept: a compact daily index card with three physical-feeling commitment lines and a single closing gesture when the day is complete.
- The product and launch artifacts share one deliberate visual system, but the product remains the canonical interaction source.
- System fonts or bundled local assets are preferred so all primary surfaces remain usable offline after dependencies are installed.
- The demo film may use rendered product UI or captured local product states; it must not imply user demand or external availability.
- There is no launch date. Readiness is determined only by the acceptance checks below.

## Workstream interfaces

### Product → site

- The product owns behavior, product copy, storage schema, and canonical UI states.
- The site may embed a non-interactive product vignette or verified local screenshots, but must not duplicate or contradict the product contract.
- The site must link only to local product usage instructions unless external release is separately authorized.

### Product → film

- The film shows the same three-item limit, copy, colors, and completion behavior as the verified product.
- Any screenshots or UI reproductions used in the film must be traceable to real product states.

### Product/site/film → release plan

- Each workstream supplies build and verification commands plus known limitations.
- The release plan distinguishes what is verified locally from what would still need approval and evidence before a public release.

### Integration ownership

- Root scripts provide one-command local development, builds, tests, and film rendering where practical.
- Shared claims and constraints in this brief override conflicting ingredient-skill instructions.
- No workstream may edit another workstream’s owned directory without captain coordination.

## Acceptance checks

### Real browser product

- Install and production build complete successfully.
- Automated component/unit checks cover storage parsing/versioning and the three-item invariant.
- Browser verification proves: add three; reject a fourth; complete items; reload; retain text and completion; remove an item; use the freed slot.
- Browser console has no unexpected errors during the verified flow.
- At narrow mobile and desktop widths, essential content is visible without overlap or horizontal scrolling.
- Keyboard focus is visible, controls have accessible names, and reduced-motion behavior is respected.

### Launch site

- Production build completes successfully.
- The page states who Three is for, what it does, its local-only privacy model, and its current non-public status without fabricated demand or metrics.
- The page presents a clear product demonstration and truthful local run instructions.
- Responsive, keyboard, contrast, and reduced-motion checks pass; no broken or external action-oriented controls are present.

### Demo film

- Editable Remotion source builds and a local MP4 renders successfully.
- Target duration is short (roughly 15–30 seconds), with readable 16:9 frames and a clear sequence: overload → choose up to three → complete → done.
- Representative frames are inspected for clipping, overlap, contrast, and consistency with the product.
- The film makes no availability, demand, performance, privacy-certification, or production-readiness claim.

### Honest release plan

- The plan inventories local artifacts, exact verification commands, known limitations, and rollback/recovery considerations.
- It separates local readiness from unverified public-release concerns such as hosting, browser/device coverage, security/privacy review, accessibility testing with users, support, legal copy, and distribution.
- Deployment, DNS, analytics, outreach, publication, data collection, and account creation are listed as gated future actions, not performed steps.

### Integrated outcome

- Root documentation explains how to run every artifact locally.
- A fresh reviewer who did not implement the work reruns the acceptance checks and records passed, failed, skipped, and unproven checks.
- Material review failures are repaired and rerun before completion.

## External-action gates

The confirmation authorizes repository-local skill installation and local artifact work only. The following remain unauthorized and must not occur:

- deployment, preview deployment, DNS changes, or domain registration;
- publishing, pushing, tagging, opening a pull request, or creating a release;
- accounts, authentication, backend services, hosted databases, or cloud storage;
- analytics, telemetry, cookies for tracking, or real customer-data collection;
- email, outreach, waitlist collection, social posting, or advertising;
- purchases, paid services, or spending money.

Read-only access to public technical documentation and package registries is allowed when needed to build and verify the local artifacts.

## Unproven claims

- No evidence of customer demand, retention, or willingness to pay exists.
- “Feel done rather than buried” is a design goal; it can receive heuristic review here but is not validated with users.
- Security, privacy compliance, accessibility conformance, performance across representative devices, browser compatibility, uptime, and production readiness are not established by local checks alone.
- No public URL, distribution channel, support process, or release authority exists.
- The demo film is product communication, not evidence of real-world adoption.

