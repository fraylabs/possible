# Sim-to-Real Gap Report

## Directly established

- The CAD, URDF, SRDF, and MJCF representations share the same ten links, nine joints, names, frame convention, dimensions, joint axes, and declared limits.
- Generated STEP, GLB, URDF, SRDF, and MuJoCo files load in the available local validation tools.
- Fixed-seed MuJoCo tests exercise nominal slithering, range-triggered detouring, whole-body clearance, route rejoin, and fail-safe controller behavior.
- The exact ST3215 catalog STEP file was checksum verified and its envelope fits inside the provisional module envelope in CAD.

## Modeled assumptions, not hardware facts

- Link mass and box/ellipsoid inertias.
- Smooth-floor contact coefficients and directional belly traction.
- Net propulsion and steering surrogate gains.
- Servo stiffness, damping, torque, velocity, backlash, thermal behavior, latency, and bus timing.
- Perfect range rays without noise, blind zones, crosstalk, surface reflectivity effects, or mounting error.
- Rigid links, joints, floor, and obstacles.
- Unlimited electrical supply and no battery, wiring, connector, or regulator losses.
- No cable routing, bearing stack, fastener retention, structural flex, wear, ingress, or pinch hazards.

## Unproven outcomes

The prototype does not prove physical slithering, obstacle avoidance, actuator suitability, torque margin, speed, turning radius, thermal endurance, battery life, structural strength, durability, sensing reliability, manufacturability, functional safety, or fabrication readiness.

## Evidence needed before fabrication

1. Select an actuator and controller only after bench measurements of usable torque-speed response, backlash, current, temperature, latency, and shutdown behavior.
2. Measure longitudinal and lateral friction on candidate belly materials across the intended floor finishes; replace both the friction values and propulsion surrogate with identified data.
3. Build a guarded two- or three-link joint rig to validate axes, clearances, cable routing, joint stops, and commanded-wave tracking.
4. Recalculate mass properties from the detailed mechanical/electrical assembly and rerun the simulation with uncertainty sweeps.
5. Validate range sensors against dark, reflective, angled, and low-profile obstacles, including dropouts and stale-data stops.
6. Perform a tethered, low-energy full-body test behind a physical E-stop before any autonomous run.

## Unsafe next steps

Do not connect this controller directly to hardware, rely on software limits as an E-stop, purchase the BOM as if it were complete, or fabricate the current shell as a load-qualified design. Physical work requires a separately reviewed electrical/mechanical design, explicit current and motion limits, guarded commissioning, and fresh approval.
