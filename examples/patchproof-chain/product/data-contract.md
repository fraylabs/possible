# PatchProof data contract

This document is normative for the browser implementation, fixtures, exports,
and independent review. Unknown keys are rejected on import so a future version
cannot silently change the meaning of a version 1 receipt.

## Documents

PatchProof uses two JSON document kinds:

- `patchproof.draft` is the browser-persisted editable input.
- `patchproof.receipt` is the deterministic generated result and JSON export.

Both use `schemaVersion: 1`. A receipt may be imported by extracting and
validating its `draft` object; derived evidence, statuses, counts, and warnings
from the imported file are ignored and recalculated. This prevents an imported
receipt from granting itself `passed` status.

## DraftV1

```ts
type EvidenceStatus =
  | "passed"
  | "failed"
  | "skipped"
  | "unknown"
  | "unsupported";

type ClaimKind = "tests" | "file-change" | "ui" | "other";

interface DraftV1 {
  kind: "patchproof.draft";
  schemaVersion: 1;
  task: string;
  unifiedDiff: string;
  checkLog: string;
  artifacts: Array<{
    id: string;                 // unique within the draft
    label: string;
    type: "visual" | "file" | "note";
    reference: string;          // descriptive text only; never opened automatically
    status: EvidenceStatus;
    note: string;
  }>;
  claims: Array<{
    id: string;                 // unique within the draft
    text: string;
    kind: ClaimKind;
    target: string;             // command, normalized path, UI surface, or subject
    evidenceRefs: string[];     // IDs produced by extraction or artifact IDs
  }>;
  limitations: string[];
}
```

Required arrays may be empty. `task` must contain non-whitespace text before
generation. Strings have no implicit Markdown or HTML authority. IDs must match
`^[a-z0-9][a-z0-9._-]{0,63}$`; references must resolve uniquely or validation
fails. Claims are not allowed to store a user-selected result status.

## ReceiptV1

The canonical property order shown here is also the serialization order:

```ts
interface ReceiptV1 {
  kind: "patchproof.receipt";
  schemaVersion: 1;
  draft: DraftV1;
  evidence: {
    changedFiles: Array<{
      id: string;               // diff-001, diff-002, ... in appearance order
      path: string;             // normalized repository-relative display path
      change: "added" | "modified" | "deleted" | "renamed" | "binary" | "unknown";
      status: EvidenceStatus;
      oldPath: string | null;
      warning: string | null;
    }>;
    checks: Array<{
      id: string;               // check-001, check-002, ... in log order
      command: string;
      exitCode: number | null;
      status: EvidenceStatus;
      excerpt: string;
      warning: string | null;
    }>;
    artifacts: DraftV1["artifacts"];
  };
  claims: Array<{
    id: string;
    text: string;
    kind: ClaimKind;
    target: string;
    evidenceRefs: string[];
    status: EvidenceStatus;     // calculated, never trusted from import
    explanation: string;
  }>;
  warnings: string[];
  limitations: string[];
  summary: {
    passed: number;
    failed: number;
    skipped: number;
    unknown: number;
    unsupported: number;
  };
}
```

The summary counts claims only. A receipt with zero claims has five zero counts;
it must not display a success state. The UI and Markdown list evidence-level
statuses separately.

## Extraction contract

Extraction is deliberately conservative:

1. **Changed files.** Recognize paths from standard unified-diff headers. Keep
   every path in appearance order, including unrelated and binary changes.
   Normalize only the conventional `a/` and `b/` prefixes and `/dev/null`.
   Binary changes use `change: "binary"`, `status: "unknown"`, and a warning that
   content was not inspected. An empty or unparseable diff produces no invented
   changed files and a warning.
2. **Checks.** A check may be `passed` only when the supplied log identifies its
   command and an unambiguous zero exit. A non-zero exit is `failed` even when
   later lines say success. An explicit not-run/skip marker is `skipped`.
   Present but stale, truncated, conflicting, or exit-less output is `unknown`.
   A missing command creates no passing check.
3. **Artifacts.** Preserve the user's classification but do not upgrade it.
   `unsupported` remains valid for a note describing absent evidence. A visual
   claim requires a referenced `type: "visual"` artifact whose status is
   `passed`; prose claiming that a screenshot exists is not visual evidence.
4. **Unrelated changes.** A changed path not referenced by any claim remains in
   `changedFiles` and creates a warning. It is never deleted from the receipt.

The raw diff and log stay in `draft`, so a reviewer can inspect what extraction
used.

## Claim calculation

Calculate each claim from its kind and references:

| Claim kind | Required supplied evidence |
|---|---|
| `tests` | At least one referenced `checks` item with a non-empty command. |
| `file-change` | A referenced `changedFiles` item whose normalized `path` exactly equals `target`. |
| `ui` | At least one referenced `artifacts` item with `type: "visual"`. |
| `other` | At least one valid referenced evidence or artifact item; its class must be named in the explanation. |

Then apply these rules in order:

1. If a required evidence class or exact target is absent, status is
   `unsupported` and the explanation names what is missing.
2. Otherwise, if any required referenced item is `failed`, status is `failed`.
3. Otherwise, if any required reference cannot be resolved, status is
   `unsupported` (normally rejected earlier by draft validation).
4. Otherwise, if any required item is `unsupported`, status is `unsupported`.
5. Otherwise, if any required item is `unknown`, status is `unknown`.
6. Otherwise, if any required item is `skipped`, status is `skipped`.
7. Only when all required items are present and `passed` is the claim `passed`.

Extra passing references cannot mask a higher-precedence status. A test claim
without a parsed test command, a file claim for a path absent from the diff, and
a UI claim without visual evidence are therefore always `unsupported`.

## Canonical serialization

Byte-equivalent JSON is part of the Phase A gate. Generation must:

1. Normalize CRLF and CR line endings in all strings to LF, remove one leading
   UTF-8 BOM, and otherwise preserve whitespace and user wording.
2. Preserve user array order. Preserve extracted files/checks in source order.
3. Assign deterministic positional IDs (`diff-001`, `check-001`) after
   extraction. Never use random IDs, current time, machine paths, browser data,
   or environment-dependent values in the receipt.
4. Emit object keys in the exact schema order above, using two-space indentation
   and one trailing LF.
5. Calculate Markdown from the same in-memory `ReceiptV1`; it may not recalculate
   or relabel statuses independently.

Given the same normalized `DraftV1`, generation must return byte-equivalent JSON
across repeat runs and reload recovery.

Suggested filenames are `patchproof-receipt.json` and
`patchproof-receipt.md`. Filenames are presentation metadata and do not appear in
the receipt.

## Markdown representation

Markdown contains, in order: title, task, claim-status summary, claim ledger,
changed files, checks, artifacts, warnings, limitations, and the boundary below.
Escape user-controlled Markdown so headings, links, and code fences cannot alter
the document structure. Do not omit zero-count statuses from the summary.

Every export ends with this meaning in plain language:

> This receipt reports what the supplied evidence shows. It does not prove
> semantic code correctness, security, production readiness, demand, or
> product-market fit.

## Required fixture assertions

The 12 fixtures enumerated in `product/flow.md` are acceptance tests, not sample
copy. Each fixture must assert its exact evidence statuses, claim statuses,
warnings, and limitations. Additionally:

- generation twice from each valid fixture yields byte-identical JSON;
- reload and regeneration yield byte-identical JSON;
- no claim lacking its required evidence is `passed`;
- malformed import leaves both active and persisted drafts unchanged;
- all five status keys remain present in JSON and Markdown, including zeros.

