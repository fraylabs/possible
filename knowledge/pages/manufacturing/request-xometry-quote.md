---
slug: request-xometry-quote
title: Requesting a Xometry quote
summary: Guidance for an approval-gated handoff of process-compatible CAD and drawings to Xometry's quote flow without authorizing an order or fabrication.
tags:
  - quote
  - xometry
  - supplier-network
  - approval-gated
reviewedAt: 2026-07-17
sources:
  - title: Xometry capabilities
    url: https://www.xometry.com/capabilities/
---
This guide covers an external custom-part quote handoff through
[Xometry](/wiki/xometry). A host agent may use process-compatible CAD and
drawings to obtain live supplier assumptions, but Possible does not upload the
files, authorize disclosure, place an order, or fabricate a part.

Use this guide only after process-specific format checks and explicit approval
of the proprietary upload. Xometry must remain suitable on current project
evidence and the package must use a currently accepted format. [Protolabs quote
guidance](/wiki/request-protolabs-quote) is related reading, not an automatic
provider recommendation.

Do not proceed if supplier, process, inspection, material, geography, or API assumptions have not been verified live. The approval gate exists because the upload discloses proprietary design files and creates external supplier-network quote state.

One common host-side approach is:
1. Live-check process, accepted format, material, inspection, supplier, geography, and destination conditions.
2. Present the exact package and disclosure for user or project-owner approval.
3. Upload only the approved revision and configure a quote without ordering.
4. Return quote, supplier assumptions, DFM feedback, and package revision.

A useful host-side record includes the live quote, supplier and DFM assumptions,
the disclosed package revision, and the approval used. Reading this guide is not
evidence that a quote was requested or reviewed.
