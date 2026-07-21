# Possible — Devpost copy

## One-line description

Possible gives Codex the workstreams, safeguards and verification needed to complete ambitious outcomes involving dozens of coordinated tasks.

## Inspiration

AI made execution accessible. It did not make expertise accessible.

A person can ask Codex to launch hardware, prototype a robot or build a game. But they may not know every discipline, dependency, safeguard or quality check the outcome requires. The human still has to discover and coordinate the work.

Possible supplies that missing operational knowledge.

## What it does

The user starts with `$possible` and describes an ambition in ordinary language. Possible clarifies the intended result, recommends one Outcome Pack and waits for approval.

After approval, the pack compiles into:

- owned workstreams;
- reviewed agent skills;
- dependency order;
- approval gates;
- required outputs;
- independent verification and a definition of done.

Skills perform tasks. Possible coordinates the outcome.

## Featured outcomes

- **Still / Hardware Launch:** website, product film, prototype CAD and preserved repair evidence.
- **Robot Snake / Robot Prototype:** STEP assembly, URDF/SRDF, MuJoCo scenarios, Rerun recording, control checks and sim-to-real boundaries.
- **Fold / Playable Web Game:** a live Three.js game with pointer, touch and keyboard input.
- **Possible / Web Presentation:** a responsive coded deck that explains the product visually.

Each demo exposes its output, `$possible` conversation, verification evidence and limitations on the same page.

## How we built it

Outcome Packs are TypeScript manifests. A deterministic compiler turns each manifest into agent-skill install commands and a reusable execution prompt. The installed Codex skill handles intake, approval, state, workstream coordination, integration and verification.

The repository includes a Next.js website, a published npm installer and preserved run artifacts. GPT-5.6 in Codex implemented and reviewed the product under human product direction.

## Verification moment

The Still run did not stop when the website, film and CAD existed. A fresh reviewer found four broken asset responses in the embedded site. The run remained incomplete, the paths were repaired and the reviewer reran the checks successfully. Both the failed trace and passing rerun remain public.

The Robot Snake verifier similarly found material safe-stop and velocity-limit defects. The controls were repaired and the fresh suite was rerun before completion.

## What we learned

More agent output is not the goal. A useful outcome needs the right work, clear ownership, explicit boundaries and evidence strong enough to say what passed and what remains unproven.

## Install

```bash
npx @fraylabs/possible@0.1.8 init
```

Then open Codex and enter:

```text
$possible
```

## Links

- Website: https://possible.sh
- Demos: https://possible.sh/demo
- Documentation: https://possible.sh/docs
- GitHub: https://github.com/fraylabs/possible

## Build Week evidence

- Product-reset boundary: `afb5fc1`
- Eligible commit range: `[FIRST ELIGIBLE COMMIT]..[FINAL SUBMISSION COMMIT]`
- Primary Codex `/feedback` session ID: `[ADD THE CORE GPT-5.6 BUILD SESSION]`
- Demo video: `[ADD VIDEO URL]`

See `BUILD-WEEK.md` for the repository-observed before-and-after boundary and the facts that require owner confirmation.
