# Evidence model

PatchProof derives a claim state from the evidence references in a supplied draft. It does not infer whether code is semantically correct.

| State | Meaning |
| --- | --- |
| `passed` | Every required referenced item for the claim is present and carries passing supplied evidence. |
| `failed` | At least one required reference contains explicit failure evidence, such as a nonzero exit. |
| `skipped` | The supplied log explicitly records that the referenced check was skipped or not run. |
| `unknown` | Evidence exists but is stale, ambiguous, conflicting, binary, or otherwise inconclusive. |
| `unsupported` | The claim lacks the evidence class it requires—for example, a UI claim with no visual artifact. |

Precedence is `failed` → `unsupported` → `unknown` → `skipped` → `passed`. This prevents a later success-looking line from hiding an earlier nonzero exit.

## Claim requirements

- A `tests` claim references a parsed check that names its command.
- A `file-change` claim references the exact changed path.
- A `ui` claim references a visual artifact.
- An `other` claim references at least one supplied evidence item.

## Trust boundary

PatchProof parses supplied text and artifact metadata. It does not run commands, inspect files that are merely named, validate screenshot contents, establish who produced the evidence, or guarantee completeness. Keep explicit limitations with every exported receipt.
