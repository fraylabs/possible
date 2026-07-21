# Recorded `/goal` control

This is a preserved comparison run, not a claim that plain Codex is incapable. The control produced useful work. The question is what operational knowledge a non-expert's rough request caused the agent to include.

## Protocol

- Model: `gpt-5.6-sol`
- Codex task: `019f86da-0b60-7fb0-a6d3-5617c0aac144`
- Empty Git repository with no `AGENTS.md`
- Fresh `CODEX_HOME`
- No Possible skill, Robot Prototype Outcome Pack, robotics skill, CAD skill, or MuJoCo skill
- Recorded snapshot: 21 minutes 26 seconds after the first prompt
- Evaluation contract: the Robot Prototype pack contract that existed before this control run

## Complete human input

```text
/goal I want to make a robot snake
```

Codex asked whether to begin with hardware, simulation, or visualization; for a budget; and whether a 3D printer was available. The only reply was:

```text
Simulation first. I do not have a fixed budget or access to a 3D printer.
```

No deliverables, acceptance checks, robotics vocabulary, implementation stack, or verification criteria were supplied.

## What the control produced

The control was not a straw man. It produced a browser-based kinematic simulator, manual and procedural gait controls, collision handling, telemetry export, a hardware estimator, a bill of materials, wiring and validation guides, compiled ESP32 firmware, and 18 passing tests.

## Contract comparison

| Pre-existing Robot Prototype requirement | `/goal` control | `$possible` run |
| --- | --- | --- |
| Inspectable mechanical CAD | Not produced | STEP and GLB |
| Standard robot description | Not produced | URDF and SRDF |
| Rigid-body simulation | Empirical browser model | MuJoCo scenarios |
| Autonomous obstacle avoidance proof | Not produced | Seeded avoidance; 2.94 m; zero contact steps |
| Inspectable engineering telemetry | Browser CSV export | 3,801-frame Rerun recording |
| Deterministic checks | 18 tests | 12 tests and 186 interface checks |
| Fresh independent verification | Not recorded | Three defects found, repaired, and rerun |
| Sim-to-real boundaries | Hardware planning and bench guide | Explicit evidence boundary and gap register |

## Result

`/goal` turned the idea into a capable simulator and firmware handoff. Possible turned the same level of non-expert intent into the multidisciplinary digital-prototype contract it already knew to pursue: geometry, robot descriptions, physics, autonomy, telemetry, integration checks, and independent verification.

The comparison tests transferred operational judgment, not whether Codex can write code.
