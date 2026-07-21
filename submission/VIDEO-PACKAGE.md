# Possible — three-minute demo

## 0:00–0:15 — The gap

> AI can perform almost any individual task. But most people do not know every task, safeguard or quality check a complete outcome requires.

Show a blank Codex project and the request: “I want to make a robot snake.”

## 0:15–0:30 — The product

> Possible gives Codex the workstreams, safeguards and verification needed to complete ambitious outcomes involving dozens of coordinated tasks.

Show:

```bash
npx @fraylabs/possible@0.1.8 init
```

Then type `$possible`.

## 0:30–1:05 — Describe and approve

Show the short Robot Snake intake. The user describes behavior, not CAD, URDF, MuJoCo, control architecture or tests.

Show the recommendation and approval boundary.

> Possible recommends the Robot Prototype Outcome Pack. The user approves the outcome before repo-local work begins. External actions remain separately gated.

## 1:05–1:30 — Compile and execute

Briefly show the compiled manifest:

```text
Intent
→ workstreams and owners
→ reviewed agent skills
→ dependencies and gates
→ definition of done
→ independent verification
```

Show the generated CAD, robot descriptions, simulation, controller and Rerun viewer.

## 1:30–2:00 — Verification and repair

Show the Robot Snake completion report.

> The first output was not accepted. A fresh verifier found an unlatching safe stop, unsafe stop targets and a hidden velocity-limit overshoot. Possible kept the outcome incomplete, repaired the defects and reran the suite.

Show the passing rerun and the explicit sim-to-real boundary.

## 2:00–2:35 — Four outcomes

Move through the public demo gallery:

- Still: site, film, CAD and asset-path repair evidence.
- Robot Snake: CAD, MuJoCo, Rerun and control repairs.
- Fold: a live playable Three.js game.
- Web Presentation: the coded deck used to explain Possible.

> One rough request can become a complete, inspectable outcome because the operational knowledge already exists in the Outcome Pack.

## 2:35–3:00 — Close

Show GitHub, tests and the install command.

> Agent skills perform tasks. Possible coordinates the outcome. Stop discovering every prompt yourself. Start with what you want to make possible.

End card:

```text
possible.sh
npx @fraylabs/possible@0.1.8 init
github.com/fraylabs/possible
```

## Recording checklist

- Keep the final video below three minutes.
- Show GPT-5.6 and Codex in the recorded task.
- Show the actual `$possible` conversation and generated artifacts.
- Show at least one failed verifier result, repair and passing rerun.
- Add the final YouTube URL and `/feedback` session ID to the submission.
