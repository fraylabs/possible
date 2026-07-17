---
slug: request-xometry-quote
title: Request a Xometry quote
summary: An approval-gated handoff of process-compatible CAD and drawings to Xometry's web quote flow, capturing live supplier assumptions without authorizing an order or fabrication.
tags:
  - quote
  - xometry
  - supplier-network
  - captain-approval
reviewedAt: 2026-07-17
sources:
  - title: Xometry capabilities
    url: https://www.xometry.com/capabilities/
---
Requesting a Xometry quote is an external custom-part handoff through [Xometry](/wiki/xometry). It uploads process-compatible CAD and drawings into the live quote flow, captures supplier assumptions, and stops before ordering or fabrication.

Use this action only after process-specific format checks and explicit approval of the proprietary upload. It applies when Xometry remains on the live shortlist and the package uses a currently accepted format with the required drawings. Choose [Request a Protolabs quote](/wiki/request-protolabs-quote) when Protolabs offers the better live process, DFM, or inspection path.

Do not proceed if supplier, process, inspection, material, geography, or API assumptions have not been verified live. The approval gate exists because the upload discloses proprietary design files and creates external supplier-network quote state.

Steps:
1. Live-check process, accepted format, material, inspection, supplier, geography, and destination conditions.
2. Present the exact package and disclosure for captain approval.
3. Upload only the approved revision and configure a quote without ordering.
4. Return quote, supplier assumptions, DFM feedback, and package revision.

This action should produce a live quote receipt, supplier and DFM assumptions, and a handoff audit record.
