---
slug: promote-vercel-deployment-to-production
title: Promoting a Vercel deployment to production
summary: Guidance for promoting a reviewed Vercel preview only after separate approval of the exact production target, domain, configuration, cost, and release impact.
tags: [vercel, production, promotion, approval-gated]
reviewedAt: 2026-07-17
sources:
  - title: Deploying to Vercel
    url: https://vercel.com/docs/deployments/overview
---

## What this makes possible

This guide explains the decisions and evidence involved when a host agent or
operator promotes a reviewed Vercel preview to an approved user-facing release.
[Vercel preview deployments](/wiki/create-vercel-preview-deployment) are useful
related context, not proof that production promotion is authorized or ready.

## A common approach

Present the preview evidence and name the exact production target. Ask the user
or release owner to approve the domain, configuration, expected cost, traffic
exposure, and release impact. If the host performs the promotion through
[Vercel](/wiki/vercel), it should act only on that approved deployment, then
check the production URL and record its deployment identity.

## Use this when

Consult this guide when a reviewed preview may be promoted and the consuming
agent needs to identify the separate production approval and evidence boundary.
[Production web verification](/wiki/production-web-verification) describes
useful checks, but Possible does not run them or decide that they passed.

## Limits and alternatives

Keep the release in preview if project verification is incomplete, approval is
missing, or production would use a different scope or configuration. A new
preview may be useful for an unreviewed change, but the host agent must decide
that from the actual project state.

## Important decisions

Production promotion is always a new approval gate. Neither preview approval nor a successful build authorizes a user-facing release, and a production change may affect domains, traffic, provider usage, and cost.

## Common mistakes

Do not promote a different artifact from the one that was verified, silently change production configuration, or report only that the promotion command succeeded. Those shortcuts break the connection between approval, evidence, and the released deployment.

## How to verify

The consuming agent should confirm the final URL, deployment identity, approved
configuration, and critical production behavior, then preserve that evidence so
the released artifact can be traced to the reviewed preview and approval.
Reading this guide is not evidence that any release was performed or validated.
