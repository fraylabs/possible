# Preserved failed review 01

This directory preserves the first fresh independent review of source/outcome manifest 2047c7f8b16c708adb7c468cb93a5e3c9f261ae99bb36267ecfbdaa15e87b4c7.

- Review completed: 2026-07-18T20:38:38Z
- L5 decision: Fail
- L8 decision: Fail
- Local package decision: Not ready
- Public release decision: Not ready, unproven, and unauthorized

Material findings:

- product/src/App.tsx:115 — input has no meaningful name.
- product/src/App.tsx:213 — product has no skip link.
- product/src/styles.css:132,217,266,383,513,599 — directly measured small-text contrast below 4.5:1.
- site/src/styles.css:570 — directly measured 4.45:1 small-text contrast.
- scripts/browser_contract.py:76 and scripts/ui_review.py:94 — screenshots are captured before completion/entrance transitions settle.

Source hashes at failure:

- product/src/App.tsx — 7bd595c3fce9ff2ce5ef5c83c3438c6619990f54070361f60e23ef3e80ac8c54
- product/src/styles.css — 4c97090daec074ac2f2bd9d83f466f80d3ccd7d53da646323a2d884b3eda7031
- product/index.html — 5c786b3bdeccc88cf2cc7f5167ec5833f05230824f501c879771d188579a993b
- site/src/App.tsx — 3bb50dd43d890faac3fc27d8fa0ad4ac20862bdcbee3ad83061616e053c3066b
- site/src/styles.css — 7a40f36a370f2343768293a397082fff1f92434e40f899617b7a83adeae24ad1
- site/index.html — f218cac8f53f6ef2609a5732893cf24e082b53a1831e7cb4f14986ff0ed5fa6c
- scripts/browser_contract.py — f8efe78e1ccb46545584422949a052773c0a0ae04cdf0c6f7b049720e9d5082e
- scripts/ui_review.py — 0466331a5d3ce8146b97314a96c6e973cdb57f9461f7658cb85096c7ff34874a

Screenshot hashes at failure:

- evidence/screenshots/product-done-desktop.png — 20332c8d19b6ab5fb86e6433b8ca96323b6ca832ca6d17e41be08e810b6d3631
- evidence/screenshots/site-desktop.png — 61b71697235ac3ca5e8236a3b301c9d00251ae5707ec50c6c67a85f076e5b460
- evidence/screenshots/site-mobile.png — 01a3fa6295fc445108bfd3f45d56952b357429fcec0ec3651fa9461e000c3d4b

The exact first-pass gate and final decisions are copied below. Later repairs must not reinterpret this manifest as passing.
