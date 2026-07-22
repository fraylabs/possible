---
name: PatchProof
description: Continuous-form evidence records for an inspectable developer tool.
colors:
  paper: "#edf1ff"
  carbon: "#291763"
  carbon-muted: "#5d46a2"
  perforation: "#aa9ad9"
  signal: "#ff4d6d"
  backing: "#1b1237"
  success: "#196c53"
  caution: "#8b5600"
typography:
  display:
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
    fontSize: "clamp(3.5rem, 7vw, 6rem)"
    fontWeight: 900
    lineHeight: 0.88
    letterSpacing: "-0.035em"
  body:
    fontFamily: "Avenir Next, Trebuchet MS, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
    fontSize: "0.75rem"
    fontWeight: 800
    lineHeight: 1.3
    letterSpacing: "0.08em"
rounded:
  control: "2px"
spacing:
  unit: "8px"
  section: "96px"
components:
  button-primary:
    backgroundColor: "{colors.carbon}"
    textColor: "{colors.paper}"
    rounded: "{rounded.control}"
    padding: "14px 18px"
  button-secondary:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.carbon}"
    rounded: "{rounded.control}"
    padding: "14px 18px"
---

# Design System: PatchProof

## Overview

**Creative North Star: "The Continuous Evidence Record"**

PatchProof looks like a terminal run made physical: cold continuous-form paper, violet carbon ink, perforated edges, line-feed rhythm, and receipt-like rules. The system makes evidence preservation tangible without turning the product into retro decoration. Its memorable element is the fanfold record that carries one truthful claim-to-evidence trail through every surface.

**Key Characteristics:**

- Cold paper and carbon ink rather than generic dark developer chrome.
- Dense evidence where inspection matters, generous air where decisions happen.
- One line-feed motion that can disappear without losing meaning.
- Status always uses a word as well as color.

## Colors

Paper and carbon dominate. Signal red appears only where the “done” claim or a material boundary needs attention.

**The Carbon Record Rule.** Paper and carbon own at least four-fifths of every surface; signal color is rare enough to remain evidence.

## Typography

**Display Font:** system monospace stack  
**Body Font:** Avenir Next with Trebuchet MS fallback  
**Label/Mono Font:** system monospace stack

Display type evokes line-printer output; body copy switches to a plain sans so explanations remain easy to read. Code, commands, state words, and measurements stay monospaced.

**The Evidence-Only Mono Rule.** Monospace belongs to records, commands, state, and the product thesis—not long explanatory paragraphs.

## Layout

The primary surface is a centered fanfold sheet with perforated gutters. Sections alternate between full-width run strips and two-column claim/evidence comparisons. Desktop uses a 12-column reading field; below 800px, columns stack and gutters tighten without horizontal overflow. Body text stays within 70 characters.

## Elevation & Depth

One hard offset shadow separates the paper from its dark backing. Interior surfaces are flat and differentiated by rules or paper tone; nested shadows are not used.

**The Single Sheet Rule.** Elevation describes the entire record, never individual marketing cards.

## Shapes

Controls and fields use restrained 2px corners. Tractor-feed perforations, dashed tear lines, and rectangular run strips supply the form language. Pills and decorative rounded cards do not belong.

## Components

### Buttons

- **Shape:** nearly square controls (2px radius).
- **Primary:** carbon background, paper text, compact monospace label.
- **Hover / Focus:** signal-red underline or a high-contrast three-pixel focus outline; never color alone.
- **Secondary:** paper surface with a two-pixel carbon outline.

### Record rows

Claim and evidence rows use key/value alignment, dotted separators, and a written status at the far edge. Status words remain visible in grayscale.

### Navigation

Brand, local-only context, and the primary action share one tear-line header. Mobile removes the context label before reducing the brand or action.

## Do's and Don'ts

### Do:

- **Do** keep factual evidence and limitations visible in the same reading flow.
- **Do** let perforations, rules, and line feed encode the idea of a preserved record.
- **Do** preserve keyboard focus, reduced motion, and written status labels.

### Don't:

- **Don't** introduce stock developer gradients, glass panels, or neon glows.
- **Don't** turn every section into a separate card.
- **Don't** use the receipt metaphor to imply code correctness or external approval.
