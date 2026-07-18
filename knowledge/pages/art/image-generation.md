---
slug: image-generation
title: Image generation
summary: A controlled workflow for creating or editing raster images from text and reference inputs while preserving review, provenance, and output constraints.
tags: [art, image, generation, editing, raster]
kind: method
reviewedAt: 2026-07-18
sources:
  - title: OpenAI image generation guide
    url: https://platform.openai.com/docs/guides/images
  - title: OpenAI image generation API reference
    url: https://platform.openai.com/docs/api-reference/images
---

## What this makes possible

Image generation can produce or edit raster assets from a written brief and, where supported, reference images. It is useful for concept exploration, illustrations, campaign variants, storyboards, textures, and interface or product visual studies.

## A common approach

Define the subject, composition, aspect ratio, visual language, exclusions, reference inputs, and intended use before generating. Create a small set of deliberate variants, select against the brief, then edit or regenerate only the failing parts. Keep the prompt, references, model or service, output settings, selected result, and human approval with the asset.

Use an image-generation API or application that supports the required generation and editing operations. The [OpenAI image API](https://platform.openai.com/docs/guides/images) is one documented implementation route; it is not a universal answer for every style, privacy, latency, or cost constraint.

## Use this when

Use this method when a raster image is the desired artifact and variation or reference-guided editing is more valuable than manually drawing every pixel.

## Consider another route when

Use a vector or parametric design workflow when the asset needs exact geometry, reusable constraints, or reliable text. Use [Programmatic video](/wiki/programmatic-video) when timing and animation are core requirements. Do not use generated imagery as a substitute for factual diagrams, technical drawings, or unreviewed product claims.

## Important decisions

Decide whether references contain private or restricted material, whether the service terms fit the intended use, how much variation is acceptable, and which details require deterministic editing. Small text, logos, hands, repeated patterns, and exact product geometry need explicit inspection rather than assumed correctness.

## How to verify

Inspect the selected image at its delivery size, compare it with the brief and references, check text and structural details, confirm the output format and dimensions, and record the generation inputs plus any edits. Treat provenance, rights, and factual accuracy as separate review questions.
