# Possible writing standard

Write for a reader who wants to understand, decide, or act quickly.

This standard adapts Google's [Technical Writing One](https://developers.google.com/tech-writing/course-summaries/one), especially its guidance on [active voice](https://developers.google.com/tech-writing/one/active-voice), [clear sentences](https://developers.google.com/tech-writing/one/clear-sentences), and [short sentences](https://developers.google.com/tech-writing/one/short-sentences).

## Rules

1. Lead with the point.
2. Give each section one purpose.
3. Give each sentence one idea.
4. Prefer actor + verb + target.
5. Use strong verbs and specific nouns.
6. Remove words that do not change meaning.
7. Use one term for one concept.
8. Put supporting detail behind a link.
9. Use numbers only when they are measured, sourced, or clearly labeled.
10. State what is unknown.

## Limits

- Heading: 12 words.
- Introductory sentence: 20 words.
- Sentence: aim for 20 words; do not exceed 30 without a clear reason.
- Paragraph: one topic and no more than three sentences.
- Card summary: 16 words.
- Homepage: 250 visible words.

These are editing limits, not targets. Shorter is better when meaning survives.

## Possible terms

Use these terms consistently:

- **Outcome:** an observable end state.
- **Pack:** a reviewed recipe for a class of outcomes.
- **Skill:** a specialist capability used by a pack.
- **Possible:** the skill that clarifies, recommends, coordinates, and verifies.
- **Artifact:** a produced file, system, or asset.
- **Evidence:** proof that a claim is true.
- **Verifier:** the independent check that awards credit.

Do not use `result`, `output`, `artifact`, and `outcome` as interchangeable terms.

## Benchmark writing

Every benchmark page uses the same order:

1. **Question:** the capability under test, in one sentence.
2. **Release:** version, date, status, subject, and budget.
3. **Results:** the current leaderboard, including an explicit no-runs state.
4. **Task:** fixed input and evaluation subject.
5. **Metrics:** the primary metric, formula, and evidence that earns credit.
6. **Protocol:** the procedure applied to every entry.
7. **Reproducibility:** run manifest, full trace, and verifier receipt.
8. **Limitations:** what the score does not establish.

Put results before explanation. Never place modeled or projected values in a results table. If no controlled run exists, say so.

Label evidence precisely:

- **Observed:** recorded in a controlled run.
- **Modeled:** demonstrates a scoring or reporting method.
- **Projected:** estimates a future value from stated assumptions.
- **Unknown:** lacks sufficient evidence.

Never present coverage as success, funding as fulfillment, or a projection as a result. Keep failed and unfinished subjects in the comparison cohort. Protocol changes require a new release.

## Reading experience

- Keep article prose near 600px wide.
- Separate ideas with whitespace, not repeated rules.
- Use cards only for comparisons, controls, or measured data.
- Use at most one emphasized callout in a section.
- Keep metadata quiet. Let the title and first paragraph establish hierarchy.
- Let tables and charts extend beyond the prose column only when the data needs it.

## Editing pass

Before publishing:

- Delete the opening sentence if the next sentence makes the same point.
- Replace passive voice when the actor matters.
- Split sentences joined by multiple `and`, `but`, or `which` clauses.
- Replace adjectives with evidence.
- Remove repeated caveats; place the caveat beside the relevant claim.
- Check headings and first sentences without reading the body. They should still explain the page.
- Read every sentence aloud once.
