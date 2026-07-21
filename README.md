# Possible

**AI made execution accessible. Possible makes operational judgment accessible.**

Possible turns one rough idea into a coordinated, independently verified, multidisciplinary outcome. The [Robot Snake run](apps/web/public/demo/robot-snake/evidence/outcome-receipt.md) began with, “I want to make a robot snake.” It produced inspectable CAD, URDF/SRDF, MuJoCo control and simulation, simulated autonomous obstacle avoidance, and Rerun telemetry. Fresh verification caught three material defects; after repair, the independent suite passed 12/12 tests and 186/186 interface checks.

Possible.sh is an open-source library of Outcome Packs for Codex. Each typed specification coordinates selected agent skills, owned workstreams, shared constraints, approval boundaries, and the evidence required for completion. The same system produced a hardware launch with a site, film, and CAD; a playable Three.js game; and a browser-tested coded presentation.

We believe Outcome Packs can become an open standard for turning human ambition into complete, accountable, and verifiable agent outcomes.

## OpenAI Build Week Judging

Possible is a Developer Tools submission built with Codex using GPT-5.6. [Read the complete judging evidence](JUDGING.md), [inspect the Build Week record](BUILD-WEEK.md), [open the public evidence funnel](https://possible.sh/judging), or [watch the demo](https://youtu.be/s35aGhVI2Eo).

| Official criterion | Claim | Implementation fact | Evidence |
| --- | --- | --- | --- |
| Technological Implementation | Possible compiles outcomes instead of returning a static prompt. | Typed manifests become skill installs, owned workstreams, approval gates, verification and completion reporting. | [Compiler source](packages/packs/src/compiler.ts) |
| Design | Complete outcomes remain inspectable instead of disappearing into agent logs. | The Still demo presents the generated site, film, CAD, receipts and review evidence together. | [Live Still demo](https://possible.sh/demo/hardware) |
| Potential Impact | A rough ambition can become coordinated specialist work without requiring every task from the user. | The Still run expands one hardware brief into site, film, CAD and independent-review workstreams. | [Still run](apps/web/public/demo/still/CODEX-THREAD.md) |
| Quality of the Idea | Outcome Packs are a distinct layer above prompts, skills and agents. | The Hardware Launch manifest binds reviewed skills to workstreams, outputs, safeguards and fresh verification. | [Hardware Launch manifest](packages/packs/src/hardware-launch.ts) |

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

[BUILD-WEEK.md](BUILD-WEEK.md) documents the official submission window, exact implementation range, Codex session, Codex contributions and human product decisions.

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
