---
name: mujoco-robotics
description: Build, inspect, and validate MuJoCo robot models, scenes, controllers, and deterministic simulation tests. Use for MJCF/XML or URDF models loaded into MuJoCo; robot hands, grippers, arms, mobile robots, quadrupeds, and full robots; joint, actuator, sensor, contact, and inertial modeling; manipulation or locomotion scenarios; controller smoke tests; simulation rollouts; and explicit sim-to-real gap reports.
---

# MuJoCo robotics

Build the smallest truthful simulation that can test the robot's declared task. Preserve the difference between geometry, kinematics, dynamics, control, and physical validation.

## Establish the simulation contract

Before editing a model, record:

- robot morphology, intended task, environment, and success condition;
- authoritative model source: CAD, URDF, MJCF, measurements, or stated assumptions;
- SI units, world orientation, base frame, joint names, axes, limits, and zero pose;
- mass, center-of-mass, inertia, friction, damping, actuator, and sensor evidence;
- control mode, control rate, physics timestep, seeded scenarios, and stop conditions;
- whether the target is simulation-only or represents planned hardware.

Do not invent missing dynamics silently. Mark estimates beside the parameter and include them in the final sim-to-real gap report.

## Select the model path

- For an existing URDF, keep URDF as the kinematic source unless the user chooses a migration. Load it into MuJoCo or create a derived MJCF with a documented conversion receipt.
- For a new robot shared with ROS or motion planning, create URDF first and keep MuJoCo-specific actuators, sensors, contacts, and task scenes in derived MJCF files.
- For a simulation-only mechanism, author modular MJCF: robot model, assets, scene, task, and controller configuration remain separable.
- Use visual meshes for appearance and simple convex or primitive collision geometry for contact. Never use a decorative mesh as evidence of collision quality.

## Build a vertical slice

1. Load the model with no warnings or unresolved assets.
2. Verify one representative joint through its full declared range.
3. Add one bounded actuator and a zero-command controller.
4. Run one deterministic task scenario with explicit pass and fail conditions.
5. Expand to the remaining joints, actuators, sensors, contacts, and scenarios only after the slice passes.

Prefer bounded PD, impedance, position, or velocity baselines. Do not introduce reinforcement learning unless the task requires it and the user approves the compute and dependency cost. Clamp commands to declared position, velocity, torque, and workspace limits.

## Validate

Run the bundled structural and finite-state smoke test:

```bash
uv run --with mujoco --with numpy python scripts/validate_mujoco_model.py path/to/model.xml --steps 500
```

Run it from this skill directory or use the absolute script path. Then add task-specific tests that:

- use fixed seeds and reset from known states;
- cover nominal, boundary, and intentionally failing scenarios;
- assert joint, actuator, contact, and task limits rather than only checking that the viewer opens;
- record simulation time, timestep, controller rate, machine, dependency versions, and metrics;
- save at least one inspectable rollout or trajectory receipt when rendering is available.

A single stable rollout does not establish robustness. Sweep the declared initial-state and parameter ranges when making a robustness claim.

## Handoff

Deliver the model and referenced assets, scene/task files, controller baseline, runnable commands, deterministic tests, metrics, and a sim-to-real gap report. The gap report must separate measured hardware facts, modeled assumptions, untested conditions, and unsafe next steps.

Never connect to or command physical hardware, disable limits, or represent simulated performance as physical validation without explicit authorization and fresh hardware evidence.

Use `assets/minimal-hinge.xml` as a known-good structural example, not as a robot design template.
