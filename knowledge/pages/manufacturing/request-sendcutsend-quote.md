---
slug: request-sendcutsend-quote
title: Request a SendCutSend quote
summary: An approval-gated handoff of a revisioned manufacturing package to SendCutSend for live process configuration and pricing, without authorizing payment, order, or fabrication.
tags:
  - quote
  - sendcutsend
  - upload
  - captain-approval
reviewedAt: 2026-07-17
sources:
  - title: SendCutSend getting started
    url: https://sendcutsend.com/guidelines/getting-started/
---
Requesting a SendCutSend quote is an external custom-part handoff through [SendCutSend](/wiki/sendcutsend). It uses a revisioned manufacturing package, creates live quote state, and stops before payment, ordering, or fabrication.

Use this action only after local preflight and explicit approval of the exact files, intellectual-property exposure, account, and quote request. It applies when SendCutSend remains on the live shortlist and an accepted-format package has already passed local DFM preflight. Choose [Request a Protolabs quote](/wiki/request-protolabs-quote) when Protolabs fits the package better.

Do not proceed if the selected file, process, material, feature, destination, or tolerance conditions are not confirmed live. The approval gate exists because the upload discloses proprietary design files and creates account-bound external quote state.

Steps:
1. Live-check accepted files and process, material, thickness, feature, tolerance, and destination constraints.
2. Present the exact revisioned package and intellectual-property exposure for captain approval.
3. Upload only the approved package and configure a quote without ordering.
4. Return the quote, advisories, assumptions, and package revision for review.

This action should produce a live quote receipt, provider advisories, and a handoff audit record.
