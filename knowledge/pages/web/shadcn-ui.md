---
slug: shadcn-ui
title: shadcn/ui
summary: An open-code React component distribution model that copies customizable component source into an application and leaves its maintenance with the project.
tags: [ui, components, tailwind, open-code]
reviewedAt: 2026-07-17
sources:
  - title: shadcn/ui documentation
    url: https://ui.shadcn.com/docs
  - title: Base UI is now the default
    url: https://ui.shadcn.com/docs/changelog/2026-07-base-ui-default
---

[shadcn/ui](https://ui.shadcn.com/) uses a CLI to add React component source to the application rather than delivering a sealed, centrally upgraded component package. This makes deep customization straightforward and makes the project responsible for the resulting code.

## What this makes possible

shadcn/ui can accelerate interface composition for [Browser applications](/wiki/browser-applications), including familiar tables, forms, navigation, and controls for [Data-heavy dashboards](/wiki/data-heavy-dashboards). It documents a supported installation path for [Next.js](/wiki/nextjs).

## Use this when

Use it when the application has a compatible React and Tailwind setup and the team prefers to own, inspect, and customize component source locally.

## Limits and alternatives

Choose a centrally versioned design-system package when coordinated upgrades matter more than source ownership. If the team rejects Tailwind or does not want to maintain copied component code, a custom component layer in [Vite with React](/wiki/vite-react) avoids adopting shadcn/ui's distribution model.

## Important decisions

Treat generated components as application code: decide how local changes are reviewed and how upstream improvements are evaluated. At this review date, Base UI is the documented default, so check the primitive used by current examples instead of assuming older component internals.

## Common mistakes

Do not assume copied components receive automatic fixes when the upstream project changes. Avoid importing many components before confirming that the styling, primitive choice, and maintenance model fit the product.

## How to verify

Build the application and exercise keyboard navigation, focus behavior, responsive layouts, and local customizations for every adopted component. Review the generated source and dependencies as carefully as handwritten interface code.
