---
slug: threejs
title: Three.js
summary: A JavaScript 3D engine for browser scenes, cameras, rendering, geometry, materials, loaders, animation, and controls.
tags: [threejs, webgl, 3d, renderer]
reviewedAt: 2026-07-17
sources:
  - title: Three.js fundamentals
    url: https://threejs.org/manual/en/fundamentals.html
---

[Three.js](https://threejs.org/) is a browser 3D engine that exposes the scene graph and rendering lifecycle directly. It includes scenes, cameras, renderers, geometry, materials, loaders, animation tools, and controls.

## What this makes possible

Three.js is a renderer option for interactive [3D web experiences](/wiki/3d-web-experiences), from product viewers to animated spatial interfaces. It can be bundled into a [Vite with React](/wiki/vite-react) project without making React responsible for the scene.

## Use this when

Use Three.js directly when interactive browser 3D is required and explicit, imperative control of scene objects, the frame loop, and renderer lifecycle fits the architecture.

## Limits and alternatives

When React already owns the surrounding application and scene state benefits from declarative component composition, compare [React Three Fiber](/wiki/react-three-fiber). It retains the Three.js ecosystem while integrating scene construction with React's lifecycle.

## Important decisions

Choose the camera, renderer settings, frame-loop ownership, asset-loading strategy, resize behavior, and resource-disposal policy early. Direct control is valuable, but those lifecycle responsibilities stay with the application.

## Common mistakes

Do not leave the renderer at a fixed canvas size, create GPU resources every frame, or forget to dispose resources when scenes are replaced. Avoid judging performance from a simple development scene when production assets and interaction are materially heavier.

## How to verify

Test the production build on target browsers and representative devices. Exercise loading failures, resizing, animation, controls, visibility changes, and scene teardown while watching frame time, memory use, and console errors.
