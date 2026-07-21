# Possible — Devpost copy

## One-line description

Possible.sh is an open-source library of Outcome Packs. Each pack combines a reusable execution prompt and selected agent skills for dozens of coordinated tasks.

## Inspiration

AI made execution accessible. It did not make expertise accessible.

Someone can ask Codex to launch hardware, prototype a robot, or build a game without knowing every discipline, dependency, safeguard, or quality check the outcome requires. The human still has to discover and coordinate that work.

Possible supplies the missing operational knowledge.

## What it does

The user starts with `$possible` and describes an ambition in ordinary language. Possible clarifies the result, recommends an Outcome Pack, explains its boundaries, and waits for approval.

After approval, the pack compiles into owned workstreams, reviewed agent skills, dependency order, safeguards, required outputs, and independent verification.

Skills perform tasks. Possible coordinates the outcome.

The four featured outcomes are:

- **Still / Hardware Launch:** website, product film, prototype CAD, and repair evidence.
- **Robot Snake / Robot Prototype:** STEP assembly, robot descriptions, MuJoCo simulation, Rerun recording, control checks, and sim-to-real boundaries.
- **Fold / Playable Web Game:** a live Three.js game with pointer, touch, and keyboard input.
- **Possible / Web Presentation:** a responsive coded deck that explains the product visually.

## How we built it

Outcome Packs are typed TypeScript manifests. A deterministic compiler turns each manifest into agent-skill install commands and a reusable execution prompt. The installed Codex skill handles intake, approval, state, workstream coordination, integration, and verification.

The project includes a Next.js website, a published npm installer, four Outcome Packs, and preserved run evidence. Codex using GPT-5.6 implemented, tested, reviewed, and documented the system under human product direction.

## Challenges we ran into

The hardest problem was product scope. Possible began as a broad skill library before we reduced it to one clear interaction: describe an outcome, approve the recommended pack, execute the workstreams, and verify the result.

Verification also exposed real integration failures. The Still reviewer found four broken asset responses after the website, film, and CAD already existed. Robot Snake reviewers found unsafe stop behavior and velocity-limit defects. Possible kept both outcomes incomplete until the failures were repaired and the checks passed again.

We also had to keep external actions explicit. Approval of an outcome permits disclosed repository-local work; deployment, publishing, spending, outreach, and fabrication still require separate approval.

## Accomplishments that we're proud of

- Published `@fraylabs/possible@0.1.8` as a one-command, conflict-safe installer.
- Built four reusable Outcome Packs and four inspectable demos.
- Preserved failed verifier results, repairs, passing reruns, and remaining limitations.
- Combined software, hardware CAD, robotics simulation, a playable game, and a coded presentation through one consistent workflow.
- Kept manifests, compiled prompts, safeguards, tests, and evidence open source.

## What we learned

More agent output is not the goal. A useful outcome needs the right work, clear ownership, explicit boundaries, and evidence strong enough to distinguish what passed from what remains unproven.

Models already know how to perform many individual tasks. The missing layer is operational knowledge: what work belongs in the outcome, how it should be coordinated, where approval is required, and how completion should be verified.

## What's next for Possible.sh

We want to make Outcome Packs easier to author, validate, and evaluate. The next step is testing whether people without specialist experience can produce stronger outcomes with Possible than with an unstructured prompt, while preserving clear safety gates and inspectable evidence.

## Quickstart

```bash
npx @fraylabs/possible@0.1.8 init
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
