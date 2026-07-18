---
slug: cloudflare-workers
title: Cloudflare Workers
summary: A Web application platform for static assets and server logic, with a documented Next.js deployment path through OpenNext and Wrangler.
tags: [hosting, workers, cloudflare, opennext]
reviewedAt: 2026-07-17
sources:
  - title: Next.js on Cloudflare Workers
    url: https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/
  - title: Cloudflare Workers static assets
    url: https://developers.cloudflare.com/workers/static-assets/
---

## What this makes possible

[Cloudflare Workers](https://workers.cloudflare.com/) can deploy server logic together with a configured static-asset directory as one application unit through Wrangler or a connected build. It also has a documented path for [Next.js](/wiki/nextjs) projects through the OpenNext adapter and Wrangler, producing a Workers deployment URL.

## A common approach

Check the application against the current Workers runtime and framework-adapter documentation, then [create a Cloudflare preview deployment](/wiki/create-cloudflare-preview-deployment) through authenticated Wrangler commands. Verify the resulting non-production URL before making any separately approved release decision.

## Use this when

Shortlist Workers when its runtime and static-asset model fit the application and the required framework path is currently supported. It is one deployment provider in [Web](/wiki/web).

## Limits and alternatives

Do not select Workers when required Node.js APIs or Next.js features are unsupported by the current runtime or adapter. [Vercel](/wiki/vercel) is an alternative when its integrated Next.js and Git deployment workflow fits better.

## Known constraints and live checks

At the review date, Cloudflare's Next.js guidance marked Node.js middleware support as not yet supported, so middleware requirements need explicit review. Before every handoff, recheck OpenNext and Next.js compatibility as well as current pricing, included usage, and request or asset billing; account and regional availability; compliance fit; bindings; and feature availability. These are live unknowns, not durable promises.

## Authenticated handoffs

The Wrangler build-and-deploy operation requires authentication, creates externally reachable provider state, and needs explicit approval. Confirm the target, credentials, source, and expected external effect before running it. This guide documents the relevant considerations; Possible does not hold the account or authorize the deployment.

## How to verify

Re-read the current adapter and runtime documentation against the project's actual features. After deployment, confirm the approved target and URL, exercise static assets and server behavior, and retain a receipt with the deployment identity and observed runtime evidence.
