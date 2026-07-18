# L5 failure snapshot

Status: **Fail**

Fresh guideline source:

- URL: https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md
- Retrieval: 2026-07-18T20:29:46Z
- SHA-256: eea73cb6dd46fee9faec9973e8e7fe198b5f07ec326f14d276a56e50287e1cab

Blocking findings:

- product/src/App.tsx:115 — no input name.
- product/src/App.tsx:213 — no product skip link.
- product/src/styles.css:132,217,266,383,513,599 — small-text contrast failures.
- site/src/styles.css:570 — small-text contrast failure.
- evidence/screenshots/product-done-desktop.png — unsettled completion capture.
- evidence/screenshots/site-desktop.png and site-mobile.png — unsettled staged-vignette captures.

Passing subchecks: desktop/mobile overflow, long text, 200%-viewport equivalent, reduced motion, semantic controls, heading order, visible focus, keyboard add/complete/reload/remove flow, two-step deletion, and site internal-only navigation.

Skipped required checks: none.

Unproven: formal accessibility conformance, assistive technologies, actual browser zoom, real-device touch/notches, and non-Chromium browsers.

Full findings remain in evidence/L5-ui.md as authored on this failed manifest.
