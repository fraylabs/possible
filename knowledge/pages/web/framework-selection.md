---
slug: framework-selection
title: Framework selection
summary: A constraint-first comparison of routing, rendering, server data, deployment targets, ecosystem fit, and maintenance ownership before committing an application stack.
tags: [framework, architecture, constraints, trade-offs]
reviewedAt: 2026-07-17
sources:
  - title: Sunsetting Create React App
    url: https://react.dev/blog/2025/02/14/sunsetting-create-react-app
  - title: Deploying Next.js
    url: https://nextjs.org/docs/app/getting-started/deploying
---

## What this makes possible

A constraint-first framework decision gives a browser project an implementation starting point without turning a familiar default into a universal rule. It also leaves future maintainers a record of why the chosen runtime and delivery model fit.

## A common approach

Start with the required routing, rendering, server execution, static-output, and deployment behavior. Then compare ecosystem fit and who will maintain framework-specific code. Record the selected framework, where it applies, and the strongest rejected alternative.

[Next.js](/wiki/nextjs) is one candidate when server framework features or its deployment modes are useful. Always compare [Vite with React](/wiki/vite-react) when a client-oriented application does not need those features.

## Use this when

Use this practice when a new project falls under [Browser applications](/wiki/browser-applications) and routing, server execution, static output, or deployment compatibility can materially change the choice.

## Limits and alternatives

Keep the framework of an existing, maintained application when migration is outside the outcome. A framework review is not a reason by itself to reopen a settled architecture.

## Important decisions

Write down the required rendering and delivery modes, the deployment target, the ownership boundary, and why the rejected option was not selected. This decision record is the useful output—not simply a framework name.

## How to verify

Check current official documentation for every required rendering and deployment mode. Exercise the critical route against the intended build and hosting target before treating the choice as committed.
