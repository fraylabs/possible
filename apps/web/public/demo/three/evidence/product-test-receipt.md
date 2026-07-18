# Three product — test receipt

Verified locally on 2026-07-19 with Node `v25.2.1` and npm `11.6.2`.

## Outcome

The product is a Vite + React + TypeScript browser app with no network requests, account surface, backend, analytics, or tracking. Its only durable browser data is the versioned `three:today:v1` local-storage record containing the current date and up to three `{ id, text, completed }` items.

Removal is deliberately two-step: selecting **Remove** opens a labelled inline confirmation, moves focus to **Yes**, and offers **Keep** as a non-destructive exit. The component test covers cancellation, confirmation, and reuse of the freed line.

## Exact commands

From `product/`:

```sh
npm install
npm test
npm run build
npm audit --audit-level=high
```

To run the product locally:

```sh
npm run dev
```

## Passed checks

- `npm install` — passed; npm audited 162 packages and the final audit reported zero known vulnerabilities.
- `npm test` — passed; 3 test files and 15 tests.
  - Model tests prove whitespace normalization/rejection, completion in both directions, deliberate removal, and the hard maximum of three at the state boundary.
  - Storage tests prove valid v1 parsing, minimal writes, rejection of foreign versions and stale dates, safe handling of malformed/unavailable storage, duplicate filtering, and clamping hostile records to three.
  - Component tests prove adding three, no fourth input at capacity, completion, closed-day state, persistence across remount/reload semantics, whitespace rejection, accessible two-step removal, cancellation, reuse of a freed line, and the product skip-link/named-input contract.
- `npm run build` — passed; TypeScript emitted no errors and Vite `7.3.6` produced the production bundle.
  - `dist/index.html`: 0.91 kB (0.54 kB gzip)
  - `dist/assets/*.css`: 13.16 kB (3.45 kB gzip)
  - `dist/assets/*.js`: 193.91 kB (61.47 kB gzip)
- `npm audit --audit-level=high` — passed; zero known vulnerabilities.
- Source inspection — passed for local/system-only fonts, a first-focus skip link, named and labelled input, explicit focus-visible styling, accessible control names, safe-area-aware responsive layout, reduced-motion overrides, and absence of gradients, analytics, or application network code.

The integrated Chromium checks additionally pass the complete add/finish/reload/remove/reuse flow, settled-state screenshots, 360 px and 1440 px layouts, long text, reduced motion, keyboard focus, and computed text contrast. Their machine receipts are `evidence/runtime/browser-contract.json` and `evidence/runtime/ui-review.json`.

## Skipped and unproven

- The original isolated workstream could not access an in-app browser backend. That tool limitation is superseded by the integrated Playwright/Chromium receipts; it remains useful history rather than a pending acceptance check.
- The interface has semantic labels, visible focus CSS, keyboard-native controls, and reduced-motion CSS, but formal accessibility conformance and assistive-technology testing are unproven.
- Browser/device compatibility, performance on representative hardware, privacy/security review, and the subjective goal “feel done rather than buried” are not established by these local checks.

## Known limitations

- The date is evaluated when the app initializes. A tab left open across midnight does not change days until reload; there is no live midnight rollover.
- Three stores only one current-day record. It has no history, archive, export, synchronization, or recovery beyond the browser's local storage.
- Multiple open tabs do not coordinate edits; the last tab to write wins.
- If local storage is blocked or unavailable, the app warns the person and keeps the current docket only in memory for that tab.
- The interface is English-only. Long commitment text is capped at 120 characters.
- No deployment, publishing, outreach, analytics, account, backend, or other external release action was performed.
