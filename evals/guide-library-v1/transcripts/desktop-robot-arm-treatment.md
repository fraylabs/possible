You currently have two preliminary targets, not a design specification. A 600 mm reach and 500 g payload do not determine the axes, mechanism, actuators, achievable speed, repeatability, or safety.

### What maintained guidance establishes

Possible’s Robotic arms, Actuator and transmission sizing, Robot control and electronics, and Robot calibration, safety, and physical verification guides were reviewed 2026-07-18. They establish a requirements-to-evidence method, drawing on [MIT robotics material](https://ocw.mit.edu/courses/2-12-introduction-to-robotics-fall-2005/resources/chapter2/), [ros2_control hardware contracts](https://docs.ros.org/en/rolling/p/hardware_interface/doc/hardware_components_userdoc.html), [NIST calibration guidance](https://www.nist.gov/publications/tools-robotics-sme-workcells-challenges-and-approaches-calibration-and-registration), [ISO 9283’s performance-test scope](https://www.iso.org/standard/22244.html), and [OSHA robot-system safety guidance](https://www.osha.gov/otm/section-4-safety-hazards/chapter-4). They do not certify or select a design.

The defensible sequence is:

- Define the task and measurable operating envelope before selecting hardware.
- Derive each joint’s torque and speed envelope from payload, tool mass, link masses and inertias, gravity, acceleration, external forces, motion profile, and duty cycle. Account for continuous versus peak ratings, efficiency, backlash, compliance, reflected inertia, bearings, holding or back-driving, brakes, and thermal limits. Stall torque alone is not sufficient.
- Define explicit command/state interfaces, sensing, homing, limits, update timing, power domains, startup/shutdown behavior, watchdogs, fault containment, and stop behavior.
- Treat simulation as model evidence only; it cannot prove strength, controller behavior, accuracy, or safety.
- Select material and manufacturing processes from functional geometry, dimensional needs, material behavior, quantity, inspection, and budget. The Manufacturing process selection and Inspection plan guides, reviewed 2026-07-17, make part inspection distinct from robot performance validation.

### Decisions and measurements that remain yours

You must define the pickup and placement poses, required tool orientations, obstacles, mounting geometry, usable workspace rather than maximum reach alone, object size and fragility, whether 500 g includes the gripper, cycle time, velocity and acceleration limits, duty cycle, expected life, environment, noise, and acceptable failure rate.

You must also choose the repeatability metric and tolerance; number and arrangement of axes; kinematics; end effector and payload-retention method; actuators, transmissions, encoders, brakes, bearings, controls, communications, and power; materials and structural margins; fabrication route; serviceability; budget; and whether a qualified commercial arm is a better baseline. No separate maintained guide surfaced for the particular pick-and-place task or end-effector selection, so those cannot be inferred from adjacent guidance.

Near people is not a safety concept and does not automatically make the arm collaborative. The project must identify pinch, crush, shear, impact, entanglement, dropped-object, unexpected-start, electrical, thermal, and stored-energy hazards across setup, programming, normal use, maintenance, and foreseeable faults. It must then choose the operating modes, access rules, speed/force limits, guarding or separation, protective stops, emergency stop, payload retention, training, and authorization model. Applicable jurisdictional requirements and current robot/machine-safety standards still require competent, project-specific review.

### Evidence required for a functional claim

For the exact assembled revision, retain:

- A versioned requirement and acceptance matrix defining reach, payload, poses, speed, duty, repeatability, and task-success criteria.
- Kinematic and structural calculations with assumptions and margins, plus component ratings tied to the same load cases.
- Inspection results for critical manufactured dimensions and interfaces.
- Bench results for representative joints: torque, speed, temperature, backlash, sensing, holding, and fault behavior.
- Control tests covering limits, communication loss, sensor disagreement, saturation, restart, watchdogs, and power removal.
- Calibration records using declared frames and an appropriate external instrument, including raw data, uncertainty, setup, payload, temperature, sampled poses, and software/firmware/configuration revisions.
- Physical reach, repeatability, and repeated pick-and-place results across the claimed workspace, payload, speed, and duty envelope, including failures and recovery behavior.

### Evidence required for a safety claim

A documented application risk assessment must map every identified hazard to a safety requirement and implemented safeguard. The actual arm then needs recorded validation of stop time and distance, protective and emergency stops, motion and force limits where claimed, fault responses, unexpected restart prevention, payload retention, pinch-point controls, electrical and thermal protection, and foreseeable misuse. Testing should use the worst relevant payload, pose, speed, and failure conditions, with competent review and an identified acceptance owner.

Functionality and safety are separate claims. Passing a task test does not establish safety; CAD, simulation, inspection, or a successful controller startup establishes neither. Claim only the hardware revision and operating envelope actually measured. Goal receipt: completed in about 1 minute 38 seconds.
