---
name: gallery-import
description: Inspect a public product gallery and extract its visible outcomes into strict, source-backed JSON for human review. Use when onboarding a gallery URL into Possible, refreshing an existing gallery draft, or correcting an incomplete import without inventing prompts, media, models, authors, or dates.
---

# Gallery Import

Turn one public gallery URL into reviewable Outcome records. Extraction is not publication: preserve what the source exposes, report uncertainty, and stop with a local JSON artifact.

## Contract

- Accept one public gallery URL and optional known company or product context.
- Read only pages and assets available without authentication or access-control bypasses.
- Follow public pagination and individual item links when needed to reach the visible prompt and result.
- Preserve an explicitly displayed prompt verbatim. Do not improve, complete, translate, or reconstruct it.
- Give every item a stable `sourceKey` and its canonical `sourceUrl`.
- Use `null` for missing values and add a precise warning. Never infer a model, author, date, prompt, or media URL.
- Keep extracted source values separate from later editorial corrections in Possible.
- Do not sign in, submit forms, publish records, change remote data, or download restricted media.

## Workflow

1. Confirm the supplied URL is a public gallery or a public page leading to gallery items.
2. Identify the product, company, item structure, and pagination from visible evidence.
3. Inspect each public item page needed for the requested scope.
4. Capture exact source values into the schema in `references/gallery-import.schema.json`.
5. Record missing, ambiguous, blocked, or duplicate fields under `warnings`.
6. Deduplicate items by canonical `sourceUrl`, using the source's durable item ID as `sourceKey` when available. Otherwise use a deterministic URL-derived key.
7. Save the finished artifact as `gallery-import.json` and validate it against the schema.
8. Report the item count, warning count, pages inspected, and any part of the gallery that could not be reached.

## Field Rules

- `title`: exact visible title. Use `null` when the source has no title.
- `prompt`: exact public prompt text, including punctuation and line breaks. Use `null` when hidden or absent.
- `resultMediaUrl`: direct public result media URL when exposed; otherwise `null`.
- `posterUrl`: public thumbnail or poster URL when exposed; otherwise `null`.
- `model`: exact visible product or model label; never normalize silently.
- `authorName` and `authorUrl`: only when visibly attributed by the source.
- `sourcePublishedAt`: ISO 8601 only when the source supplies a date or timestamp.
- `company` and `product`: source-backed identity hints, not ownership claims.

## Quality Bar

The import is complete only when:

- every item can be traced to its own public source URL;
- every copied prompt matches the visible source exactly;
- missing information is represented by `null`, not guesses;
- warnings explain every material extraction gap;
- the JSON validates against the bundled schema;
- no remote or public state was changed.
