# Asset Descriptions

One line per file. Read this instead of opening every image individually.

To find a specific brand or icon, **grep this file for the brand name in the description text** (e.g. `grep -i 'autodesk' asset-descriptions.md`). The Gemini Vision captions identify what's actually in each file — that's the agent's selector.

The `logo-<hash>.svg` filename prefix is a cheap structural hint (DOM said this SVG was inside a `<header>`, home-link `<a>`, or had an aria-label matching the page brand). It is NOT a content claim — many `logo-*` files are nav icons or decorative shapes. Trust the captions, not the filename prefix.

- og-image.png — 1177KB, This image features the text "What do you want to build today?" above three icons—a paper airplane, a server, and a web layout—set against a light background with blue, orange, and green accents.
- possible-homepage.png — captured homepage hero and Outcome Pack library for the current local Possible site.
- possible-expectations.png — captured Expectations & evidence documentation page showing output, expectation, evidence, and verification as separate layers.
- possible-pack.png — captured Playable Web Game Outcome Pack page showing its reviewed contract, outputs, Expectations, and execution plan.
