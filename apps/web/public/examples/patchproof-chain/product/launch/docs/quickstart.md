# PatchProof five-minute quickstart

This is a tutorial for a developer evaluating PatchProof locally. It installs dependencies, opens the real browser app, and runs the complete verifier. It does not deploy or upload anything.

## Requirements

- Node.js 20.19 or newer
- npm
- Python 3 with Playwright available for the browser verifier
- Chromium installed for Playwright

## Start the product

From the repository root:

```bash
npm ci
npm run dev
```

Open the URL printed by Vite, normally `http://127.0.0.1:5173`.

## Generate one receipt

1. Choose **Passing evidence** from the Fixture control.
2. Select **Load fixture**.
3. Inspect the task, diff, check log, two claims, and explicit limitation.
4. Select **Generate receipt**.
5. Switch between Markdown and JSON or download the receipt.

Expected result: both claims are `passed`; the receipt still states that the fixture does not prove semantic patch correctness.

## Run every check

In another terminal:

```bash
npm run verify
```

Expected result:

- 34 unit assertions pass.
- All 12 fixture contracts pass.
- The product and local launch pages build.
- Desktop and mobile product browser flows pass.
- All three Remix previews preserve the same copy and 1440×900 comparison viewport.
- Desktop and mobile launch-site flows pass with no external requests or browser errors.

## Inspect the local launch explanation

With the dev server running, open `/launch/site/`. Switch among the three sample cases. That demonstration imports the same `buildReceipt` function used by PatchProof; it is not a hand-authored result.

## Troubleshooting

### The browser check cannot find Chromium

Install the Playwright browser in the active Python environment:

```bash
python -m playwright install chromium
```

### Port 5173 is already in use

Stop the existing process, or run the dev server on another port for manual use. The automated verifier expects port 5173.

### A receipt is unsupported

Inspect its explanation. Test claims need a referenced check with an explicit command. UI claims need a referenced visual artifact. “Operator says it looked correct” is not visual evidence.

### The import is rejected

Keep the current draft, correct the malformed or unsupported JSON, and validate it again. PatchProof does not partially apply imports.
