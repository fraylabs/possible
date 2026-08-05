# Three-module prototype bill of materials

This is the recommended first physical build. It has three rigid body sections and two powered yaw joints, requires no printed parts, and is intentionally overbuilt so bench mistakes do not immediately become stripped servo gears.

## Selected parts

| Qty | Part | Required specification / selected example | Why |
| ---: | --- | --- | --- |
| 2 | Position servo | goBILDA 2000-0025-0002 “25-2 Torque”, H25T | 25.2 kg·cm at 7.4 V, 3 A stall, 50 Hz, 500–2500 µs, steel gears, dual bearings. |
| 2 | Bearing-supported mount | ServoCity 3217-0001-2501 Compact ServoBlock, 43 mm, H25T | Supports the output on a separate bearing and exposes the 16 mm build pattern. |
| 3 | Body rail | 96–144 mm low-side U-channel compatible with the 16 mm goBILDA pattern | Forms head, middle, and tail modules without custom fabrication. |
| 1 | Controller | Espressif ESP32-DevKitC V4 (ESP32-WROOM variant) | USB serial plus exposed GPIO18, GPIO19, GPIO27, 5 V, and ground. |
| 1 | Logic regulator | 5 V buck regulator, at least 1 A; Pololu D24V50F5 is a robust example | Powers only the controller from the future 2S pack. Do not use it for the 7.4 V servos. |
| 1 | Bench supply | Regulated 7.4 V, adjustable current limit, at least 6 A | Safer first power source than a battery and covers two 3 A servo stalls. |
| 1 | Emergency stop | Latching, normally-closed, two-pole switch rated at least 10 A DC | One pole interrupts servo positive; an auxiliary pole reports state to GPIO27. |
| 1 | Fuse and holder | 7.5 A automotive blade fuse | Protects the two-servo power branch and wiring. It does not protect a stalled servo from itself. |
| 1 | Distribution | Screw or lever terminals rated at least 10 A, 18 AWG power wire | Keeps servo current off breadboard traces and Dupont jumpers. |
| 1 | Capacitor | 1000–2200 µF, at least 10 V electrolytic | Across the servo bus near the connectors to reduce transient droop. |
| 3 | Skid pads | UHMW tape or low-friction furniture sliders | Protects rails and gives repeatable belly contact. |
| — | Hardware | M4 screws and locknuts appropriate to the chosen channel | Use thread locking where metal fasteners enter metal. |

For untethered operation later, add a protected 2S battery around 2.2 Ah, an appropriate balance charger, and a low-voltage alarm/cutoff. Do not purchase or connect the battery until the current-limited bench tests pass.

## Verified specifications

- The selected [goBILDA 25-2 servo](https://www.servocity.com/2000-series-dual-mode-servo-25-2/) is specified at 25.2 kg·cm and 3 A stall current at 7.4 V, with an H25T spline, 500–2500 µs range, and 50 Hz PWM.
- The [43 mm Compact ServoBlock](https://www.servocity.com/compact-servoblock-43mm-width-for-standard-size-h25t-spline-servo-hub-shaft/) weighs 44 g and uses a bearing-supported H25T hub shaft compatible with 16 mm-pattern channel.
- Espressif documents [GPIO18, GPIO19, GPIO27 and the mutually exclusive DevKitC power options](https://docs.espressif.com/projects/esp-dev-kits/en/latest/esp32/esp32-devkitc/user_guide.html).
- The active [Pololu D24V50F5](https://www.pololu.com/product/2851) accepts 6–38 V and provides a typical 5 A at 5 V with reverse-voltage, short-circuit, and thermal protection. The prototype only needs a small part of that capacity for logic.

Prices and availability vary by region; verify stock and shipping before ordering. Equivalent parts are acceptable when every electrical and mechanical requirement in the table is met.
