---
slug: nextjs
title: Next.js
summary: A React framework for full-stack browser applications with file-system routing, server and client component boundaries, and several deployment modes.
tags: [react, framework, routing, server-components]
reviewedAt: 2026-07-17
sources:
  - title: Next.js App Router
    url: https://nextjs.org/docs/app
  - title: Deploying Next.js
    url: https://nextjs.org/docs/app/getting-started/deploying
---

[Next.js](https://nextjs.org/) is a React framework for full-stack web applications that combines routing, rendering, and server-execution conventions in one project.

## What this makes possible

Next.js can provide file-system routes, server-side data access, server and client component boundaries, and production rendering for [Browser applications](/wiki/browser-applications). The App Router gives those concerns a shared framework rather than requiring the application to assemble them independently.

## Use this when

Use Next.js when React is an accepted constraint and routing, server data, or framework-integrated rendering materially reduces the work needed to ship the application.

It also pairs with [shadcn/ui](/wiki/shadcn-ui) when the interface benefits from locally owned React component source.

## Consider another route when

For an intentionally client-rendered application that does not need Next.js routing or server conventions, [Vite with React](/wiki/vite-react) is the smaller alternative. Choose a non-React route when React itself is not appropriate.

Do not select Next.js from its development experience alone when the chosen static export or hosting provider does not support the framework features the application needs.

## Important decisions

Decide which routes need server execution, where client component boundaries belong, and which deployment mode will run the result. Verify those choices together: a feature supported by the framework may still be unavailable in a particular deployment mode.

## How to verify

Build and run the production artifact in the intended deployment mode. Exercise routing, server data, client interactions, and direct navigation to each important route rather than relying only on the development server.
