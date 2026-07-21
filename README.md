# Possible

Possible gives Codex the workstreams, safeguards and verification needed to complete ambitious outcomes involving dozens of coordinated tasks.

People often know what they want without knowing every task, decision or quality check it requires. `$possible` turns that rough request into an approved Outcome Pack, coordinates the work and verifies the result.

**Agent skills perform tasks. Outcome Packs coordinate the outcome.**

## Judge Quickstart

Requirements: Codex with project skills enabled, Node.js 22 or newer, npm and a disposable project.

From that project:

```bash
npx @fraylabs/possible@0.1.8 init
```

Open or reload the project in Codex, then enter:

```text
$possible
Create a web presentation that explains this project to a technical audience.
```

Possible will:

1. clarify the desired result;
2. recommend the Web Presentation Outcome Pack;
3. describe its outputs and approval boundaries;
4. wait for an explicit yes;
5. compile the workstreams, agent skills and completion checks.

After approval, inspect `.possible/outcome-brief.md`, `.possible/pack.json`, `.possible/skills-lock.json` and the final completion report.

The installer is idempotent and refuses to overwrite conflicting skill files. Outcome approval permits disclosed repo-local work only. Deployment, publishing, spending, outreach, fabrication and other external actions require separate approval.

## Featured Outcome Packs

- [Hardware Launch](packages/packs/src/hardware-launch.ts) — product story, site, film, prototype CAD and independent review.
- [Robot Prototype](packages/packs/src/robot-prototype.ts) — mechanical model, robot descriptions, control, simulation and sim-to-real boundaries.
- [Playable Web Game](packages/packs/src/playable-web-game.ts) — a polished browser game with responsive controls and playability review.
- [Web Presentation](packages/packs/src/web-presentation.ts) — an evidence-backed coded deck with responsive presenter behavior.

The user does not choose a pack. `$possible` recommends one after understanding the outcome.

## Inspect the evidence

- [Still / Hardware Launch](apps/web/public/demo/still/OUTCOME-RECEIPT.md) preserves the failed asset-path review, repair and passing rerun.
- [Robot Snake / Robot Prototype](apps/web/public/demo/robot-snake/evidence/outcome-receipt.md) preserves the simulation contract, fresh-review defects, repairs and remaining physical gaps.
- [Fold / Playable Web Game](apps/web/public/demo/fold/verification.md) links the playable build to its review evidence.
- [Possible / Web Presentation](apps/web/public/presentation/possible.html) is the coded browser deck itself.

The public gallery is available at [possible.sh/demo](https://possible.sh/demo).

## How it works

An Outcome Pack is a [typed manifest](packages/packs/src/types.ts). The [compiler](packages/packs/src/compiler.ts) turns it into install commands and a reusable execution prompt. The manifest names:

- required outputs;
- independent workstreams and ownership;
- reviewed agent skills;
- approval gates;
- verification and the definition of done.

The run records the confirmed brief and exact pack snapshot. A fresh verifier checks the integrated result, preserves failures and requires repair before completion.

## Built During Build Week

Commit [`afb5fc1`](https://github.com/fraylabs/possible/commit/afb5fc1c1e01d746753712ddc79f456df0984826) marks the product reset that introduced the current Outcome Pack architecture. The repository history after that boundary records the typed manifests, compiler, installable skill, CLI, public site, preserved runs and verification repairs.

[BUILD-WEEK.md](BUILD-WEEK.md) documents the before-and-after boundary, Codex contributions, human product decisions, required session evidence and `/feedback` submission information. The submission owner must confirm the official event time range and GPT-5.6 session record from the Build Week account.

## Repository

- `packages/packs` — typed manifests and compiler
- `apps/cli` — the published installer
- `apps/web` — website, documentation and demo evidence
- `skills/possible` — the conversational Codex workflow

## Verify

```bash
npm install
npm run check
```

The build publishes the four featured pack specifications and their compiled JSON and text contracts.

## Supported surface

Possible is currently delivered and verified as a Codex project skill. The recorded runs were performed on macOS. The Node package is cross-platform; Windows has not been independently verified in this repository.
