# L4 — real-browser contract

Status: **Pass**

Commands:

```sh
npm run test:browser
uv run --with playwright==1.61.0 python .agents/skills/webapp-testing/scripts/with_server.py \
  --server "npm run dev:product -- --host 127.0.0.1 --port 4173" --port 4173 \
  --server "npm run dev:site -- --port 4174" --port 4174 \
  -- python evidence/post-repair-browser-probe.py
```

- Browser: headless Chromium 149.0.7827.55 through Playwright 1.61.0
- Viewport: 1440 × 900 CSS pixels; independent probe used reduced-motion preference
- Initial product storage: explicitly cleared, then page reloaded
- Machine receipts: `evidence/runtime/browser-contract.json` and `evidence/runtime/post-repair-independent-browser.json`

Exercised product flow:

- **Pass:** add exactly 3 commitments with keyboard text entry + Enter.
- **Pass:** the composer disappears at capacity; no fourth item can be added through the UI and the model boundary independently rejects it.
- **Pass:** complete all 3 with Space and reach `Day closed` / `Docket closed. Nothing else is owed today.`
- **Pass:** `three:today:v1` contains 3 completed items before reload.
- **Pass:** full reload retains all text, all 3 completion states, and the closed state.
- **Pass:** return a commitment to incomplete and back to complete with Space.
- **Pass:** request removal, verify focus on Confirm, tab to Keep and cancel, then request/confirm and reuse the freed third line.
- **Pass:** no unexpected console errors, page errors, external requests, or cookies.

Semantic/keyboard repair confirmation:

- **Pass:** first focus is `Skip to today’s docket`, with a 3 px visible outline and `#today` target.
- **Pass:** all 3 sequential composer inputs expose linked names `commitment-1` through `commitment-3` and `autocomplete="off"`.
- **Pass:** product heading levels are H1 → H2.
- **Pass:** site first focus is `Skip to main content`; site links are internal fragments and headings do not skip levels.

- **Failed required checks:** none.
- **Skipped required checks:** none.
- **Unproven:** Firefox, Safari, Edge, real devices, assistive technologies, multiple tabs, storage-disabled/private-mode policies, and calendar/time-zone transitions.
