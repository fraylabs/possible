---
slug: cadquery
title: CadQuery
summary: A Python library for script-authored parametric solid CAD, suited to agent-readable models, repeatable parameter changes, and export of manufacturing exchange formats.
tags:
  - cadquery
  - python
  - parametric-cad
  - step
reviewedAt: 2026-07-17
sources:
  - title: CadQuery documentation
    url: https://cadquery.readthedocs.io/en/latest/
---
CadQuery is a Python library for script-authored parametric solid CAD. It fits parts that can be expressed through parametric solid modeling when source-level diff, automation, and repeatable variants matter.

Use CadQuery when a plain-text Python model and repeatable agent edits are valuable, but validate geometry and exports with real CAD checks. Choose [FreeCAD](/wiki/freecad) instead when interactive surfacing or a GUI-native parametric workflow fits better.

CadQuery is one implementation tool for a broader parametric CAD practice, and it documents export to [STEP solid exchange](/wiki/step-solid-exchange) for downstream handoff. Keep the native parametric source under revision control because the exported exchange file is not the design authority.
