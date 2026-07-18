---
slug: vite-react
title: Vite with React
summary: A lightweight React development and production-build setup for client-rendered applications that choose routing and server services independently.
tags: [react, vite, client-only, build-tool]
reviewedAt: 2026-07-17
sources:
  - title: Sunsetting Create React App
    url: https://react.dev/blog/2025/02/14/sunsetting-create-react-app
  - title: Vite guide
    url: https://vite.dev/guide/
---

[Vite](https://vite.dev/) supplies a fast development server and a production asset build while leaving most application policy to the project. With React, it is a framework-light option for client-oriented web work.

## What this makes possible

Vite with React supports client-rendered [Browser applications](/wiki/browser-applications) without imposing an integrated server runtime or file-system router. The team can select routing, APIs, authentication, and hosting as separate concerns.

It can also host declarative 3D scenes built with [React Three Fiber](/wiki/react-three-fiber).

## Use this when

Use this setup when the application is intentionally client-rendered, does not need integrated server rendering, and benefits from a lightweight build whose server services can evolve independently.

## Limits and alternatives

Choose [Next.js](/wiki/nextjs) when framework-integrated routing, server data, or server rendering removes more system work than it adds. A Vite client can call server services, but Vite does not itself supply the full-stack application conventions that Next.js does.

## Important decisions

Choose the router, server boundary, environment-variable policy, and deployment target explicitly. Keeping framework policy light gives the project flexibility, but it also makes these decisions the project's responsibility.

## Common mistakes

Do not treat the development server as the shipped architecture. Browser history fallbacks, asset base paths, environment values, and API routing can behave differently once the production bundle is hosted.

## How to verify

Run the production build, serve its output under the intended path, and test direct navigation, client-side navigation, asset loading, and calls to independently hosted services.
