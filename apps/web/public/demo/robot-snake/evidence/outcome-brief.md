# Robot Snake Digital Prototype — Outcome Brief

## Audience

The primary user is the project owner, starting from an idea with no existing hardware, CAD, electronics, or control code. The result must be understandable and inspectable without requiring fabrication.

## Desired End State

Create one coherent, simulation-backed digital prototype of a modular robot snake that:

- produces visually convincing lateral-undulation locomotion on a smooth indoor floor;
- detects representative obstacles and navigates around them autonomously;
- can be inspected as mechanical CAD, a robot description, and a deterministic simulation;
- documents a credible, bounded path toward later physical fabrication without claiming physical validation or manufacturing readiness.

## Current Reality

- The project starts from scratch.
- The only confirmed input is the robot-snake concept and desired behavior.
- No physical components, CAD, electronics, firmware, controls, or validation evidence exist yet.
- The target environment is a smooth indoor floor.
- The first outcome is digital; fabrication is explicitly deferred.

## Working Assumptions

These assumptions keep the first prototype bounded and may be revised if evidence contradicts them:

- A tabletop-scale, modular snake approximately 0.8–1.0 m long is an appropriate first embodiment.
- Motion is primarily planar, using repeated yaw joints and lateral undulation.
- Affordable hobby-scale smart-servo geometry is represented parametrically; no actuator is treated as physically validated.
- Simulated short-range perception is sufficient for the first autonomous avoidance proof.
- A deterministic local runner is the primary proof surface; ROS 2 interfaces are documented and bounded rather than requiring a live ROS 2 installation for every check.

## Shared Integration Baseline

All workstreams use this provisional source-of-truth baseline unless a verified tool constraint forces a documented change:

- Morphology: 10 repeated physical links and 9 actuated yaw joints.
- Geometry: 90 mm link body length, 95 mm joint pitch, 55 mm body width, and 35 mm body height; nominal assembled length is about 0.95 m.
- Frames: SI units; right-handed; +X forward from the head, +Y left, +Z up; each link frame is located at its leading yaw pivot; link geometry extends rearward along -X.
- Names: `link_00` through `link_09`; `joint_01` through `joint_09`; sensor names are stable and documented centrally.
- Joints: axis +Z, provisional range ±0.95 rad, provisional velocity limit 4 rad/s, provisional effort limit 3 N·m.
- Dynamics: approximate 0.16 kg per link with explicitly estimated box/capsule inertias and documented contact/friction assumptions.
- Locomotion baseline: bounded traveling sine wave near 0.55 rad amplitude, 0.7 Hz temporal frequency, and 0.75 rad inter-joint phase lag.
- Motion margin: command slew is capped at 85% of the provisional 4 rad/s joint limit, while acceptance observes physical position and velocity at every 0.002 s physics step.
- Perception baseline: five simulated head range rays at approximately -60°, -30°, 0°, +30°, and +60° with a useful range near 0.8 m.
- Simulation: MuJoCo timestep 0.002 s, controller update 50 Hz, fixed seeds, smooth level floor, and cylindrical test obstacles.

## Constraints

- Keep the outcome locally runnable and inspectable.
- Prefer generated, source-controlled robot artifacts over opaque hand-edited exports.
- Joint names, limits, dimensions, and segment ordering must remain consistent across CAD, URDF/SRDF, MuJoCo, control code, and tests.
- Safety limits and stop behavior must be explicit in architecture and controller contracts.
- Tests must be deterministic where practical and report honest skips when optional tools are unavailable.
- Preserve unrelated project files.

## Workstream Interfaces

- Architecture defines segment count, frames, joint convention, limits, sensors, controller states, and safety invariants.
- Mechanical source consumes the architecture dimensions and exports the assembly, review geometry, and component ledger.
- Robot description consumes the same dimensions, frames, joint limits, and mesh references; it must validate independently of the simulator.
- Simulation consumes the shared model constants and exposes named joints and sensors to the controller.
- Control consumes only the documented joint/sensor interface and produces bounded commands with stale-data and stop handling.
- Verification checks cross-artifact consistency plus locomotion, avoidance, determinism, and inspectability.

## Acceptance Checks

1. A parametric mechanical assembly and component ledger describe the complete modular body and can be regenerated locally.
2. STEP and lightweight review geometry are generated and pass available geometry sanity checks.
3. URDF and SRDF parse successfully, agree on joint/link names, and contain explicit limits and planning semantics.
4. The MuJoCo model and obstacle scene load without warnings that invalidate the test.
5. A seeded locomotion rollout shows a traveling body wave, respects command and joint limits, and advances the robot on a smooth floor.
6. A seeded obstacle-avoidance rollout detects an obstacle, changes course before contact, clears it, and resumes forward progress without deadlock.
7. Repeating each seeded rollout produces equivalent pass/fail results and materially consistent metrics.
8. An inspectable rollout artifact and concise run instructions are produced.
9. A sim-to-real gap report identifies unvalidated actuator, friction, power, sensing, structural, manufacturing, and safety assumptions.
10. A final evidence receipt records every passed, failed, skipped, and unproven check with exact verifier commands.

## External-Action Gates

The confirmed pack authorizes repo-local skill installation and local artifact work only. Separate explicit approval is required before:

- purchasing parts or spending money;
- fabricating or printing components;
- connecting to or commanding physical hardware;
- contacting vendors or other people;
- publishing, deploying, or distributing the prototype externally;
- claiming fabrication readiness, functional safety, or real-world performance.

## Unproven Claims

Simulation will not prove real locomotion, obstacle avoidance, friction behavior, actuator sizing, thermal performance, battery endurance, structural durability, sensing reliability, safety, manufacturability, or production readiness. These remain unproven until direct physical evidence exists.
