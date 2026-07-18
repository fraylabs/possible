---
slug: design-systems
title: Design systems
summary: A reusable visual and interaction vocabulary of tokens, components, states, and usage rules that keeps a website coherent as it grows.
tags: [art, web, design, components, systems]
kind: method
reviewedAt: 2026-07-18
sources:
  - title: Material Design 3 foundations
    url: https://m3.material.io/foundations
  - title: W3C Web Content Accessibility Guidelines 2.2
    url: https://www.w3.org/TR/WCAG22/
---

## What this makes possible

Design systems make repeated interface decisions explicit and reusable: design tokens, typography, color roles, spacing, components, interaction states, accessibility behavior, and guidance for when a pattern should not be used.

## A common approach

Start from the product’s recurring decisions rather than drawing a large component catalog. Define semantic tokens, establish a small set of primitives, document states and composition rules, and keep the design source aligned with the implemented components. [shadcn/ui](/wiki/shadcn-ui) is one code-owned component route for React projects; it does not remove the need for product-specific design decisions.

## Use this when

Use this method when several pages or products need to feel coherent, or when repeated visual changes would otherwise be copied inconsistently across screens.

## Consider another route when

For a one-screen disposable experiment, a full system may cost more than it saves. Do not create abstractions before repeated behavior is understood, and do not confuse a component library with a complete design system.

## Important decisions

Decide who owns tokens and components, how design and code revisions are matched, which states are mandatory, how accessibility is tested, and how exceptions are recorded. Keep content, layout, behavior, and brand expression distinct enough to evolve independently.

## How to verify

Exercise the system through representative pages and edge states, not only isolated component snapshots. Confirm token changes propagate intentionally, keyboard and contrast behavior remain valid, and the documented composition rules match the shipped implementation.
