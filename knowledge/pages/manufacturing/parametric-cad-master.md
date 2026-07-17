---
slug: parametric-cad-master
title: Parametric CAD master
summary: A native editable model whose named dimensions, constraints, interfaces, and revision history remain the design source of truth while process-specific files are exported as artifacts.
tags: [parametric-cad, source-of-truth, revision, automation]
reviewedAt: 2026-07-17
sources:
  - title: "Variable Studios automate parametric modeling"
    url: https://www.onshape.com/en/resource-center/tech-tips/variable-studios-automate-parametric-modeling
---

## What this makes possible

A native editable CAD source with named parameters, stable interfaces, and revision identity that every downstream export can trace back to.

## A common approach

Keep the native parametric model as the source of truth and export revision-specific STEP, mesh, drawing, or profile artifacts rather than editing downstream files independently.

## Use this when

Use this practice when dimensions or interfaces may change across iterations, or when more than one manufacturing or simulation artifact derives from the same geometry.

## Consider another route when

If the geometry is a one-time non-parametric capture whose source cannot be reconstructed as editable CAD, say so explicitly. A GUI-native [FreeCAD](/wiki/freecad) model is the alternative path to a script-authored [CadQuery](/wiki/cadquery) master.

## Important decisions

This practice preserves controlled intent within [Custom manufactured parts](/wiki/custom-manufactured-parts). [CadQuery](/wiki/cadquery) supports script-authored parametric solids, [CAD Skills (text-to-cad)](/wiki/text-to-cad) packages a STEP-first workflow for compatible agents, and [STEP solid exchange](/wiki/step-solid-exchange) remains a common neutral revisioned artifact.

## How to verify

Confirm that every exported artifact can be traced to the exact native-model revision and parameter set.
