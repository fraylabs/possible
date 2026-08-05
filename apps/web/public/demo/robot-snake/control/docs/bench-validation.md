# Bench validation and acceptance criteria

Record results directly in a copy of the table. A failed item stops the test; remove power before investigating.

## Before power

| Check | Pass criterion | Result |
| --- | --- | --- |
| Polarity and continuity | No short across the servo rail; every ground is common; servo positive is isolated from ESP32 5 V. | ☐ |
| E-stop power contact | Latched stop produces an open circuit between supply positive and servo positive. | ☐ |
| E-stop sense contact | GPIO27 is LOW when released/healthy and HIGH when latched or disconnected. | ☐ |
| Joint clearance | Each unpowered joint moves through ±45° without binding or cable tension. | ☐ |
| Fuse | 7.5 A fuse installed in series with servo positive near the supply. | ☐ |

## Powered tests

Start at 7.4 V with a 0.5 A current limit and both servo power leads disconnected. Increase limits only at the step that requires them.

| Step | Procedure | Pass criterion |
| ---: | --- | --- |
| 1 | Flash firmware; keep E-stop latched. | Serial prints `SNAKE,READY,1`; no servo is powered. |
| 2 | Release E-stop; connect only joint 0; set 1 A limit; click Arm. | Joint holds neutral without hitting a stop; idle current stays below 0.5 A. |
| 3 | Send a ±10° slow command after calibrating center/direction. | Physical direction agrees with the console; measured travel is within ±2°. |
| 4 | Press Space in the console, then use the physical E-stop. | Software stop neutralizes/detaches; physical stop removes servo-bus voltage. Both require re-arming. |
| 5 | Unplug USB while armed. | Outputs neutralize and detach within 1 second from watchdog timeout. |
| 6 | Repeat steps 2–5 for joint 1, then connect both; raise limit to 6 A. | No resets or uncontrolled movement; peak current is recorded. |
| 7 | Run the Efficient preset unloaded for 10 minutes. | Servo cases remain below 50 °C and no cable chafing, loosening, or missed commands occurs. |
| 8 | Place the chain on the test surface and run at 25%, 50%, then 100% drive. | It produces repeatable motion; current, temperature, and CSV telemetry are saved for each run. |

Do not test by holding or deliberately stalling a powered joint. Servo stall torque is not a safe continuous operating point. If current exceeds 6 A, the ESP32 resets, motion chatters, or a case reaches 50 °C, stop and correct the mechanical or power issue before continuing.
