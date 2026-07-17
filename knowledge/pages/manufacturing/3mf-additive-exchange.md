---
slug: 3mf-additive-exchange
title: 3MF additive exchange
summary: An additive manufacturing package format with defined units, mesh geometry, transforms, metadata, and published extensions for materials and production workflows.
tags:
  - 3mf
  - additive
  - units
  - metadata
reviewedAt: 2026-07-17
sources:
  - title: 3MF specification suite
    url: https://3mf.io/spec/
---
3MF is an additive manufacturing package format with defined units, mesh geometry, transforms, metadata, and published extensions for materials and production workflows.

Use 3MF when the selected additive toolchain explicitly supports it and defined units or richer print metadata are useful. Choose [STL mesh exchange](/wiki/stl-mesh-exchange) only when the target accepts a simpler triangulated surface package, and do not substitute 3MF for [STEP solid exchange](/wiki/step-solid-exchange) when the recipient needs neutral solid geometry for CAD or machining exchange.

Verification is still toolchain-specific. Confirm that the provider or slicer actually supports the 3MF features you intend to rely on before treating the package as the final additive handoff. It can serve additive routes such as SLS when the selected provider explicitly accepts 3MF for that service.
