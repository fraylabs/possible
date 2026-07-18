# Three launch site — test receipt

## Outcome

The `site/` workstream contains a locally runnable Vite + React + TypeScript
launch page for Three. It names the audience, explains the up-to-three contract,
completion and reload persistence, states the local-only privacy boundary, and
labels the current build as non-public. The product example is an explicitly
illustrative, non-interactive vignette rather than a fabricated screenshot.

No deployment, publication, external link, account, backend, analytics,
tracking, outreach, data collection, or network-dependent runtime asset was
added or used.

## Artifacts

- `src/App.tsx` — semantic page structure and truthful launch copy.
- `src/styles.css` — responsive three-rail visual system, visible focus, and
  reduced-motion handling.
- `DESIGN-NOTES.md` — brief-first plan, pre-build critique, and post-build
  critique required by the reviewed frontend-design skill.
- `scripts/verify-static.mjs` — repeatable source-level content, accessibility,
  and external-URL checks.
- `README.md` — local run and verification instructions.
- `dist/` — production build output.

## Verification run

All commands ran from `site/` on 2026-07-19 Singapore time.

| Check | Command | Result |
| --- | --- | --- |
| Dependency install | `npm install` | **Passed** — 28 packages audited, 0 vulnerabilities reported by npm. |
| Type and static contract | `npm run check` | **Passed** — TypeScript passed; 11 required content/accessibility hooks found; no external URLs found in runtime source. |
| Production build | `npm run build` | **Passed** — Vite 8.1.5 produced `dist/`; final run built 16 modules in 86 ms. |
| Local HTTP response | `curl --fail --silent --show-error --head http://127.0.0.1:4175/` | **Passed** — local Vite server returned HTTP 200 and `text/html`. |
| Built HTML external asset scan | `rg -n 'https?://' dist/index.html` | **Passed** — no matches; generated script and stylesheet references are local. |
| Gradient/external URL source scan | `rg -n "https?://|linear-gradient|radial-gradient" index.html src README.md` | **Passed** — no matches. |

## Source-level acceptance review

- **Passed:** semantic `header`, labeled `nav`, `main`, ordered process, section
  headings, `figure`/`figcaption`, and `footer` structure.
- **Passed:** every runtime link is an internal fragment; all link targets exist.
- **Passed:** a keyboard skip link and global `:focus-visible` treatment are
  present.
- **Passed:** responsive layout rules cover wide, tablet (`1050px`), mobile
  (`760px`), and narrow mobile (`430px`) widths; flex/grid children use wrapping,
  shrinking, or contained horizontal scrolling where needed.
- **Passed:** `prefers-reduced-motion: reduce` disables staged animations and
  smooth scrolling while leaving content visible.
- **Passed:** palette and type use only brief-approved colors and system fonts.
  Small utility copy was strengthened during critique rather than dimmed for
  hierarchy.
- **Passed:** no gradients, metrics, testimonials, waitlist, generic dashboard
  tiles, fabricated demand, or external action CTA are present.
- **Passed:** canonical product promise and completed-state copy were reconciled
  with the product workstream; the example remains labeled illustrative and
  non-interactive.

## Pending and unproven

- **Passed in integrated Chromium verification:** settled screenshots at desktop
  and 360 px mobile, no horizontal overflow, first-focus skip link, visible focus,
  reduced motion, no-preference entrance settling, the 200%-viewport equivalent,
  clean console, and computed small/large-text contrast. The machine receipt is
  `evidence/runtime/ui-review.json`. The original isolated workstream's unavailable
  in-app browser remains recorded as tool history, not as a pending acceptance check.
- **Unproven:** accessibility conformance, assistive-technology behavior, and
  real-device/browser compatibility. Source hooks and local static checks are not
  substitutes for those reviews.
- **Unproven:** whether the site or product makes solo builders feel done. That
  design goal has not been tested with users.
- **Not performed:** hosting, deployment, publication, analytics, outreach, user
  data collection, or any other external release action.
