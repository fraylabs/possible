# Problem-evidence map

## Theme 1 — “Done” is hard to trust in AI-assisted coding

**Confidence: high for the pain; medium for the proposed product shape.**

- S01/S02 provide large-sample directional evidence that almost-correct AI output, debugging burden, and lack of trust are common among Stack Overflow survey respondents.
- S03 shows that even a green status has bounded meaning: only configured checks ran, and skipped checks can report success.
- S04 shows GitHub is investing in traceable agent sessions and validation summaries, confirming the job exists inside a major incumbent.

**Unmet job hypothesis:** “Before I accept an AI-assisted change, help me see which completion claims have direct evidence and which are unsupported—without reading an entire session transcript.”

**What remains unknown:** whether developers prefer manual evidence import, automatic hooks, PR integration, or no additional tool.

## Theme 2 — Repository setup truth is scattered across files

**Confidence: high for cross-file complexity; low for whitespace.**

- S08–S12 establish that README setup, license metadata/files, environment-variable exposure, and runtime modes form contracts spread across different artifacts.
- S13–S15 show multiple current products already attack README drift, environment drift, and repository/agent readiness.

**Implication:** the pain is credible, but a generic “repo health score” is not a good first bet without a sharper underserved segment.

## Theme 3 — OpenAPI examples can diverge from specification and rendering

**Confidence: medium.**

- S16 provides a concrete developer report with visible community reaction.
- S17 demonstrates established implementation-validation tooling.
- S18 documents limits and conflicts in machine-readable schema validation.

**Implication:** a narrow visual example debugger could be useful, but the category already has capable validators and the initial audience would be smaller.

## Theme 4 — Local and hosted CI behavior differ

**Confidence: high for the boundary; low for a new entrant.**

- S19 documents fresh hosted runner instances.
- S20 and S21 show well-established local execution and static linting alternatives.

**Implication:** diagnosing parity failures is valuable, but faithfully emulating CI is implementation-heavy and incumbent-rich.

## Research gaps

No direct interviews, support logs, purchasing evidence, or first-party product usage were available. No conclusion below should be read as product-market fit.
