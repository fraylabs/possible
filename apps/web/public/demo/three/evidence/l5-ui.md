# L5 — responsive and accessibility review

Status: **Pass**

The post-repair reviewer did not rely on the green aggregate alone. Source was re-reviewed against the freshly fetched guideline, keyboard/semantic behavior was independently exercised in Chromium, contrast coverage was audited, and every current UI screenshot and film still was inspected at original detail.

## Fresh guideline source

- URL: https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md
- Web fetch and exact raw retrieval: 2026-07-18T20:53:25Z
- SHA-256: `eea73cb6dd46fee9faec9973e8e7fe198b5f07ec326f14d276a56e50287e1cab`
- Reviewed skill: `.agents/skills/web-design-guidelines/SKILL.md`
- Browser-testing helper `--help`: run before use as required by `.agents/skills/webapp-testing/SKILL.md`

## Commands and machine evidence

```sh
npm run verify:ui
# plus the independent two-server probe recorded under L4
```

Final exact-tree UI interval: 2026-07-18T21:00:21.342Z–21:00:36.575Z. Machine receipt: `evidence/runtime/ui-review.json`.

## Fresh source findings

### product/src/App.tsx

product/src/App.tsx:112 - linked label present; input at 115 has meaningful sequential `name`, `autocomplete="off"`, controlled `onChange`, example placeholder, and ellipsis — pass.

product/src/App.tsx:68 - destructive removal uses a labelled 2-step inline confirmation with Confirm and Keep; focus is deliberately moved after user activation — pass.

product/src/App.tsx:216 - first DOM focus target is a product skip link to `#today` — pass.

product/src/App.tsx:220 - semantic header/main/sections/list/form/buttons/footer and H1 → H2 order — pass.

### product/src/styles.css

product/src/styles.css:39 - intentional tap highlight and `touch-action: manipulation` on controls — pass.

product/src/styles.css:50 - visible global `:focus-visible` replacement with 3 px outline — pass.

product/src/styles.css:67 - full-height shell uses safe-area padding and contains overflow — pass in tested viewports; physical notches remain unproven.

product/src/styles.css:79 - skip link reveals by transform and remains high contrast — pass.

product/src/styles.css:184 - main fragment target has `scroll-margin-top` — pass.

product/src/styles.css:369,521 - transitions list compositor-friendly `transform`; no `transition: all` — pass.

product/src/styles.css:397 - long user text uses `overflow-wrap: anywhere` and grid children can shrink — pass.

product/src/styles.css:901 - reduced-motion override covers animation, transition, and smooth scrolling — pass.

### site/src/App.tsx

site/src/App.tsx:72 - first DOM target is a skip link; all runtime links are native internal fragments — pass.

site/src/App.tsx:76 - semantic header/nav/main/sections/ordered process/figure/figcaption/footer; H1/H2/H3 hierarchy has no skipped level — pass.

site/src/App.tsx:22 - product vignette is explicitly labelled illustrative and non-interactive — pass.

site/src/App.tsx:192 - precise browser-storage disclosure and non-public status; no external action CTA — pass.

### site/src/styles.css

site/src/styles.css:34 - intentional tap highlight and `touch-action: manipulation` on links — pass.

site/src/styles.css:48 - full-width shell includes all safe-area insets — pass in tested viewports.

site/src/styles.css:72 - global `:focus-visible` outline is visible; the skip-link reveal at line 68 uses `:focus` so keyboard and programmatic focus both reveal it — accepted contextual implementation, independently exercised.

site/src/styles.css:77 - main and section fragment targets have `scroll-margin-top` — pass.

site/src/styles.css:977 - reduced-motion override removes staged delays and smooth scrolling — pass.

Contextual, non-blocking guideline advisories: heading copy does not universally use `text-wrap: balance/pretty`, and product removal confirmation uses `autoFocus` after an explicit user action at all viewport widths. Tested layouts did not show widows/clipping, and the focus move is necessary confirmation management rather than unsolicited first-load autofocus. These do not fail the acceptance contract; formal accessibility remains unproven.

## Runtime and contrast review

- **Pass:** no horizontal overflow or persistent overlap at 1440 × 900 and 360 × 800 for product/site.
- **Pass:** 120-character commitment wraps on mobile without collision.
- **Pass:** repeatable 720 × 450 half-size viewport equivalent of 200% zoom has no horizontal overflow.
- **Pass:** reduced-motion media queries match and reduce active durations; no-preference screenshots wait until animations settle.
- **Pass:** first keyboard focus and visible outline pass on both surfaces.
- **Pass:** console/page error lists are empty.

Computed WCAG contrast receipt coverage:

| State | Audited text runs | Recorded skips | Minimum audited ratio | Result |
| --- | ---: | ---: | ---: | --- |
| Product default desktop | 25 | 8 | 4.741:1 | Pass |
| Product default mobile | 25 | 8 | 4.741:1 | Pass |
| Product filled/open desktop | 28 | 5 | 5.089:1 | Pass |
| Product completed/closed desktop | 25 | 8 | 4.500:1 | Pass |
| Site desktop | 56 | 16 | 5.042:1 | Pass |
| Site mobile | 51 | 21 | 5.042:1 | Pass |

The recorded skips were manually audited: off-canvas skip links (visible-on-focus white/midnight treatment), decorative/`aria-hidden` marks, the visually clipped screen-reader label, a disabled empty Add control, and content intentionally hidden by responsive CSS. No user-facing enabled text was silently omitted as a contrast failure.

## Original-detail visual inspection

Product/site screenshots inspected:

- `product-desktop.png`, `product-mobile.png`, `product-mobile-long-text.png`
- `product-filled-open-desktop.png`, `product-done-desktop.png`, `product-closed-desktop.png`
- `site-desktop.png`, `site-mobile.png`

All are settled and unclipped. The 2 closed product captures are byte-identical, show 3 completed controls, and no longer contain the first review's incomplete-row contradiction. Site desktop/mobile vignettes show all 3 completed checks after their staged entrance.

All 8 `film/stills/*.png` frames were also inspected at original 1920 × 1080 detail; L7 records the film decision.

- **Failed required checks:** none.
- **Skipped required checks:** none.
- **Unproven:** formal accessibility/WCAG conformance, screen-reader/switch/high-contrast behavior, actual browser zoom, physical notch/safe-area and touch behavior, real devices, and non-Chromium browsers.
