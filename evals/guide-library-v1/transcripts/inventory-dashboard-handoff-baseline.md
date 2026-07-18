## Recommended V1

Build a TypeScript Next.js application backed by PostgreSQL and passwordless email authentication. Use a managed service such as Supabase for PostgreSQL, authentication, and row-level security; use TanStack Table for the dense inventory grid and a small component system with restrained styling. Store timestamps in UTC and display them in Asia/Singapore time.

Assumed V1 envelope: five concurrent staff, up to 50,000 SKU/warehouse rows, and CSV files up to 20 MB.

## Data and permissions

Use `(sku, warehouse)` as the inventory record’s unique key.

Core tables:

- `user_profiles`: auth user, email, role (`viewer` or `editor`), active flag.
- `inventory`: SKU, product name, warehouse, on-hand quantity, reorder point, source updated time, application updated time, and row version.
- `import_batches`: filename, checksum, uploader, status, validation results, and inserted/changed/unchanged counts.
- `audit_events`: actor, action, inventory key, before/after values, adjustment delta, reason, import batch, and timestamp.

Only five allowlisted emails may sign in. Viewers can read inventory and audit history. Editors can additionally import CSVs and make stock adjustments. Role changes must not be available through the ordinary application UI. Enforce authorization both server-side and with database row-level policies; hiding buttons is not sufficient.

Audit events are append-only. Manual adjustments require a signed integer delta and a reason, reject results below zero, and update inventory plus audit history in one transaction using optimistic locking.

## CSV refresh

Require these headers: `sku`, `product_name`, `warehouse`, `on_hand`, `reorder_point`, and `updated_time`. Validate UTF-8 input, non-empty identifiers, non-negative integers, timezone-bearing timestamps, duplicate `(sku, warehouse)` keys, file size, and row count before changing data.

Every import first produces a dry-run summary with errors and inserted, changed, unchanged, and omitted counts. Acceptance applies the whole batch atomically. Re-uploading an identical checksum is blocked unless explicitly confirmed.

Default policy: the CSV is authoritative for rows it contains, so a refresh can replace a manually adjusted quantity; the preview must flag those replacements. Missing rows are retained and reported rather than silently deleted. This is the safest non-destructive V1 behavior.

## Interface

The dashboard should contain compact KPI cards for inventory locations, total units, low-stock locations, and last successful refresh. “Low stock” means `on_hand <= reorder_point` and is counted per SKU/warehouse location.

Provide server-side search over SKU and product name, warehouse and stock-status filters, a dedicated low-stock view, sortable columns, pagination, sticky headers, clear loading/empty/error states, and shareable query parameters. Editors get CSV refresh and stock-adjustment flows; viewers get read-only controls. An inventory row opens its audit history.

Use a desktop-first two-column density where useful, collapsing controls cleanly for tablet widths. Ensure keyboard operation, visible focus, sufficient contrast, labelled controls, and no interaction that depends on hover.

## Verification handoff

Define and run these project checks before acceptance:

- Formatting, linting, TypeScript checking, unit tests, production build, and dependency audit.
- Migration-from-empty and migration rollback tests against an isolated database.
- Integration tests for allowlisting, both roles, row-level policies, atomic imports, checksum handling, adjustment concurrency, and audit immutability.
- CSV fixtures covering valid imports, bad headers, malformed numbers and timestamps, duplicate keys, empty files, oversized files, unchanged rows, omissions, and attempted negative stock.
- Browser tests for sign-in, search, combined filters, low-stock KPI/view agreement, import preview/application, manual adjustment, audit display, viewer restrictions, and session expiry.
- Accessibility checks plus manual keyboard review at common desktop and tablet widths.
- A measured performance check using 50,000 seeded rows: normal searches and filters should return within one second at the API boundary under expected five-user load.

Acceptance evidence should include command output, test reports, representative screenshots, migration results, and an import reconciliation report proving inventory totals and audit counts before and after refresh.

## Preview plan

Make no external changes now. After explicit approval, the default low-cost path is a Vercel preview deployment connected to a Supabase project located in Singapore, without custom DNS. Before provisioning, re-check current regional availability, free-tier limits, outbound-email restrictions, and pricing; set spending controls and obtain approval for any non-zero cost. Configure credentials only through protected environment variables and seed exactly the approved five users.

## Decisions still needed

- The five email addresses and viewer/editor assignment.
- Whether CSV omissions should eventually deactivate records instead of retaining them.
- Whether manual adjustments must survive a later authoritative CSV refresh.
- Whether the assumed 50,000-row/20 MB operating envelope is sufficient.
- Approval of the preview provider, sender identity for authentication email, and a maximum monthly budget before any provisioning occurs.
