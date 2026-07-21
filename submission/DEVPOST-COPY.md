# Possible — Devpost copy

## One-line description

Possible turns a rough idea into an independently verified, multidisciplinary outcome through reusable Outcome Packs for Codex.

## Project summary

**AI made execution accessible. Possible makes operational judgment accessible.**

The [Robot Snake run](https://github.com/fraylabs/possible/blob/main/apps/web/public/demo/robot-snake/evidence/outcome-receipt.md) began with: “I want to make a robot snake.” Possible produced inspectable CAD, URDF/SRDF, MuJoCo control and simulation, simulated autonomous obstacle avoidance, and Rerun telemetry. Fresh verification caught and repaired three material defects before the suite passed 12/12 tests and 186/186 interface checks.

We repeated the rough idea in a clean GPT-5.6 Sol `/goal` task with no Possible or robotics skills. It produced a capable browser simulator, hardware plan, compiled firmware, and 18 tests. It did not infer CAD, URDF/SRDF, MuJoCo, autonomy proof, Rerun evidence, or fresh verification. The [preserved comparison](https://possible.sh/demo/robot-snake/CONTROL-RUN.md) credits both results and evaluates them against the Robot Prototype contract that existed before the control run.

Possible.sh is an open-source library of Outcome Packs. Each pack combines a reusable execution prompt and selected agent skills for dozens of coordinated tasks.

## Inspiration

AI agents can execute specialized tasks. Most people still do not know every discipline, dependency, safeguard, or quality check their ambition requires.

Possible supplies that missing operational knowledge.

## What it does

The user enters `$possible` and describes an ambition. Possible clarifies the outcome, recommends an Outcome Pack, explains its boundaries, and requests approval.

After approval, the pack coordinates its workstreams, agent skills, dependencies, safeguards, and independent verification. The run remains incomplete until its completion checks pass.

Four public Outcome Packs show the range:

- **Still / Hardware Launch:** website, product film, prototype CAD, and repair evidence.
- **Robot Snake / Robot Prototype:** CAD, robot descriptions, simulation, control, telemetry, and verification.
- **Fold / Playable Web Game:** a live Three.js game for pointer, touch, and keyboard input.
- **Possible / Web Presentation:** a responsive coded deck that explains the product visually.

## How we built it

Each Outcome Pack is a typed TypeScript manifest. A deterministic compiler turns it into agent-skill install commands and an execution prompt. The installed Codex skill manages intake, approval, state, workstream coordination, integration, and verification.

The project includes a Next.js site, an npm installer, four public Outcome Packs, and preserved run evidence. Codex using GPT-5.6 implemented, tested, reviewed, and documented the system under human product direction.

## Challenges we ran into

Possible began as a broad skill library. We reduced it to one interaction: describe an outcome, approve a pack, execute the work, and verify completion.

Verification exposed real integration failures. The Still reviewer found four broken asset responses after its artifacts existed. Robot Snake reviewers found unsafe stop behavior and velocity-limit defects. Both outcomes remained incomplete until the agent repaired the failures and reran the checks.

We also separated outcome approval from consequential actions. Deployment, publishing, spending, outreach, and fabrication require separate approval.

## Accomplishments that we're proud of

- Published `@fraylabs/possible@0.1.9` as a one-command, conflict-safe installer.
- Built four reusable Outcome Packs and four inspectable demos.
- Preserved verifier failures, repairs, passing reruns, and known limitations.
- Recorded a strong clean `/goal` control and published the complete human input, artifacts, and contract comparison.
- Coordinated hardware, robotics, games, and coded presentations through one workflow.

## What we learned

More agent output does not create a complete outcome. Strong outcomes require the right work, clear ownership, explicit boundaries, and credible verification.

The user should supply the ambition. Possible should supply the operational knowledge needed to pursue it.

`/goal` sustains pursuit. Possible supplies the reviewed outcome contract. Together, they combine persistence with operational judgment.

## What's next for Possible.sh

Next, we will test outside-authored Outcome Packs.

## Quickstart

```bash
npx @fraylabs/possible@0.1.9 init
```

Then open Codex and enter:

```text
$possible
```

## Built with

- Codex
- GPT-5.6
- TypeScript
- Next.js
- React
- Node.js
- npm
- Three.js
- MuJoCo
- Rerun
- build123d
- Vitest

## Try it out links

- **Live project:** https://possible.sh
- **Demo gallery:** https://possible.sh/demo
- **Install from npm:** https://www.npmjs.com/package/@fraylabs/possible
- **GitHub source:** https://github.com/fraylabs/possible
- **Demo video:** https://youtu.be/s35aGhVI2Eo

## Build Week evidence

- Track: Developer Tools
- Product-reset boundary: `afb5fc1`
- Primary Codex task/session ID: `019f7517-658f-7723-8686-2ecda930c00a`
- Demo video: https://youtu.be/s35aGhVI2Eo
- Provenance: https://github.com/fraylabs/possible/blob/main/BUILD-WEEK.md
