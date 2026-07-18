The two numbers establish only an initial operating point, not an architecture or a safety claim. “600 mm reach” must be defined from a reference axis to a tool-center point and through a required working volume. “500 g payload” must state whether it excludes the gripper, cabling and adapters, and must include the object’s center of mass and inertia.

Maintained guidance can establish the engineering process. Relevant standards families generally include ISO 12100 for machinery risk assessment and risk reduction, ISO 10218 for industrial robot systems, ISO/TS 15066 where collaborative operation is claimed, IEC 60204-1 for machinery electrical equipment, and ISO 13849 or IEC 62061 for safety-related controls. Their current editions, local adoption and legal applicability must be checked for the intended market. They provide methods, hazard categories, design principles and validation expectations; they do not select the arm’s axes, motors or allowable speed for this application.

A defensible project should first define:

- Intended tasks, users, environment, operating hours, object shapes and failure consequences.
- Required workspace, approach directions, obstacle clearance and mounting location.
- Payload mass, center-of-mass envelope, inertia, grip force and consequences of a dropped object.
- Cycle time, joint and tool speeds, acceleration, duty cycle and expected lifetime cycles.
- Repeatability and accuracy separately, including pose, load, temperature, warm-up state and test method.
- Human interaction: who can enter the workspace, how often, whether contact is permitted, and whether separation monitoring, guarding or power-and-force limitation is intended.
- Allowed cost, size, noise, maintenance burden, manufacturing processes and serviceability.

Only then should axes and kinematics be chosen. Joint loads need calculation across worst-case poses and trajectories, including the arm’s own mass, gripper, payload offset, acceleration, gravity, shock and cable forces. Actuator, transmission and structure choices follow from torque-speed envelopes, backlash, stiffness, efficiency, thermal behavior, braking or gravity-holding needs and life. Controls require decisions about trajectory generation, feedback, homing, limit detection, fault handling, communications and configuration control. Power design must cover normal, peak, regenerative and fault conditions. The desktop and base must be checked for stiffness, anchorage and overturning.

Risk assessment must cover more than collision with the payload. Credible hazards include crushing and shearing at joints, trapping against nearby objects, sharp tooling, unexpected startup, runaway motion, software or sensor faults, singularities, gravity-driven descent, stored energy, electrical faults, overheating, fire, ejected or dropped parts, loose fasteners and unstable mounting. Low payload alone does not make the system safe near people.

Evidence for “functional” should be a requirements-to-test record showing at least:

- Measured reachable workspace and excluded/singular regions.
- Payload operation throughout every claimed pose and trajectory.
- Repeatability results from a defined sample of repeated approaches, reported statistically rather than as a best run.
- Accuracy and calibration evidence if accuracy is claimed.
- Cycle-time, missed-pick and placement-success results using representative objects.
- Thermal and duty-cycle testing at worst-case load and ambient conditions.
- Endurance testing sufficient to reveal wear, loosening, backlash growth and cable failures.
- Controlled recovery tests for power loss, communication loss, sensor errors, obstruction and interrupted homing.
- Traceable hardware, software, calibration and test configurations.

Evidence for “safe” requires a scoped safety case, not merely successful operation. It should include a documented risk assessment; chosen risk-reduction measures; specified safety functions and required performance levels or integrity levels; safety-related architecture and component evidence; and validation by test and analysis, including representative single faults. Tests should measure stopping time and distance under worst-case speed, payload and pose. If separation monitoring is used, detection range, latency and total stopping distance must support the minimum separation. If power-and-force limitation is claimed, contact force and pressure must be measured with suitable instrumentation at relevant body locations and worst-case geometries. Guards, interlocks, safe speed or space limits, emergency stopping, gravity restraint, end-effector retention, electrical protection, thermal limits and base stability each need verification where applicable.

An independent competent review, operating and maintenance instructions, inspection intervals, residual-risk disclosure and confirmation of jurisdictional requirements should precede use near people. The eventual conclusion should be narrow: safe for specified tasks, configurations, limits and environments. Until those limits are defined and validated, the arm can be called neither functional nor safe.
