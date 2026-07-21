# Wiring and mechanical assembly

## Power architecture

```text
7.4 V bench supply (+)
        |
      7.5 A fuse
        |
  physical E-stop (NC power pole)
        |
        +---------- servo 1 red
        +---------- servo 2 red

7.4 V bench supply (+) -------- 5 V buck -------- ESP32 5V
bench supply ground ------------+---------------- ESP32 GND
                                 +---------------- both servo grounds

ESP32 GPIO18 ------------------------------------- servo 1 signal
ESP32 GPIO19 ------------------------------------- servo 2 signal
ESP32 GPIO27 ---- E-stop auxiliary NC contact ---- GND
```

The servo rail and ESP32 must share ground. Servo positive must never connect to the ESP32 5 V or 3.3 V pins. Keep high-current wiring short, use 18 AWG for the servo bus, and place the bulk capacitor across servo positive and ground with correct polarity.

During USB programming, power the ESP32 only from USB. Espressif warns that its USB, 5 V-header, and 3.3 V-header power methods are mutually exclusive. Disconnect the buck regulator from the ESP32 5 V pin before attaching USB unless power-source isolation has been added.

## Mechanical stack

1. Assemble each ServoBlock around a servo, leaving the horn/hub screw accessible.
2. Fasten one ServoBlock to the rear of the head rail and the second to the rear of the middle rail.
3. Fasten each bearing-supported hub shaft to the front of the following rail. Both joint axes must be vertical and collinear at neutral.
4. Set all rails straight before tightening the spline screws. Do not rely on software trim to correct a spline installed one tooth off if it can be repositioned mechanically.
5. Apply identical skid material beneath all three rails. Ensure screws, wires, and connectors cannot scrape the floor.
6. Route each servo cable through a loose service loop centered on its joint. Manually sweep ±45° and verify the cable neither tightens nor enters the joint.
7. Mount electronics on the head rail and the bench-power terminal block where it cannot contact a moving horn.

Do not assemble a full-length snake from these parts yet. First prove the two-joint power, calibration, watchdog, and thermal behavior described in `bench-validation.md`.
