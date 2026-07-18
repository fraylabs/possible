---
slug: create-cloudflare-preview-deployment
title: Creating a Cloudflare preview deployment
summary: Guidance for deploying a compatible project to an approved non-production Cloudflare target and collecting runtime evidence.
tags: [cloudflare, preview, workers, external-effect]
reviewedAt: 2026-07-17
sources:
  - title: Next.js on Cloudflare Workers
    url: https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/
---

## What this makes possible

A Cloudflare preview can put a compatible Web application on a non-production
target so its runtime and browser flows can be checked. This guide covers the
approval and evidence considerations around [Cloudflare Workers](/wiki/cloudflare-workers).
Possible itself does not authenticate, deploy, or verify the result.

## A common approach

Live-check the Workers runtime and current framework-adapter support against the
project. Ask the user or release owner to approve Wrangler authentication and
creation of externally reachable preview state. If authorized, the host agent
should use only the approved non-production target, then return the exact URL
and the evidence it gathered.

## Use this when

Use this guide when current project evidence supports Cloudflare Workers and a
non-production environment is needed for browser review. [Web](/wiki/web) is
broader related reading, not a project sequence.

## Limits and alternatives

Do not use this approach if required Next.js features, Node.js APIs, or
middleware are unsupported by the current adapter or Workers runtime.
[Vercel preview deployments](/wiki/create-vercel-preview-deployment) are a
related alternative whose fit the host must establish independently.

## Important decisions

Authenticated deployment changes external provider state and therefore requires explicit approval. Preview approval covers neither a production target nor a later production release; production approval must be requested separately.

## How to verify

The consuming agent should confirm that the returned URL belongs to the approved
target, exercise the declared runtime and browser flows, and apply relevant
[production web verification](/wiki/production-web-verification) checks. Record
the deployment identity, URL, and evidence rather than treating a successful
command—or this guide—as proof.
