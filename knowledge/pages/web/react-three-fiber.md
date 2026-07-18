---
slug: react-three-fiber
title: React Three Fiber
summary: A React renderer for Three.js that expresses scene graphs as components while retaining access to Three.js objects and its wider ecosystem.
tags: [react, threejs, 3d, renderer]
reviewedAt: 2026-07-17
sources:
  - title: React Three Fiber introduction
    url: https://r3f.docs.pmnd.rs/getting-started/introduction
---

[React Three Fiber](https://r3f.docs.pmnd.rs/) is a React renderer for Three.js. It lets a React application express a 3D scene as components while retaining access to underlying Three.js objects, loaders, materials, and other ecosystem tools.

## What this makes possible

React Three Fiber supports React-led [3D web experiences](/wiki/3d-web-experiences) whose scene state and interface state benefit from a shared component composition model. It can run inside client-side React boundaries in [Next.js](/wiki/nextjs).

## Use this when

Use it when React already owns the surrounding application and declarative scene composition is more valuable than a framework-neutral imperative lifecycle.

## Limits and alternatives

Use [Three.js](/wiki/threejs) directly when the scene must remain independent of React, is dominated by imperative lifecycle control, or should avoid React runtime coupling.

## Important decisions

Decide which state belongs in React, which work belongs in the render loop, and where direct Three.js object access is warranted. In a server-aware React framework, keep browser-only canvas and WebGL work behind a client boundary.

## Common mistakes

Do not drive high-frequency frame state through ordinary React re-renders when the render loop can update it directly. Clean up assets, subscriptions, and effects, and do not assume React composition removes the underlying GPU and Three.js lifecycle costs.

## How to verify

Build the production application and confirm that the canvas mounts only in a browser-capable boundary. Test asset loading, frame behavior, interaction, resize handling, route changes, teardown, and representative device performance.
