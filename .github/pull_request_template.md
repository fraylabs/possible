## Outcome

What can a user rely on after this change?

## Evidence

- [ ] `npm run check` passes for implementation changes, or the focused Pack submission check passes for a source-entry-only PR.
- [ ] New skill sources install the exact reviewed commit.
- [ ] External actions remain behind explicit approval.
- [ ] New or changed outcome claims link to preserved evidence.
- [ ] No secrets, customer data or absolute local paths are included.
- [ ] Non-scope and unproven claims are explicit.

## Outcome Pack submission (if applicable)

- Pinned source URL and commit:
- [ ] I added only the generated source entry, not a trust or evidence record.
- [ ] The source entry uses `schemaVersion: 1`; the source is public and its exact content hash passes the focused validator.
- [ ] I copied the exact pack bytes to the content-addressed `registry/snapshots/` path; the snapshot is provenance, not verification.
- [ ] I ran `npm run registry:sync` and did not hand-edit its generated catalog or skill-reference outputs.
- [ ] The Structured Prompt, Skills and Expectations describe a complete bounded outcome.

## Limits

What does this change not establish?
