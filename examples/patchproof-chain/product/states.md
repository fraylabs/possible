# PatchProof browser state model

## State ownership

All product state exists in the current browser. PatchProof has no server state,
account, telemetry, upload, repository access, or background synchronization.

- **In memory:** the active draft, current validation messages, import candidate,
  persistence condition, and generated receipt.
- **Local persistence:** one last valid draft under the key
  `patchproof:draft:v1` using the `DraftV1` contract.
- **Exports:** user-initiated Markdown or JSON files. Exporting does not imply a
  file was accepted by another system.

Raw task, diff, logs, artifact notes, and limitations are untrusted text. Render
them only through text-safe DOM APIs. No state transition may execute them,
interpret them as HTML, fetch a URL, or access a repository path.

## Stable application states

| State | Meaning | Primary actions |
|---|---|---|
| `empty` | No meaningful draft fields exist. | Load fixture, import JSON, or begin entering evidence. |
| `editing` | A valid in-memory draft exists and differs from the last generated revision, or no receipt has been generated. | Edit, classify, save locally, or generate. |
| `ready` | Required task input exists and every claim can be evaluated under the data contract. Claims may still be failed, skipped, unknown, or unsupported. | Generate receipt. |
| `generated` | Markdown and JSON were generated from the current draft fingerprint. | Inspect, copy, or download. |
| `stale` | A generated receipt exists, but an input affecting it changed. | Regenerate; export is disabled. |

`ready` means “deterministically evaluable,” not “all claims passed.” Receipt
generation is allowed with any mixture of the five evidence statuses because
failures and uncertainty are part of the product's output.

The interface also reports orthogonal conditions without replacing the active
state:

- `persistence: saved | saving | unsaved | unavailable`
- `import: idle | reading | invalid | awaiting-confirmation`
- `export: idle | copying | copied | downloading | failed`

An error condition never destroys the last valid active state.

## Boot and recovery

On load:

1. Read `patchproof:draft:v1` once.
2. If absent, enter `empty`.
3. If it validates as `DraftV1`, restore it and enter `editing` or `ready`.
4. If it is malformed or a different schema version, do not partially restore
   it. Enter `empty`, preserve the invalid value until the user explicitly
   chooses to clear it, and show **Saved draft could not be restored** with
   **Download saved data** and **Start a new draft**.

Do not quietly overwrite invalid saved data during boot. A generated receipt is
not persisted as authority; regeneration from the restored draft produces the
canonical output.

## Draft transitions

Every edit creates a new canonical draft fingerprint and attempts to persist a
valid `DraftV1` value.

```text
empty ──enter/load/import──> editing ──valid required input──> ready
  ^                              ^                              |
  |                              |                              | generate
  └──────── clear (confirm) ─────┴──────── edit <──────── generated
                                                  edit ───────> stale
                                                               |
                                                          regenerate
                                                               v
                                                           generated
```

- **Load fixture:** validate the fixture first. If the current draft is
  non-empty, require **Load and replace** confirmation. Cancel leaves both
  in-memory and saved drafts unchanged.
- **Clear:** require confirmation for a non-empty draft. Clearing removes only
  `patchproof:draft:v1`; it does not revoke already downloaded files.
- **Edit after generation:** enter `stale` immediately. Keep the old preview
  visibly labeled **Out of date**, and disable copy/download until regeneration.
- **Regenerate:** replace both export representations atomically from one
  canonical receipt value. Markdown and JSON must describe the same statuses.

## Import transaction

Import uses a separate candidate state. It never mutates the active draft while
reading, parsing, validating, or previewing replacement.

```text
idle -> reading -> invalid -> idle
                 \-> awaiting-confirmation -> idle (cancel)
                                           \-> editing/ready (replace)
```

The `invalid` state must identify at least the first failing field and whether
the cause is malformed JSON, unsupported `schemaVersion`, wrong document kind,
or schema mismatch. It must not echo executable markup as markup. Only
**Import and replace** commits a fully valid candidate and then persists it.

## Evidence status model

The five statuses have the following precedence when multiple required evidence
items inform one claim:

```text
failed > unsupported > unknown > skipped > passed
```

Precedence prevents a passing line or optional artifact from masking a material
failure or missing requirement. It does not convert one state into another:
the receipt retains every contributing evidence item and its own status.

| Status | State test | Must not mean |
|---|---|---|
| `passed` | All evidence required for that claim is present, referenced, and explicitly successful. | Code is semantically correct, secure, production-ready, or market-validated. |
| `failed` | At least one required item explicitly failed or contradicts the claim. | The whole project is unusable. |
| `skipped` | The required check is explicitly recorded as not run, and no higher-precedence condition applies. | The check passed or evidence was merely absent. |
| `unknown` | Relevant evidence is present but stale, ambiguous, incomplete, or non-inspectable. | No evidence exists. |
| `unsupported` | At least one required evidence class is absent. | The claim is false; only that it lacks required supplied evidence. |

Claim status is calculated, never freely edited. Users edit claim text, kind,
required references, and limitations; PatchProof derives the result.

## Failure recovery

| Failure | State preserved | User recovery |
|---|---|---|
| Malformed or incompatible import | Active in-memory draft and saved draft | Choose another file or keep current draft. |
| Browser storage denied/full | In-memory draft and generated receipt | Retry saving or download JSON; refresh recovery is explicitly unavailable. |
| Clipboard denied | Generated receipt | Download Markdown or retry copy. |
| Download initiation fails | Generated receipt | Retry the named export or use copy where available. |
| Extraction cannot interpret a log or binary patch | Raw supplied text | Mark affected evidence `unknown`; let the user add a limitation, never infer success. |

Errors use actionable language and disappear only after the condition is fixed
or the user dismisses a non-blocking message. A dismissed warning does not alter
receipt data or status.

