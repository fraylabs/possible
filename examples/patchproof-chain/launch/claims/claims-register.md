# Claims register

| Claim | Class | Evidence | Allowed public wording | Boundary |
| --- | --- | --- | --- | --- |
| PatchProof runs locally in a browser. | Verified fact | Product revision `ae88d466…`; browser verification | “Runs locally in your browser.” | Does not imply a public deployment. |
| It accepts task, diff, logs, artifacts, claims, and limitations. | Verified fact | Unit and browser tests; product source | State directly. | Inputs are supplied manually. |
| It preserves five evidence states. | Verified fact | 34 unit assertions; 12 fixture contracts | Name all five states. | Does not prove semantic correctness. |
| It exports Markdown and JSON receipts. | Verified fact | Browser flow and unit tests | State directly. | Receipt content reflects supplied evidence. |
| Malformed JSON does not replace the current draft. | Verified fact | Fresh browser verification | State directly when relevant. | Scope is the tested malformed-import path. |
| Nothing uploads in the product flow. | Verified fact for tested local build | Browser report recorded zero external requests | “The tested product flow made no external requests.” | Do not generalize to every future build. |
| Developers will value PatchProof. | Hypothesis | Discovery evidence only | Label as a hypothesis or omit. | No customer validation. |
| PatchProof improves review accuracy or speed. | Unproven | No comparison run | Do not claim. | Requires an external study. |
| PatchProof works across all coding agents. | Unproven | No compatibility study | Do not claim. | “Across mixed agents” is an audience hypothesis, not compatibility proof. |
| PatchProof is secure or production-ready. | Unproven | Scoped review only | Do not claim. | A scoped review is not comprehensive assurance. |

## Copy rule

Every factual claim on the launch site must map to the verified-fact rows above. Hypotheses must remain visibly labeled. Unproven claims do not appear as marketing promises.
