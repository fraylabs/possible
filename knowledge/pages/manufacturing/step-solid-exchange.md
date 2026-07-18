---
slug: step-solid-exchange
title: STEP solid exchange
summary: A neutral ISO 10303 product-data exchange family used to transfer part and assembly geometry and related product information between CAD, manufacturing, analysis, and inspection systems.
tags:
  - step
  - iso-10303
  - solid
  - cad-exchange
reviewedAt: 2026-07-17
sources:
  - title: ISO 10303-21:2016
    url: https://www.iso.org/standard/63141.html
  - title: NIST STEP File Analyzer
    url: https://www.nist.gov/services-resources/software/step-file-analyzer-and-viewer
---
STEP is a neutral ISO 10303 solid exchange family for part and assembly handoff between CAD, manufacturing, analysis, and inspection systems. It is a common artifact in custom-part workflows and many CNC quote paths.

Use a revisioned STEP export when the receiving provider or tool accepts neutral solid geometry, but keep the native parametric model and drawing because STEP is not the native feature history. Choose [STL mesh exchange](/wiki/stl-mesh-exchange) for additive workflows that explicitly accept triangulated geometry when a mesh handoff is intended, use a provider-accepted 2D format such as [DXF profile exchange](/wiki/dxf-profile-exchange) when the target requires a 2D profile, and retain the native CAD format when the receiving workflow explicitly requires it.

Verification matters here: retain the editable design source separately, and validate the exported file in the receiving CAD or manufacturing workflow with a real STEP check such as the NIST analyzer or the target provider's import preview.
