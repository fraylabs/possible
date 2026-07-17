---
slug: web
title: Web
summary: Operational knowledge for outcomes delivered through browsers, from application architecture and interface composition to rendering, deployment, and verification.
tags: [browser, software, deployment, frontend]
reviewedAt: 2026-07-17
sources:
  - title: "React: the library for web and native user interfaces"
    url: https://react.dev/
---

## What this makes possible

Web knowledge supports outcomes primarily experienced through a browser, including application architecture, interface composition, rendering, deployment, and browser verification.

## A common approach

Start here when the primary user surface runs in a browser. Narrow the work by its interaction model, data flow, rendering needs, runtime boundaries, deployment target, and verification requirements. For routed or stateful software, continue with [browser applications](/wiki/browser-applications).

## Use this when

Use the Web branch when browser delivery is central to the requested outcome and deployment plus browser verification are part of “done.”

## Consider another route when

When the primary artifact is a fabricated physical component or embedded system, start with [Custom manufactured parts](/wiki/custom-manufactured-parts) instead. A web surface may still configure, quote, or monitor a custom part, but it does not replace the physical-product requirements.

## Important decisions

Identify whether the browser is the product surface or only an accessory. Then make the application, rendering, deployment, and verification decisions at the narrowest relevant page rather than assuming one frontend stack fits every outcome.

## How to verify

Verify the classification by naming the primary user surface, the runtime boundary, and the delivery target. If the browser is central, continue into the narrower page that governs the actual work, such as [Browser applications](/wiki/browser-applications), rather than treating Web as a sufficient implementation decision on its own.
