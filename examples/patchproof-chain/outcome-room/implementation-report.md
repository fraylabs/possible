# PatchProof implementation report

## Delivered product

PatchProof is a browser-only local application that converts a task, unified diff, check log, artifact record, explicit completion claims, and limitations into deterministic Markdown and JSON receipts.

The primary flow supports:

1. loading one of 12 reproducible fixtures or entering evidence manually;
2. conservative extraction of changed files and a recorded check;
3. explicit claim-to-evidence references with derived `passed`, `failed`, `skipped`, `unknown`, or `unsupported` status;
4. deterministic generation from the same normalized draft;
5. Markdown and JSON inspection, copy, and download;
6. local draft persistence and reload recovery;
7. transactional malformed-import rejection without draft replacement.

## Local setup

```bash
npm install
npm run dev
```

The development server prints a local URL. The product requires no account, backend, credential, or network service.

## Repeatable verification

```bash
npm run verify
```

This command runs:

- 34 Node unit assertions across all 12 fixtures;
- a Vite production build;
- a native Python Playwright flow through the repo-installed server helper.

Browser evidence is preserved in:

- `outcome-room/browser-report.json`
- `outcome-room/browser-desktop.png`
- `outcome-room/browser-mobile.png`

## Result

- All 12 fixture expectations pass.
- Same normalized input produces byte-identical JSON across repeated generation and browser reload.
- Missing test commands, absent files, missing visual evidence, and empty diffs do not pass.
- Hidden nonzero exits fail even when later output says success.
- Desktop and mobile primary flows pass with zero external requests, page errors, console errors, or mobile horizontal overflow.
- The production build succeeds.

## Boundaries

PatchProof does not execute repository code, inspect a repository, upload data, contact a service, validate market demand, or prove semantic correctness, security, production readiness, scale, reliability, or product-market fit. Deployment, publication, analytics, outreach, accounts, spending, and real customer data were not used.
