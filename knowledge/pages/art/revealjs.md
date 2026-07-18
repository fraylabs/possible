---
slug: revealjs
title: reveal.js
summary: An open web-based presentation framework for authoring interactive slide decks with HTML, Markdown, CSS, and JavaScript.
tags: [art, presentations, web, javascript, slides]
kind: method
reviewedAt: 2026-07-18
sources:
  - title: reveal.js
    url: https://revealjs.com/
  - title: reveal.js markup
    url: https://revealjs.com/markup/
  - title: reveal.js PDF export
    url: https://revealjs.com/pdf-export/
---

reveal.js is an open-source HTML presentation framework. Slides are expressed with web technologies, so CSS, JavaScript, Markdown, embedded content, speaker notes, and interactive behavior can all be part of the deck.

## What this makes possible

reveal.js can produce browser-delivered presentations with nested slides, Markdown support, custom styling, code highlighting, speaker notes, and PDF export. It is a route for teams that want a deck to remain inspectable and programmable rather than locked inside a desktop editor.

## A common approach

Create a minimal slide structure, establish the theme and layout rules, then add the narrative and interactive elements. Keep content and visual tokens separate from framework initialization. Test the live presentation and the PDF export as separate artifacts; a browser presentation can behave correctly while its print layout fails.

Use [Presentations](/wiki/presentations) to define the communication outcome before choosing reveal.js. Use [Website design](/wiki/website-design) when the work is becoming a general interactive website rather than a slide sequence.

## Use this when

Use reveal.js when web-native styling, source control, embedded demos, custom JavaScript, or a repeatable build is more important than office-suite interoperability.

## Consider another route when

Choose an office-native format when collaborators must edit through a standard presentation suite or when its review and export workflow is a hard requirement. Choose [Remotion](/wiki/remotion) when the final artifact is a rendered video rather than a navigable deck.

## Important decisions

Decide whether the deliverable is a live URL, PDF, or both; how fonts and media are packaged; whether external content is allowed; how the deck behaves offline; and which controls the presenter needs. Keep a static fallback for critical claims and media.

## How to verify

Run the deck in the intended browser and presentation environment, exercise keyboard navigation and speaker notes, check embedded media and external links, and export the final PDF. Review both artifacts for legibility, clipping, citations, and correct slide order.
