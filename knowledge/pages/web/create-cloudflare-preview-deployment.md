---
slug: create-cloudflare-preview-deployment
title: Create a Cloudflare preview deployment
summary: Deploy a compatible project to an approved non-production Cloudflare target and return its URL and runtime-verification evidence.
tags: [cloudflare, preview, workers, external-effect]
reviewedAt: 2026-07-17
sources:
  - title: Next.js on Cloudflare Workers
    url: https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/
---

## What this makes possible

A Cloudflare preview puts a compatible Web application on a non-production target so its real runtime and browser flows can be checked. The handoff invokes [Cloudflare Workers](/wiki/cloudflare-workers) and produces a preview URL plus a deployment-verification receipt.

## A common approach

Live-check the Workers runtime and the current framework-adapter support against the project. Ask the captain to approve Wrangler authentication and creation of externally reachable preview state. Deploy only to the approved non-production target, then return the exact URL and verification evidence.

## Use this when

Use this action after Cloudflare Workers has passed a live compatibility check and a non-production environment is needed for browser verification. It is an external delivery action within [Web](/wiki/web).

## Consider another route when

Do not use this route if required Next.js features, Node.js APIs, or middleware are unsupported by the current adapter or Workers runtime. If Vercel is the compatible selected provider, [Create a Vercel preview deployment](/wiki/create-vercel-preview-deployment) instead.

## Important decisions

Authenticated deployment changes external provider state and therefore requires explicit approval. Preview approval covers neither a production target nor a later production release; production approval must be requested separately.

## How to verify

Confirm that the returned URL belongs to the approved target, exercise the declared runtime and browser flows, and apply the relevant [Production web verification](/wiki/production-web-verification) checks. Record the deployment identity, URL, and evidence in the receipt rather than treating a successful command as sufficient proof.
