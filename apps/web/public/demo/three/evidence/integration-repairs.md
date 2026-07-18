# Integration repair history

This log preserves meaningful failures encountered while the four workstreams
were integrated. Later passes do not erase the evidence that the first attempt
failed.

## 1. Workspace port forwarding

- **Failed check:** first `npm run test:browser` attempt.
- **Observed failure:** the helper timed out waiting for port 4173 because root
  workspace arguments were consumed by npm; Vite instead selected its default
  port.
- **Repair:** root `dev:product` and `dev:site` scripts now end their workspace
  command with `--`, allowing explicit host/port arguments to reach Vite.
- **Rerun:** passed; the helper started and stopped the product on 4173.

## 2. Browser focus assertion API

- **Failed check:** second `npm run test:browser` attempt.
- **Observed failure:** Python Playwright `Locator` has no `is_focused()` method.
- **Repair:** the verifier now compares the confirmation button with
  `document.activeElement` through `Locator.evaluate()`.
- **Rerun:** passed; the complete browser contract, clean console, and local-only
  request assertion all passed.

## 3. Mobile launch-site essential-content assertion

- **Failed check:** first `npm run verify:ui` attempt.
- **Observed failure:** the desktop navigation link “Run locally” is deliberately
  hidden in the compact mobile header, even though the run section remains in
  the document.
- **Repair:** the invariant now checks the visible, semantic “Run it here. Not
  out there.” section heading at every viewport instead of assuming desktop
  navigation remains visible.
- **Rerun:** passed at 1440×900, 360×800, long-text mobile, reduced-motion, and
  the 720×450 viewport equivalent of 200% zoom.

## 4. Embedded SVG namespace false positive

- **Failed check:** first `npm run verify:privacy` attempt.
- **Observed failure:** the static scanner treated the W3C SVG namespace inside
  an embedded `data:` favicon as a remote URL.
- **Repair:** the scanner explicitly removes that non-network identifier before
  applying external-URL rules, while retaining the original file hash and
  documenting the exception.
- **Rerun:** passed across 14 runtime files and both live local surfaces; runtime
  traffic stayed on loopback, cookies were empty, the site used no storage, and
  product storage was limited to `three:today:v1`.

## 5. Clean-install film browser provisioning

- **Interrupted check:** the first aggregate `npm run verify` reached film
  rendering after all prior gates passed, then began downloading a second 93.5
  MB Remotion browser because `npm ci` had removed the workstream-local browser.
- **Repair:** browser verification now explicitly ensures pinned Playwright
  Chromium, and `film:render` reuses that cache when available while retaining
  Remotion's normal provisioning fallback.
- **Rerun:** `npm run verify` passed every required script, including a fresh
  deterministic 660-frame render and full FFmpeg decode.

## 6. First independent UI review overrode a false-green aggregate

- **Failed check:** first fresh `L5` review, preserved under
  `evidence/failed-review-01/`; consequently `L8` was also classified Fail even
  though the aggregate script exited zero.
- **Observed failures:** the product had no skip link, its commitment input had
  no `name`, several product labels and one site caption fell below 4.5:1 text
  contrast, public metadata used the ambiguous “local-first” phrase, and
  product/site screenshots were captured before completion animations settled.
  The earlier UI script did not calculate contrast, so its success message was
  insufficient evidence.
- **Repair:** the product now starts with a visible-on-focus skip link and uses a
  labelled, named field; small text colors were strengthened; metadata says
  local-only and explains browser storage; touch/safe-area and motion-guideline
  findings were addressed. Browser evidence now waits for settled visual state
  and runs a computed-style WCAG contrast check that records audited and skipped
  text runs before failing or passing.
- **Rerun:** focused product unit/build/browser/UI/privacy checks passed. Final
  readiness still requires the separate post-repair reviewer receipt; a prior
  failure is never converted retroactively into a pass.
