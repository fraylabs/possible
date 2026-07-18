# Still launch site

A responsive, local-only launch page for the fictional Still e-ink focus-device concept. The implementation uses only claims in `../outcome-brief.md` and does not include a backend, deployment configuration, analytics, or real data collection.

## Run locally

```bash
npm install
npm run dev
```

## Verification receipt

Run from `site/`:

```bash
npm test
npm run build
```

Status at handoff:

- Production build: **passed** on 2026-07-18 with Vite 8.1.5 (`npm run build`). Output: `dist/index.html` plus one CSS and one JavaScript asset.
- Narrow waitlist component test: **passed**, 1 test / 1 test file (`npm test`). It verifies invalid input, successful clearing, confirmation copy, and zero `fetch` calls.
- Real-browser responsive and keyboard review: skipped for the workstream handoff; assigned to the captain/fresh reviewer.
- Deployment: skipped by constraint.
- Network/data persistence review: **passed by static inspection** (`rg -n "fetch|XMLHttpRequest|localStorage|sessionStorage|sendBeacon|WebSocket" src`, with the only hit being the test's `fetch` spy). No backend, form action, request, storage, or analytics code is present.

## Explicitly unproven

- The ~72 × 72 × 18 mm dimensions are a design target, not a validated physical specification.
- All device and app visuals are concept renderings.
- Hardware internals, battery life, manufacturability, physical performance, certification, production readiness, and customer demand are unverified.
- The companion app shown here is illustrative; a production app is outside this outcome.

See [WAITLIST-CONTRACT.md](./WAITLIST-CONTRACT.md) for the interaction's exact data behavior.
