# External-author evaluation

This kit tests one product claim: a pack Possible has never encoded into its skill can arrive from a third-party Git repository, be frozen at exact source bytes, appear in discovery, and be selected or excluded by general catalog policy.

The included author and repositories are fictional. The automated result is real; no human study has been run yet.

## Automated verifier

From the repository root:

```bash
npm run build -w @possible/packs
npm exec -- tsx evaluations/external-author/verify.mjs
```

The verifier:

1. installs `$possible` into a fresh project through the real CLI;
2. exports the reviewed public contract through the real PR-ready CLI path and runs the production submission validator;
3. validates the versioned source record and its exact Git revision;
4. checks the fetched manifest bytes against the declared SHA-256 digest;
5. writes and reloads the content-addressed snapshot offline;
6. proves changed input bytes and stored tampering are rejected;
7. adds a separate maintainer-owned `experimental` trust record;
8. discovers the pack for a matching outcome;
9. rejects the same pack when the query conflicts with `notFor`; and
10. builds the post-merge CLI asset snapshot with the generated catalog reference, installs it into a second fresh project, and proves the new pack is present while the generic skill stays byte-for-byte unchanged.

The selection function contains no pack name, slug, or special-case condition. It only permits `experimental` or `verified` candidates and excludes candidates with an explicit `notFor` conflict. The generated offline reference and MCP search consume the same injected catalog; only the generated data changes for the post-merge install. The JSON receipt printed by the verifier also reports any production integration gap it can detect.

This is an automated synthetic external-author proof, not evidence that a real outside contributor completed the flow. The production registry loader, MCP search, and versioned source entry use the same contracts exercised here; the human study below remains the product milestone.

## Human external-author study (not run)

Recruit 3–5 people who have not contributed to Possible. Give each person the public authoring guide, an empty repository, a concrete outcome they understand, and the same time box. Do not teach the schema during the attempt. An observer may clarify the task but must record every clarification.

For each participant:

1. Ask them to author, validate, compile, and export one pack.
2. Submit it through the documented Git/PR path and record review corrections.
3. In a fresh Possible installation, run one matching query and one genuine `notFor` query without changing the installed skill.
4. Execute the same bounded outcome twice in counterbalanced order: once with the pack and once with an ordinary `/goal` prompt. Use equivalent inputs, authority, time box, and evaluator.
5. Have an independent reviewer score the resulting evidence against the pack's required Expectations. Do not let the author score their own run.
6. Copy `observations.template.json` once per participant and fill only observed values. Keep `studyStatus` as `not-run` until a participant actually starts.

Stop and repair the authoring contract if two participants hit the same blocking ambiguity. Do not reinterpret missing evidence as a pass.

## Comparison metrics

Report counts and medians; retain individual observations because 3–5 runs are exploratory, not statistically conclusive.

- Minutes and validation attempts to the first valid manifest.
- Number and type of schema misunderstandings and required maintainer corrections.
- Whether required Expectations are observable, specific, and backed by named evidence.
- Matching-query selection accuracy and explicit-`notFor` rejection accuracy.
- Minutes from task receipt to useful execution start and to completion.
- Required checks passed over required checks total, using the same independent evaluator for both conditions.
- Verified completion rate, rework count, and unresolved failure count.
- Whether the pack condition outperformed ordinary `/goal` on evidence-backed completion without materially increasing time.

The first milestone passes only if every submitted pack validates and compiles, every fresh install can discover it without a skill edit, every explicit exclusion is respected, and the pack-assisted run produces stronger completion evidence than its paired ordinary `/goal` run. Until those human observations exist, report the human milestone as **not run**.
