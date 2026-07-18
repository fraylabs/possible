---
slug: website-design
title: Website design
summary: The visual and interaction design of a website, including hierarchy, responsive behavior, component language, accessibility, and a handoff that survives implementation.
tags: [art, web, design, interface, accessibility]
reviewedAt: 2026-07-18
sources:
  - title: Web Content Accessibility Guidelines 2.2
    url: https://www.w3.org/TR/WCAG22/
  - title: MDN CSS styling basics
    url: https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics
---

## What this makes possible

Website design turns a product brief into a visual and interaction system that can guide a browser implementation: page hierarchy, layout, typography, color, controls, responsive states, content structure, and accessibility expectations.

## A common approach

Start with the audience, primary action, content hierarchy, and supported viewport range. Establish a small visual language, then design the important states rather than only the ideal landing screen: loading, empty, error, focus, hover, validation, mobile, and long content. Express repeated choices as tokens and reusable components through [Design systems](/wiki/design-systems), then implement and verify the result as a [Browser application](/wiki/browser-applications).

## Use this when

Use this guide when the website’s visual language, information hierarchy, and interaction behavior are part of what must be delivered—not merely decoration added after engineering.

## Limits and alternatives

If the primary challenge is data flow, routing, or server behavior, continue with [Web](/wiki/web) and [Framework selection](/wiki/framework-selection). If the result is a standalone image or campaign asset, use [Image generation](/wiki/image-generation) or another art workflow instead.

## Important decisions

Record the content model, responsive breakpoints, type scale, color and contrast rules, interaction states, keyboard path, motion behavior, component boundaries, and implementation owner. A polished static mockup does not define how the design behaves with real content or assistive technology.

## How to verify

Review representative pages at supported widths with real-length content. Test keyboard navigation, focus visibility, contrast, reduced motion, form errors, screen-reader structure, and direct navigation in the implemented browser experience. Use [Production web verification](/wiki/production-web-verification) when the claim is production readiness.
