# Daymark outcome brief

Build **Daymark**, a complete local-first web app that helps one person choose
and finish exactly three priorities for today without opening a task manager.

## Required user flow

1. On an empty day, the user sees a clear invitation to choose today's three
   priorities.
2. The user can add a non-empty priority with a keyboard or pointer.
3. The app never permits more than three active priorities and clearly explains
   the limit.
4. The user can mark any priority complete or incomplete and can remove it.
5. Progress is visible as both a count and a meaningful visual state.
6. Reloading the page preserves today's priorities and completion states.
7. A deliberate reset action clears today's list after confirmation.
8. A new local calendar day starts with an empty list while preserving no
   cross-day user-facing history.

## Product quality

- Responsive and fully usable at 390 px mobile and 1280 px desktop widths.
- Quiet, typographic, high-contrast visual treatment with coherent empty,
  partially complete, and complete states.
- Semantic controls, visible keyboard focus, useful accessible names, and no
  mouse-only interaction.
- No accounts, backend, analytics, notifications, collaboration, external
  assets, or network writes.
- Local data uses a versioned storage key and handles malformed stored data
  without breaking the app.

## Required proof

- `README.md` documents exact run, test, and build commands.
- `npm test` passes meaningful automated tests for the three-item cap,
  completion toggle, removal, reset, reload persistence, day rollover, and
  malformed storage recovery.
- `npm run build` produces a locally runnable production artifact.
- `BENCHMARK-RECEIPT.json` lists the files created, commands actually run,
  passed/failed/skipped checks, known limitations, and external actions not
  taken. It must not invent timing or independent-review results.

The outcome ends at a locally verified build. Do not deploy, publish, create an
account, contact anyone, or claim user validation.

