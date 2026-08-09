# Discovery evaluation

This suite measures the part of Possible that users actually experience: whether an ordinary request exposes the right operational knowledge without a pack name or special vocabulary.

The generated `cases.json` combines:

- four messy selection requests owned by every active Outcome Pack's `discovery.json`;
- nearest-neighbor packs that must not become the recommendation;
- ambiguous requests that require clarification; and
- requests that conflict with pack guardrails and should receive no recommendation.

Catalog-wide clarification and no-fit cases live in `catalog-cases.json`. Do not hand-edit `cases.json`; `npm run packs:generate` rebuilds it from the pack folders and catalog-wide cases.

Each selection case records the intended pack, acceptable alternatives where applicable, and tempting packs that must not be recommended. The fixture does not contain query synonyms, ranking hints, or pack-specific scoring rules.

Run the diagnostic report:

```bash
npm run discovery:evaluate
```

Run the release threshold:

```bash
npm run discovery:evaluate -- --enforce
```

The deterministic report measures lexical top-one, top-three, and top-ten coverage, false `notFor` conflicts on the intended pack, forbidden lexical rankings, and no-fit signal recall. It does **not** claim that a lexical rank is a recommendation or measure an LLM's semantic judgment. The forbidden and no-fit cases are deliberately retained as pressure for a separate agent evaluation: show the complete active catalog and record the selected pack, clarification, or no-fit decision.

The current deterministic gate requires at least 90% top-three coverage, 98% top-ten coverage, no missing intended packs in the complete catalog, and no more than two false conflict signals on intended packs. It records—but does not gate on—cases where lexical order favors a forbidden neighbor, because `$possible` must resolve those from the full `promise`, `prompt`, optional `notFor`, and expectations rather than treating search order as semantic truth. These thresholds are floors for developer preview, not evidence that Possible has found the best pack.
