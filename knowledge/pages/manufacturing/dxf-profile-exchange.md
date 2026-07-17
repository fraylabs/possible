---
slug: dxf-profile-exchange
title: DXF profile exchange
summary: A 2D drawing exchange format commonly used to hand off clean, closed, one-to-one cut profiles or flat patterns to sheet cutting workflows.
tags:
  - dxf
  - 2d
  - laser-cutting
  - flat-pattern
reviewedAt: 2026-07-17
sources:
  - title: SendCutSend getting started
    url: https://sendcutsend.com/guidelines/getting-started/
---
DXF is a 2D drawing exchange format used to hand off clean, closed, 1:1 cut profiles or flat patterns to sheet-cutting workflows.

Use DXF when the target process consumes a planar cut profile or flat pattern and the provider explicitly accepts DXF for the selected service. Keep units explicit, contours closed, duplicate geometry removed, and only process-relevant entities in the file. Choose [STEP solid exchange](/wiki/step-solid-exchange) instead when the process requires 3D solid geometry, partial-depth features, or other details that a 2D profile cannot express.

DXF is commonly accepted for planar laser sheet cutting, but the right verification is still service-specific preflight against the provider's current guidance and the exact file revision being uploaded.
