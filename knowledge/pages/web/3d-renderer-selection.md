---
slug: 3d-renderer-selection
title: 3D renderer selection
summary: A decision record covering direct scene control, React integration, target browser APIs, asset pipeline, interaction model, and expected rendering complexity.
tags: [renderer, threejs, webgl, webgpu]
reviewedAt: 2026-07-17
sources:
  - title: Three.js WebGPU renderer
    url: https://threejs.org/manual/en/webgpurenderer.html
---

## What this makes possible

An explicit renderer decision aligns work in [3D web experiences](/wiki/3d-web-experiences) with its target browsers, application framework, asset pipeline, interaction model, and expected scene complexity.

## A common approach

Use stable WebGL-backed [Three.js](/wiki/threejs) as the conservative browser baseline when broad, predictable behavior matters. Treat the WebGPU renderer as a separate compatibility decision that must be revalidated against current limitations and the actual target environment.

Choose direct scene control when it suits the application boundary. Compare [React Three Fiber](/wiki/react-three-fiber) when the application is React-led and declarative scene composition would make the code easier to maintain.

## Use this when

Use this practice when interactive browser 3D is essential and browser graphics support can determine whether the experience works.

## Consider another route when

A controlled environment may justify WebGPU-specific requirements, but only after it has been tested and the project explicitly accepts experimental renderer limitations.

## Important decisions

Record the renderer, browser API, framework boundary, asset path, input model, expected complexity, and fallback. The fallback should say what users receive when the preferred graphics path is unavailable.

## How to verify

Exercise the selected renderer in every supported browser class before commitment. Verify the representative scene and fallback, not only a minimal renderer initialization.
