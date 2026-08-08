# Asset Descriptions

One line per file. Read this instead of opening every image individually.

To find a specific brand or icon, **grep this file for the brand name in the description text** (e.g. `grep -i 'autodesk' asset-descriptions.md`). The Gemini Vision captions identify what's actually in each file — that's the agent's selector.

The `logo-<hash>.svg` filename prefix is a cheap structural hint (DOM said this SVG was inside a `<header>`, home-link `<a>`, or had an aria-label matching the page brand). It is NOT a content claim — many `logo-*` files are nav icons or decorative shapes. Trust the captions, not the filename prefix.

- contact-sheet.jpg — 35KB, This light-background image displays the text "What do you want to build today?" above three colorful square icons representing a paper plane, a server, and a website layout.
- og-image.png — 1177KB, This light-background image displays the text "What do you want to build today?" alongside icons representing a paper airplane, a server, and a web layout, featuring dominant blue, orange, and green accents.
