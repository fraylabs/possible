---
slug: text-to-cad
title: CAD Skills (text-to-cad)
summary: An open-source agent skill library for STEP-first parametric CAD, geometry inspection, robot-description files, slicing, parts sourcing, and guarded fabrication handoffs.
tags: [agent-skills, parametric-cad, robotics, step, open-source]
reviewedAt: 2026-07-18
sources:
  - title: CAD Skills repository and documentation
    url: https://github.com/earthtojake/text-to-cad
  - title: CAD generation, inspection, and validation skill
    url: https://github.com/earthtojake/text-to-cad/blob/main/skills/cad/SKILL.md
---

## What this makes possible

CAD Skills, published from the `earthtojake/text-to-cad` repository, gives compatible agents focused workflows for creating and inspecting parametric CAD, exporting STEP and mesh formats, describing robots, sourcing standard parts, slicing print files, and handing validated artifacts to fabrication tools.

## A common approach

Use its CAD skill to turn a clear mechanical brief into an editable Python model and a validated STEP artifact. The workflow treats STEP as the primary exchange artifact, checks geometric facts, requires visual snapshots, and keeps STL, 3MF, and GLB as secondary exports. That fits a [Parametric CAD master](/wiki/parametric-cad-master) workflow and can feed [STEP solid exchange](/wiki/step-solid-exchange).

## Use this when

Use this project when an installed agent needs a repeatable local workflow for parts, assemblies, enclosures, brackets, robot descriptions, or fabrication preparation rather than a one-off rendered mesh. It is particularly relevant to [Robotic arms](/wiki/robotic-arms), where CAD geometry, purchased components, simulation descriptions, and manufacturing artifacts must stay connected.

## Limits and alternatives

It is not a substitute for structural certification, finite-element conclusions, tolerance ownership, or physical validation. Use a specialist engineering workflow when safety, regulated compliance, fatigue, or certified analysis determines acceptance. [FreeCAD](/wiki/freecad) and [CadQuery](/wiki/cadquery) remain direct modeling options when an agent skill bundle is unnecessary.

## How to verify

Keep the generated source and STEP together, run the project's geometry inspection and snapshot workflow, review the result visually, and verify every fit-critical dimension independently. Before fabrication, continue through [Design-for-manufacturing preflight](/wiki/design-for-manufacturing-preflight) and an explicit [Inspection plan](/wiki/inspection-plan).
