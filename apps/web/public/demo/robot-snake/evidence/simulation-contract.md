# MuJoCo Simulation Contract

## Task

Model one tabletop-scale modular snake on a smooth level floor. The nominal scenario must show a traveling joint wave and forward displacement. The obstacle scenario must detect one rigid cylinder, execute a collision-free detour, clear it with the whole body, and return to the original route.

## Authoritative sources

- Kinematic and interface source: `robot/interfaces/model_spec.json`
- Robot-description source: `robot/description/gen_robot_snake.py`
- MuJoCo source: `robot/simulation/generate_mjcf.py`
- Generated scenes: `robot/simulation/scenes/locomotion.xml` and `robot/simulation/scenes/obstacle_course.xml`

## Conventions

- SI units; radians for joint angles.
- Right-handed world; +X forward, +Y left, +Z up.
- `link_00` is the head and root body.
- Each link frame is at its leading yaw pivot; link geometry extends toward -X.
- Joint axes are +Z with provisional ±0.95 rad limits.

## Timing and stops

- Physics timestep: 0.002 s.
- Controller update rate: 50 Hz.
- Seed: 42.
- A rollout stops on non-finite physics state or its declared duration.
- Invalid or stale perception produces a bounded stop command.

## Modeled dynamics

- Ten 0.16 kg links use primitive ellipsoid/box mass and contact geometry.
- Position actuators approximate unidentified servo inner loops and remain limited to ±3 N·m.
- Joint commands use 85% of the provisional 4 rad/s hard velocity limit to leave room for dynamic overshoot.
- Directional pad friction and viscous resistive drag approximate smooth-floor traction.
- A bounded activity-scaled net force and steering moment approximate the unresolved aggregate propulsion created by lateral body motion against the floor.
- Range sensors are idealized, noise-free site rays.

The propulsion surrogate is deliberately visible in source and receipts. It makes navigation controllable but prevents any claim that simulated speed, turning radius, power, or obstacle performance will transfer to hardware.

## Acceptance metrics

Nominal locomotion must remain finite, respect joint/command limits, track commands below 0.35 rad RMSE, produce at least 0.12 m forward and net displacement in 12 simulated seconds, and show at least 0.12 rad physical joint-wave RMS.

Obstacle avoidance must trigger from range data, record zero obstacle-contact steps, advance at least 1.30 m, clear the obstacle with every link, return to `slither`, finish within 0.30 m of the route centerline, and have a 60-second regression-estimated terminal route heading within 0.20 rad of +X. Instantaneous head yaw is not used as route heading because lateral undulation intentionally oscillates it.
