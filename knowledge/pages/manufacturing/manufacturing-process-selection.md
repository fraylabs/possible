---
slug: manufacturing-process-selection
title: Manufacturing process selection
summary: A requirements-led comparison of geometry, material behavior, quantity, finish, dimensional needs, inspection, and provider constraints before committing fabrication artifacts.
tags: [process-selection, fdm, sls, cnc, sheet-cutting]
reviewedAt: 2026-07-17
sources:
  - title: "FDM vs SLA vs SLS"
    url: https://formlabs.com/eu/blog/fdm-vs-sla-vs-sls-how-to-choose-the-right-3d-printing-technology/
  - title: "Design for machining toolkit"
    url: https://www.protolabs.com/resources/design-for-machining-toolkit/
---

## What this makes possible

A selected process with requirement fit, known risks, and at least one viable alternative before the part definition is optimized around a specific provider.

## A common approach

Select the process from functional requirements and geometry before optimizing the CAD for a provider. Keep at least one viable alternative until [Design-for-manufacturing preflight](/wiki/design-for-manufacturing-preflight) checks the chosen route.

## Use this when

Use this practice when a custom part can be produced by more than one process and material behavior, finish, geometry, or dimensional requirements affect viability.

## Consider another route when

If a regulated or already qualified process is fixed by an external requirement, document that constraint instead of reopening selection.

## Important decisions

This is an early practice within [Custom manufactured parts](/wiki/custom-manufactured-parts). [CNC machining](/wiki/cnc-machining) and [FDM additive manufacturing](/wiki/fdm-additive-manufacturing) are two process families often evaluated against the same requirement set.

## How to verify

Reject any universal tolerance, material, finish, or cost claim that is being copied across unlike processes.
