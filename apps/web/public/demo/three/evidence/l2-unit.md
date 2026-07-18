# L2 — static and unit checks

Status: **Pass**

Command: `npm run test:unit`

Final exact-tree interval: 2026-07-18T21:00:08.233Z–21:00:10.408Z. Runner: Vitest 3.2.7.

Results:

- **Pass:** 3 test files and 15 tests passed.
- **Pass:** model tests cover whitespace normalization/rejection, the hard 3-item invariant, completion in both directions, non-empty all-done logic, deliberate deletion, and freed capacity.
- **Pass:** storage tests cover schema v1, minimal writes, invalid JSON, unknown schema, previous-day input, malformed entries, duplicate IDs, hostile lists above 3, and unavailable reads/writes.
- **Pass:** component tests cover skip-link/named-input repair, adding 3, no fourth composer, completion, the closed state, persistence across remount, 2-step removal/cancel, slot reuse, and whitespace rejection.
- **Failed required checks:** none.
- **Skipped required checks:** none.
- **Unproven:** multi-tab coordination, calendar/time-zone rollover policy, browser storage quotas/policies, and formal security properties.

Real reload persistence and keyboard behavior were separately exercised in Chromium under L4.
