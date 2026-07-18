## Recommended V1 handoff

This is a design and verification handoff only; no credentials, files, provider state, deployment, DNS, or spending have been touched.

Build a TypeScript Next.js App Router application with PostgreSQL, Supabase Auth, Tailwind, and a small set of locally owned shadcn/ui components. Keep reads server-side and client code limited to the table interactions, filters, and forms. Use invitation-only email magic links for the five staff.

Authorization must be enforced twice: server mutations check the authenticated user’s role, and database policies deny unauthorized writes. Store roles in `app_user` as `viewer` or `editor`; never trust a role supplied by the browser. Viewers can read inventory and audit history. Editors can additionally import CSVs and submit adjustments.

### Data and mutation model

Use `(sku, warehouse)` as the inventory key because one SKU may exist in several warehouses.

- `inventory_item`: SKU, product name, warehouse, current on-hand quantity, reorder point, source-updated time, latest import batch, row version, and timestamps.
- `import_batch`: file hash, actor, start/finish time, status, accepted/rejected counts, and error summary.
- `inventory_event`: append-only event type, item key, before/after values, delta, reason, actor, batch ID, and timestamp.
- `app_user`: auth user ID, email, role, active flag.

Treat each CSV row as an authoritative absolute snapshot. Validate the whole file in staging, then apply it atomically: exact required headers; trimmed non-empty text; non-negative integer quantities; valid timezone-aware timestamps; no duplicate `(sku, warehouse)` keys; and no timestamp regression. Re-uploading an identical file hash is a no-op. A row missing from the latest CSV is retained but flagged `absent_from_latest_batch`; V1 never silently deletes it. An import replaces current quantity for included rows and does not replay older manual adjustments; the audit event preserves what changed.

Manual adjustment is an editor-only transaction: lock the row, require a non-zero integer delta and reason, reject a result below zero, update the version, and append the audit event in the same transaction. Conflicting updates return a refresh-and-retry message rather than silently overwriting.

Define low stock as `on_hand <= reorder_point`. Provide case-insensitive SKU/product search; warehouse and stock-status filters; sortable quantity and update time; URL-persisted filter state; and server pagination.

### Interface

Use a compact header with four KPIs: low-stock rows, total units, warehouse count, and last successful refresh. The low-stock KPI opens the pre-filtered table. Below it, use one toolbar and a dense table with sticky headers, persistent SKU/product columns, clear low-stock badges, and an editor-only row action that opens a focused adjustment dialog. Avoid decorative charts.

Target 1440px desktop and 768–1024px tablets. On tablets, retain the table with deliberate horizontal scrolling and 44px action targets rather than converting records into cards. Verify keyboard operation, visible focus, labelled controls, and that color is not the only low-stock signal.

### Decisions still needed from you

1. The five allowed email addresses and their initial viewer/editor assignments.
2. Confirmation that CSV quantities are authoritative snapshots, missing rows are retained, and imports supersede earlier manual adjustments.
3. Whether negative stock must ever be allowed through an explicit override workflow.
4. Expected maximum rows/file size and required audit retention period.
5. Later approval of the exact preview provider, account, budget ceiling, and data region.

### Verification and acceptance receipt

The eventual implementation should pass lint, type-check, unit tests, database integration tests, end-to-end tests, and a production build. Required negative fixtures include malformed headers, invalid numbers, duplicate keys, stale timestamps, duplicate-file replay, missing rows, viewer write attempts, unauthenticated access, below-zero adjustments, and two concurrent edits.

End-to-end flows must prove both roles, search/filter persistence, the low-stock KPI, successful and rejected imports, adjustment before/after values, and immutable audit attribution. Run them at desktop and tablet viewports, including keyboard-only use and a WCAG 2.2 AA automated/manual accessibility pass. With a provisional 50,000-row fixture, target p95 filtered responses below 500 ms, first usable table below 2 seconds on a representative Singapore connection, and a validated CSV import below 30 seconds; revise these budgets after decision 4.

For the later preview, shortlist Cloudflare Workers, but first recheck current OpenNext/Next.js compatibility, pricing, included usage, Singapore behavior, and Supabase region availability. Deployment requires separate approval and should produce a receipt containing the exact non-production URL, build identity, browser-flow results, accessibility evidence, authorization probes, and measured performance. Do not treat a build or screenshot alone as proof.

Possible’s *Data-heavy dashboards*, *Next.js*, *Browser applications*, and *shadcn/ui* guides (reviewed 2026-07-17; supported by the [Next.js App Router](https://nextjs.org/docs/app), [React guidance](https://react.dev/blog/2025/02/14/sunsetting-create-react-app), and [shadcn/ui documentation](https://ui.shadcn.com/docs)) informed the representative dense-screen and client/server-boundary choices. Its *Cloudflare Workers*, *Create a Cloudflare preview deployment*, and *Production web verification* guides (reviewed 2026-07-17; supported by [Cloudflare’s Next.js guide](https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/), [WCAG 2.2](https://www.w3.org/TR/WCAG22/), and [Web Vitals](https://web.dev/articles/vitals)) informed the approval gate and evidence receipt. Possible returned no useful guide for auth/RBAC, CSV ingestion, PostgreSQL auditing, or Singapore-region selection; those portions are explicit engineering judgment and require live provider checks before external action.
