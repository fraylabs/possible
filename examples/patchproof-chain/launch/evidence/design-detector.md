# Impeccable detector record

The required mechanical detector ran once after the selected launch surface was complete:

```bash
node .agents/skills/impeccable/scripts/detect.mjs --json launch/site/index.html launch/site/styles.css launch/site/app.js
```

## Findings

- One warning identified the generic body-font fallback.
- Advisories identified intentional type sizes outside the compact `DESIGN.md` role sample.
- Advisories identified two literal colors not present in the documented palette.
- No severe finding was reported.

## Repairs

- Replaced Arial with the documented Avenir Next / Trebuchet MS humanist stack.
- Replaced the two literal colors with the documented `caution` and `perforation` tokens.
- Retained the intentional responsive type sizes. `DESIGN.md` describes role intent and the final CSS is the exact implementation record.

Per the detector workflow, it was not run a second time. Browser, accessibility, claims, and documentation checks run independently below.
