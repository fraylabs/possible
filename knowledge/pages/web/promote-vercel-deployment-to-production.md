---
slug: promote-vercel-deployment-to-production
title: Promote a verified Vercel deployment to production
summary: Promote an already verified Vercel preview only after separate approval of the exact production target, domain, configuration, cost, and release impact.
tags: [vercel, production, promotion, captain-approval]
reviewedAt: 2026-07-17
sources:
  - title: Deploying to Vercel
    url: https://vercel.com/docs/deployments/overview
---

## What this makes possible

This action promotes the reviewed result of [Create a Vercel preview deployment](/wiki/create-vercel-preview-deployment) into the approved user-facing release. It produces a production URL and a production-verification receipt tied to the resulting deployment identity.

## A common approach

Present the preview-verification receipt and name the exact production target. Ask the captain to approve the domain, configuration, expected cost, traffic exposure, and release impact. Promote only that approved deployment through [Vercel](/wiki/vercel), then verify the production URL and record its deployment identity.

## Use this when

Proceed only when the preview has passed the declared [Production web verification](/wiki/production-web-verification) and the captain has reviewed the complete production scope.

## Consider another route when

Stay on the preview if verification is incomplete, approval is missing, or production would use a different scope or configuration. Running [Create a Vercel preview deployment](/wiki/create-vercel-preview-deployment) again is safer than treating an unreviewed change as part of an earlier approval.

## Important decisions

Production promotion is always a new approval gate. Neither preview approval nor a successful build authorizes a user-facing release, and a production change may affect domains, traffic, provider usage, and cost.

## Common mistakes

Do not promote a different artifact from the one that was verified, silently change production configuration, or report only that the promotion command succeeded. Those shortcuts break the connection between approval, evidence, and the released deployment.

## How to verify

Confirm the final URL, deployment identity, approved configuration, and critical production behavior. Preserve those observations as the production-verification receipt so the released artifact can be traced back to the reviewed preview and approval.
