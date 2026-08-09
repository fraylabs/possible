# Intentional lint boundaries

The strict anti-slop rules apply throughout Possible. The few overrides in
`oxlint.config.json` are limited to code whose purpose requires the flagged
operation:

- `manifest.ts` and `registry.ts` decode untrusted JSON into validated domain
  objects, so they must accept unknown input and inspect its runtime types.
- The listed JavaScript validators perform the same work at filesystem and
  evaluation boundaries.
- The listed tests use assertions to inspect SDK envelopes, one isolated UI
  module mock, and runtime type checks as test evidence.

Do not add a new override to avoid a refactor. Add one only when the file is an
actual parser, compatibility seam, or test boundary and keep the disabled rule
set as small as possible.
