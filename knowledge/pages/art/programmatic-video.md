---
slug: programmatic-video
title: Programmatic video
summary: A reproducible video workflow where scenes, timing, assets, and variations are represented as code or structured data before rendering.
tags: [art, video, motion, rendering, automation]
kind: outcome
reviewedAt: 2026-07-18
sources:
  - title: Remotion
    url: https://www.remotion.dev/
  - title: FFmpeg documentation
    url: https://ffmpeg.org/documentation.html
---

## What this makes possible

Programmatic video can produce repeatable videos, animations, captions, visualizations, and personalized variants from a shared scene definition and structured inputs.

## A common approach

Define the story, frame rate, dimensions, duration, audio behavior, asset rights, and output formats. Model scenes and timing as data or components, preview representative frames, then render the exact approved revision. [Remotion](/wiki/remotion) is one React-based route; FFmpeg can handle media transformation and encoding tasks around the render pipeline.

## Use this when

Use this outcome when many videos share a visual grammar, when data changes the rendered result, or when deterministic revision and batch rendering matter.

## Consider another route when

Use [Presentations](/wiki/presentations) for a presenter-controlled sequence of slides. Use a conventional timeline editor when an artist needs direct, frame-level manipulation of a small number of one-off pieces and code would slow the work.

## Important decisions

Record the composition inputs, frame rate, dimensions, timing model, fonts, audio licenses, image and footage sources, render environment, and output codec. Separate preview rendering from final rendering and do not assume a successful render proves visual or audio correctness.

## How to verify

Render the approved revision, inspect the beginning, middle, transitions, captions, and end at full resolution, listen through the audio, confirm duration and frame rate, and validate playback in each required delivery environment. Preserve the render inputs and output checksum when reproducibility matters.
