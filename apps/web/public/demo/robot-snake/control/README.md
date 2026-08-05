# Robot Snake Simulator

A dependency-free, simulation-first prototype for experimenting with serpentine locomotion. It models a chain of rate- and angle-limited actuated joints following a traveling sine wave, simple traction-based planar movement, and whole-body collision response against circular obstacles.

## Run it

```sh
npm start
```

Open <http://localhost:8080>. Drive with **WASD** or the **arrow keys** and press **R** to reset. Tune amplitude, frequency, wavelength, and speed with the controls.

Choose a gait preset or save the current controls as **My preset**. **Record telemetry** captures the run at 10 Hz; stop recording and use **Export CSV** for analysis.

Run the control-model tests with:

```sh
npm test
```

## Model and limitations

For joint `i`, the target angle is:

```text
angle(i, t) = amplitude × sin(2π × (i / wavelength − frequency × t))
```

This milestone uses an empirical traction and geometric collision model rather than a rigid-body physics engine. Obstacles constrain the whole articulated body and the UI reports travel, peak joint angle, and contacts. A first-order hardware model estimates mass, minimum servo stall torque, average/peak current, and runtime from editable module, surface, and battery assumptions.

The hardware numbers are sizing estimates, not guarantees. Torque includes surface friction, gait acceleration, and a 2× safety factor. Electrical estimates assume 55% drive efficiency, a 35% loaded duty cycle, and 80% usable battery capacity. Bench testing one joint under representative load is required before purchasing a full servo set.

## Reference prototype envelope

The default 14-module design now assumes 140 g, 80 mm modules and a 2-cell 7.4 V, 2.2 Ah battery, reflecting a metal servo and bearing-supported bracket. Use the simulator's displayed result to select components with at least:

- the displayed stall torque at the actual supply voltage;
- the displayed peak current capacity from the regulator or direct battery rail;
- metal output gears and dual-bearing output support;
- position feedback or commanded-position telemetry;
- a controller able to update 13 joints at 50–100 Hz.

Start physically with three modules and two joints. Verify commanded angle, current limiting, emergency stop, thermal behavior, and cable strain relief before scaling to the full chain. Without a 3D printer, modules can be made from laser-cut sheet, aluminum angle, or off-the-shelf servo brackets.

The concrete no-print build is specified in [the bill of materials](docs/bill-of-materials.md), [wiring and assembly guide](docs/wiring-and-assembly.md), and [bench acceptance checklist](docs/bench-validation.md). The selected 7.4 V servos exceed the simulated torque requirement, while their measured bench current—not the estimate—will govern final battery and power distribution.

## ESP32 bench controller

The matching two-joint Arduino sketch is in `firmware/robot_snake/robot_snake.ino`. It requires the `ESP32Servo` library. After flashing, open this app in desktop Chromium, connect at 115200 baud, send the gait configuration, then arm outputs explicitly. Drive commands are sent at 10 Hz and double as watchdog heartbeats.

Install the project-local, pinned Arduino toolchain and compile the firmware with:

```sh
npm run firmware:setup
npm run firmware:build
```

This installs Arduino CLI 1.5.1, Espressif's ESP32 Arduino core 3.3.10, and ESP32Servo 3.2.1 under `.arduino-tools/`. Compiled binaries go to `build/firmware/`; both directories are ignored by Git. Set `ROBOT_SNAKE_TOOLS_DIR` to keep the toolchain elsewhere.

Read `docs/serial-protocol.md` before connecting actuators. The firmware boots disarmed, rate- and angle-limits commands, and detaches outputs after a 600 ms communications timeout. A physical power-cutting emergency stop remains mandatory.

## Path to hardware

1. Select actual parts after bench-testing one servo at the displayed torque and current envelope.
2. Fabricate and wire the three-module, two-joint physical prototype.
3. Calibrate joint centers/directions and validate ESTOP/watchdog behavior.
4. Compare exported simulation telemetry with bench measurements before scaling the chain.
