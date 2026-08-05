# Robot Snake Digital Prototype — Outcome Receipt

Date: 2026-07-21  
Pack: Possible / Robot Prototype  
Outcome: **PASS for the confirmed digital-prototype scope**

The repository now contains a coherent ten-link robot-snake concept, generated mechanical and robot-description artifacts, deterministic MuJoCo locomotion and obstacle-avoidance scenarios, bounded controls, inspectable evidence, and a gated path toward later fabrication. It is not a physically validated or fabrication-ready robot.

## Artifact inventory

| Area | Primary artifacts |
| --- | --- |
| Durable outcome state | `.possible/outcome-brief.md`, `.possible/pack.json`, `.possible/skills-lock.json` |
| Architecture and interfaces | `robot/architecture/`, `robot/interfaces/model_spec.json`, HAL/FSM/ROS 2 contracts |
| Mechanical concept | `robot/mechanical/robot_snake.py`, `.step`, `.glb`, four-view snapshot packet |
| Component evidence | Exact checksum-verified ST3215 catalog STEP, component ledger, provisional BOM |
| Robot description | Generated `robot/description/robot_snake.urdf` and design ledger |
| Planning semantics | Generated `robot/planning/robot_snake.srdf` and planning ledger |
| Control | Traveling-wave gait, latched range-data safe stop, sensor-derived detour and route rejoin |
| Simulation | Generated locomotion and obstacle-course MJCF scenes, fixed-seed runner, model manifest |
| Rollout evidence | GIF, final PNG, six-frame contact sheet, metrics JSON, CSV, and NPZ for each scenario |
| Hardware path | `robot/FABRICATION-ROADMAP.md`, `robot/simulation/SIM-TO-REAL-GAPS.md` |
| Reproduction | `README.md`, `pyproject.toml`, `uv.lock`, deterministic tests |

## Pack and skill audit

- All ten reviewed skills were installed repo-locally using Skills CLI `1.5.19` and the exact commands saved in `.possible/pack.json`.
- Every installed skill directory matched its reviewed repository revision byte-for-byte. No local revision drift or instruction conflict was found.
- Reviewed revisions:
  - `fraylabs/possible`: `9adb697c211d2cebc07164554d7a9f859e7f763d`
  - `earthtojake/text-to-cad`: `fdbb4b4fb62d95ae298cfe9a46fdc7092bdaf423`
  - `arpitg1304/robotics-agent-skills`: `54f7b578f3dc269d29c0beb623b3f2611fd3a430`
- The reviewed CAD Viewer `0.3.9` source has an internal package inconsistency: its skill requires npm script `agent:start`, but its reviewed `package.json` contains only `start`/`serve`. The documented launcher therefore fails with `Missing script: "agent:start"`. The captain used the available `start` launcher for local viewing and recorded the inconsistency in `.possible/skills-lock.json`; this is not local source drift.

## Acceptance results

| Criterion | Result | Evidence |
| --- | --- | --- |
| 1. Regenerable parametric mechanical assembly and ledger | PASS | 10 links, 9 source-level +Z revolute relationships, component ledger and BOM |
| 2. STEP and lightweight review geometry | PASS | STEP: 411 faces, 795 edges, 945 × 55 × 35 mm; native GLB and snapshot packet |
| 3. URDF/SRDF consistency | PASS | Exact 10-link/9-joint inventory, limits, inertials, planning group and nine adjacency exclusions; 6 tests |
| 4. MuJoCo model loading | PASS | Both scenes completed 500 validator steps with zero errors and warnings |
| 5. Seeded locomotion | PASS | Traveling physical wave, 0.1525 m forward / 0.1781 m net displacement, limits respected |
| 6. Seeded autonomous avoidance | PASS | Range-triggered detour, zero contact steps, whole body cleared, route rejoined, no deadlock |
| 7. Repeatability | PASS | Each full seeded scenario runs twice in pytest and requires exact receipt equality |
| 8. Inspectability and instructions | PASS | CAD snapshots/viewer, GIFs, stills, contact sheets, metrics, trajectories, README commands |
| 9. Sim-to-real and fabrication path | PASS | Gap report, provisional BOM and five-gate fabrication roadmap |
| 10. Complete evidence receipt | PASS | This file records passed, repaired, skipped and unproven checks |

## Final production metrics

Both scenarios used MuJoCo `3.10.0`, NumPy `2.5.1`, seed `42`, a 0.002 s physics step, and a 50 Hz control loop. Hard position, velocity, and command extrema were observed on every physics step rather than inferred from the 20 Hz visualization trajectory.

### Locomotion — PASS

- Simulated duration: 12.0 s
- Forward progress: 0.1524548 m
- Net displacement: 0.1780670 m
- Maximum joint position: 0.6107225 rad against ±0.95 rad limits
- Maximum joint velocity: 3.6661986 rad/s against the 4.0 rad/s limit
- Maximum command: 0.55 rad
- Joint tracking RMSE: 0.1158718 rad
- Physical joint-wave RMS threshold, finite-state, stop-state and all limit checks: PASS

### Obstacle course — PASS

- Simulated duration: 190.0 s, long enough for the full 0.945 m body to clear and rejoin
- Forward progress: 2.9439448 m
- Maximum joint position: 0.5891115 rad
- Maximum joint velocity: 3.3782545 rad/s
- Maximum command: 0.5825469 rad
- Joint tracking RMSE: 0.1197172 rad
- Range avoidance triggered at 9.06 s; recover began at 102.40 s; normal slither resumed at 117.06 s
- Obstacle contact steps: 0
- Minimum pivot-to-obstacle-surface clearance: 0.1060864 m
- Final route cross-track error: 0.0819094 m
- Regression-estimated terminal route heading error: 0.1690383 rad
- Entire-body clearance, route rejoin, progress, finite-state and all limit checks: PASS

## Exact final verifier commands

```bash
python3 robot/interfaces/validate_interfaces.py

uv run --quiet --python 3.12 \
  --with-editable .agents/skills/cad/scripts/packages/cadpy \
  python .agents/skills/cad/scripts/step robot/mechanical/robot_snake.py \
  --glb robot_snake.glb --force

uv run --quiet --python 3.12 \
  --with-editable .agents/skills/cad/scripts/packages/cadpy \
  python robot/mechanical/verify.py

python3 .agents/skills/urdf/scripts/urdf \
  robot/description/gen_robot_snake.py -o robot/description/robot_snake.urdf
python3 .agents/skills/srdf/scripts/srdf \
  robot/planning/gen_robot_snake.py -o robot/planning/robot_snake.srdf
python3 robot/planning/verify_models.py

uv run python -m robot.simulation.generate_mjcf
uv run --with mujoco --with numpy python \
  .agents/skills/mujoco-robotics/scripts/validate_mujoco_model.py \
  robot/simulation/scenes/locomotion.xml --steps 500
uv run --with mujoco --with numpy python \
  .agents/skills/mujoco-robotics/scripts/validate_mujoco_model.py \
  robot/simulation/scenes/obstacle_course.xml --steps 500

uv run python -m robot.simulation.run_rollout locomotion
uv run python -m robot.simulation.run_rollout obstacle_course
uv run python -m robot.simulation.render_rollout robot/simulation/rollouts/locomotion
uv run python -m robot.simulation.render_rollout robot/simulation/rollouts/obstacle_course
uv run python -m pytest
```

Final captain suite: **12 passed in 45.06 s**.  
Fresh independent suite: **12 passed in 45.22 s**.

## Fresh-review findings repaired

The independent verification workstream owned no implementation files and found three material defects before sign-off:

1. `SAFE_STOP` resumed automatically after the next valid range sample. It is now latched until explicit reset, with a regression test.
2. Stop commands ramped targets toward neutral. They now freeze at validated measured/current joint positions, with a regression test that repeated stop calls cannot create motion targets.
3. A 20 Hz sampled velocity check could miss physics-step peaks. Per-step extrema exposed a real 4.058 rad/s overshoot; an explicit 85% command-rate margin reduced final peaks below the 4 rad/s hard limit.

After repair and regeneration, the fresh reviewer reported no remaining material defect in the confirmed digital scope.

## Visual review and live viewer

The captain visually reviewed the current CAD isometric snapshot plus both final rollout contact sheets. The fresh reviewer independently reviewed the CAD snapshots and rollout contact sheets.

The compatible local viewer fallback was probed successfully at HTTP 200 for:

- `mechanical/robot_snake.step`
- `mechanical/robot_snake.glb`
- `description/robot_snake.urdf`
- `planning/robot_snake.srdf`

The viewer is a convenience surface; geometry, XML and simulation acceptance do not depend on it.

## Skipped checks

- The CAD Viewer's documented `agent:start` launcher was skipped because it does not exist in the exact reviewed package. The available `start` launcher was used as a disclosed fallback.
- ROS 2, `colcon`, and MoveIt 2 runtime checks were skipped because those runtimes are unavailable locally. Their interfaces and planning semantics were checked statically.
- Physical testing, hardware commissioning, fabrication review and vendor availability checks were outside the confirmed digital scope.

## Unproven claims

Physical slithering, real obstacle avoidance, floor friction, actuator suitability, torque margin, speed, turning radius, power and battery endurance, thermal behavior, sensing reliability, structural strength, wear, manufacturability and functional safety remain unproven. The explicit aggregate propulsion/steering surrogate prevents transfer claims for simulated speed or maneuvering performance.

## External actions not taken

No parts were purchased; no money was spent; no component was fabricated or printed; no physical hardware was connected or commanded; no vendor or other person was contacted; and nothing was published, deployed, or distributed. Every such action remains behind the explicit approval gates in the outcome brief and fabrication roadmap.

## Key artifact hashes

```text
robot/mechanical/robot_snake.step
  5b3512ab55bf67c6532105e7a8e00a062d28e3c97be8b4a12dc52eb12fa67c0d
robot/mechanical/robot_snake.glb
  23877bcbca50d7d392aad8599b97384d7821086225d9a48aa1863e8838ca913f
robot/mechanical/vendor/waveshare_feetech_st3215_servo.step
  29954eb73bd22b3f9536de2c1d8f96843b5c5b32288a8f4cb09709b8b892e39b
robot/description/robot_snake.urdf
  682609202f7e0deea134b7f4b471d27ffa4e57a3088b9d003a73066e45a94a03
robot/planning/robot_snake.srdf
  8a67dac3b8fcd36f92634c42f399748e188d4de2bf21902f5970a6eb9f060910
```

The saved rollout metrics are authoritative for the final simulation numbers; their hashes change whenever evidence is intentionally regenerated.
