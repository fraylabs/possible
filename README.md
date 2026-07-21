# Possible

**AI made execution accessible. Possible makes operational judgment accessible.**

The [Robot Snake run](apps/web/public/demo/robot-snake/evidence/outcome-receipt.md) began with one rough idea: “I want to make a robot snake.” Possible supplied the missing robotics work and coordinated it as one outcome.

The run produced CAD, URDF/SRDF, MuJoCo control, obstacle avoidance, and Rerun telemetry. Fresh verification caught and repaired three defects. The final suite passed 12/12 tests and 186/186 interface checks.

A clean `/goal` control given the same rough idea produced a capable browser simulator, hardware plan, compiled firmware, and 18 tests. It did not infer the pack's CAD, robot descriptions, MuJoCo physics, autonomy proof, Rerun evidence, or fresh verification. [Inspect the preserved comparison](apps/web/public/demo/robot-snake/CONTROL-RUN.md).

`/goal` sustains dynamic pursuit. Possible supplies the reviewed outcome contract. They work together: persistence toward a stronger definition of done.

Possible.sh is an open-source library of Outcome Packs for Codex. An Outcome Pack combines an execution prompt, agent skills, sequencing, safeguards, and completion checks. The `$possible` skill understands the request, recommends a pack, asks for approval, and runs it.

## OpenAI Build Week

Possible is a Developer Tools submission built with Codex using GPT-5.6.

[Watch the demo](https://youtu.be/s35aGhVI2Eo) · [Explore the evidence](https://possible.sh/judging) · [Read the Build Week record](BUILD-WEEK.md)

## Judge Quickstart

Requirements: Codex with project skills enabled, Node.js 22 or newer, npm and a disposable project.

From that project:

```bash
npx @fraylabs/possible@0.1.9 init
```

Open or reload the project in Codex, then enter:

```text
$possible
Create a web presentation that explains this project to a technical audience.
```

Possible then:

1. clarifies the outcome;
2. recommends the Web Presentation Outcome Pack;
3. explains the work and approval boundaries;
4. waits for an explicit yes;
5. runs the approved work and completion checks.

After approval, inspect `.possible/outcome-brief.md`, `.possible/pack.json`, `.possible/skills-lock.json` and the final completion report.

The installer is idempotent and refuses to overwrite conflicting skill files. Outcome approval permits disclosed repo-local work only. Deployment, publishing, spending, outreach, fabrication and other external actions require separate approval.

## Four outcomes

- [Hardware Launch](packages/packs/src/hardware-launch.ts) — product story, site, film, prototype CAD and independent review.
- [Robot Prototype](packages/packs/src/robot-prototype.ts) — mechanical model, robot descriptions, control, simulation and sim-to-real boundaries.
- [Playable Web Game](packages/packs/src/playable-web-game.ts) — a polished browser game with responsive controls and playability review.
- [Web Presentation](packages/packs/src/web-presentation.ts) — an evidence-backed coded deck with responsive presenter behavior.

You do not need to choose a pack. `$possible` recommends one after understanding your outcome.

## See the evidence

- [Still / Hardware Launch](apps/web/public/demo/still/OUTCOME-RECEIPT.md) preserves the failed asset-path review, repair and passing rerun.
- [Robot Snake / Robot Prototype](apps/web/public/demo/robot-snake/evidence/outcome-receipt.md) preserves the simulation contract, fresh-review defects, repairs and remaining physical gaps.
- [Fold / Playable Web Game](apps/web/public/demo/fold/verification.md) links the playable build to its review evidence.
- [Possible / Web Presentation](apps/web/public/presentation/possible.html) is the coded browser deck itself.

The public gallery is available at [possible.sh/demo](https://possible.sh/demo).

## How Possible works

Each Outcome Pack has a [typed manifest](packages/packs/src/types.ts). The [compiler](packages/packs/src/compiler.ts) prepares the prompt, skills, workstreams, and checks. The manifest defines:

- required outputs;
- independent workstreams and ownership;
- reviewed agent skills;
- approval gates;
- verification and the definition of done.

Each run records the approved brief and exact pack version. A fresh verifier preserves failures and requires repair before completion.

## Built During Build Week

Commit [`afb5fc1`](https://github.com/fraylabs/possible/commit/afb5fc1c1e01d746753712ddc79f456df0984826) marks the product reset that introduced the current Outcome Pack architecture. The repository history after that boundary records the typed manifests, compiler, installable skill, CLI, public site, preserved runs and verification repairs.

[BUILD-WEEK.md](BUILD-WEEK.md) documents the implementation boundary, Codex session, Codex contributions and human product decisions.

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
