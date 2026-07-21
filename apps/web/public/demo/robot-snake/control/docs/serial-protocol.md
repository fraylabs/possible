# Controller serial protocol

The tuning console and ESP32 communicate at 115200 baud using newline-terminated ASCII. Commands are intentionally inspectable during bench testing.

| Command | Meaning |
| --- | --- |
| `CFG,A,F,W,L,R,N` | Set amplitude (rad), frequency (Hz), wavelength (joints), angle limit (rad), rate limit (rad/s), requested joint count. |
| `DRV,D,S` | Set normalized drive and steering, each from -1 to 1. Also serves as a heartbeat. |
| `ARM` | Attach outputs at neutral and enable motion. |
| `ESTOP` | Command neutral, detach outputs, and disarm. |
| `PING` | Heartbeat/connection check. |

The controller always boots disarmed. If no command is received for 600 ms while armed, its watchdog commands neutral, detaches every servo, and requires a new `ARM`. GPIO27 also expects a normally-closed E-stop sense contact: LOW is healthy, while HIGH or a broken sense wire disarms the controller. The physical switch must independently interrupt servo positive; software ESTOP is not a substitute.

Before arming, lift the mechanism clear of obstructions, use a current-limited bench supply, and calibrate `SERVO_CENTER_US`, `SERVO_DIRECTION`, and `SERVO_US_PER_RAD` in the firmware one joint at a time.
