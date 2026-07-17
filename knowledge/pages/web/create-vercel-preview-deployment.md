---
slug: create-vercel-preview-deployment
title: Create a Vercel preview deployment
summary: Create an approval-gated Vercel preview from project source or a connected Git revision, then return a URL and evidence without promoting production.
tags: [vercel, preview, deployment, external-effect]
reviewedAt: 2026-07-17
sources:
  - title: Deploying Git repositories with Vercel
    url: https://vercel.com/docs/git
---

## What this makes possible

A preview gives reviewers an externally reachable version of a Web project before anything is released to production. It hands approved source or a Git revision to [Vercel](/wiki/vercel) and returns both a preview URL and a deployment-verification receipt.

## A common approach

First, live-check Vercel compatibility, the account and plan, and the intended target configuration. Ask the captain to approve repository or source access and creation of external preview state. Create the preview through the approved official path, then return the exact URL with the evidence used to verify it.

## Use this when

Use this route when Vercel was selected after a live provider check and a review environment is needed before production. It is one delivery action within [Web](/wiki/web), not an implicit release.

## Consider another route when

Do not proceed while repository access, secrets, provider terms, or the deployment target remain unapproved. When Workers is the compatible selected provider, [Create a Cloudflare preview deployment](/wiki/create-cloudflare-preview-deployment) instead.

## Important decisions

Authentication, source access, and deployment all create state outside Possible, so they require explicit approval. Approval to create a preview does not authorize production promotion; production is a separate decision with its own target, cost, domain, and release impact.

## How to verify

Confirm the returned preview URL is the intended deployment and run the applicable [Production web verification](/wiki/production-web-verification) checks against it. Record the deployment identity, observed URL, and verification evidence as the receipt. A successful build alone is not a verified preview.
