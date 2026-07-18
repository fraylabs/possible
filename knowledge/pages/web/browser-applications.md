---
slug: browser-applications
title: Browser applications
summary: Interactive browser software whose architecture must account for navigation, client and server boundaries, data mutation, state, accessibility, testing, and deployment.
tags: [browser, application, routing, data]
reviewedAt: 2026-07-17
sources:
  - title: Sunsetting Create React App
    url: https://react.dev/blog/2025/02/14/sunsetting-create-react-app
---

## What this makes possible

[Web](/wiki/web) applications can support multiple views, navigation, data reads and mutations, persistent state, and accessible user flows across client and server boundaries.

## A common approach

Classify the application by its data flow and runtime needs before selecting a stack. Decide which work belongs in the client or server, how routes and state behave, where mutations occur, and how the result will be tested and deployed. Use [Framework selection](/wiki/framework-selection) only after those constraints are visible.

## Use this when

Use application patterns when the browser surface has multiple routes or views, or when the product reads or mutates application data.

## Limits and alternatives

A single static document with negligible interaction may not need an application framework. Start from [3D web experiences](/wiki/3d-web-experiences) when rendering, assets, input, and frame budget dominate the architecture instead of ordinary data flow.

## Important decisions

Record the navigation model, client/server boundary, mutation path, state ownership, accessibility target, critical test flows, and deployment constraints before treating the architecture as settled.

## How to verify

Verify the classification against a representative route that exercises navigation plus real data reads or mutations. The chosen architecture should make the client and server boundary, state ownership, and deployment target explicit before [Framework selection](/wiki/framework-selection) is treated as settled.
