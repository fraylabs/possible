# Connectorized BOM and sourcing shortlist

Evidence checked: 2026-07-25. Prices and stock can change. Checkout delivery
dates are not verified orders.

No item may be bought until the exact cart, landed cost, delivery date, and
vendor are separately approved.

## Operator inventory and purchase status

Confirmed owned:

- Raspberry Pi 4 host.
- RØDE AI-1 USB audio interface.

Confirmed ordered on 2026-07-26:

- Dayton Audio TT25-8, 8-ohm version, from
  [Amazon Singapore](https://www.amazon.sg/Dayton-Audio-TT25-8-Tactile-Transducer/dp/B009RGJ47S).

Not yet confirmed as owned, ordered, or available: Fosi V1.0G, the exact
1/4-inch-to-RCA interconnect, speaker cable/connectors, microSD, switched
strip, power meter, suitable true-RMS low-pass meter, sound meter, thermometer,
calibrated load, or bench equipment. A hope of borrowing equipment is not a
budget line.

## Recommended chain

| Role | Exact item or bounded equivalent | Evidence | Connectorization / assembly | SGD estimate | Timing and uncertainty |
| --- | --- | --- | --- | ---: | --- |
| Tactile actuator | **Dayton Audio TT25-8**, 8 ohm, conservatively bounded to 15 W continuous / 30 W max pending received label, 20–80 Hz, Fs 40 Hz | [Current manufacturer product page, checked 2026-07-26](https://www.daytonaudio.com/product/1104/tt25-8-puck-tactile-transducer-mini-bass-shaker) states 15 W RMS / 30 W max; [exact Amazon SG item ordered 2026-07-26](https://www.amazon.sg/Dayton-Audio-TT25-8-Tactile-Transducer/dp/B009RGJ47S) resolves to model TT25-8 | Finished actuator with wire leads. Bare unit uses six #6 screws; inspect the delivered bundle before selecting the mount path | Ordered; exact paid total not recorded | Correct model and impedance are locked. Arrival date, received label, included ring/hardware, mount path, and physical fit remain inspection gates. |
| Optional surface ring | **Dayton Audio SMRK-2**, only for mount path A | [Manufacturer SMRK-2 page](https://www.daytonaudio.com/product/1656/smrk-2-surface-mounting-ring-kit-for-tt25-puck-mini-bass-shaker) lists the ring as an accessory kit | Finished three-point ring; exact received geometry must be transferred | Unpriced | No Singapore cart, stock, delivery, or landed cost is verified. Omit only if TT25 cart proves inclusion or bare six-tab path is selected. |
| Host | **Raspberry Pi 4**, operator-owned | Existing operator inventory | USB-A host connection; runs finite non-looping WAV playback | Owned | Raspberry Pi OS recognition of the AI-1, sample rate, channel map, underrun-free playback, and silence before/after the file require a bench preflight. |
| Audio interface | **RØDE AI-1**, operator-owned | [RØDE product page](https://rode.com/en-us/products/ai-1) specifies two balanced 1/4-inch monitor outputs; its user guide specifies a -6 dBu maximum monitor output | USB bus powered; use left rear line output, not the microphone input or direct actuator connection | Owned | Its maximum line output exceeds the Fosi's published input sensitivity, so it is adequate but cannot serve as a power limiter. |
| Amplifier | **Fosi Audio V1.0G**, exact candidate | [Fosi product page](https://fosiaudio.com/products/v1-0g-2-channel-stereo-audio-class-d-amplifier-mini-hi-fi-professional-digital-amp-for-home-speakers-50w-x-2-with-powersupply-fosi-audio) specifies RCA input, 2–8 ohm loads, 19 V adapter and input sensitivity <=280 mV | Enclosed and assembled. Use only the left RCA input and left speaker output; never bridge channels | Quote required | Ownership/order not confirmed. The amplifier can overpower the TT25-8; it does not replace the 9.5 V RMS abort gate. |
| Vibration logger | **SparkFun OpenLog Artemis DEV-16832** | [Mouser SG](https://www.mouser.sg/ProductDetail/SparkFun/DEV-16832?qs=hWgE7mdIu5RLSvRkxZwC3g%3D%3D) showed 32 in stock, dispatch immediately, S$83.33; [SparkFun](https://www.sparkfun.com/sparkfun-openlog-artemis.html) specifies CSV logging and IMU up to 250 Hz | Fully assembled board; USB-C power/configuration and microSD logging; no soldering | 83.33 | Strongest delivery evidence. Add microSD and USB-C cable if not already owned. Bare board requires a nonconductive mount/enclosure. |
| Logger alternative | **WitMotion WT901BLECL**, ±16 g, up to 200 Hz, USB-C cable included | [WitMotion](https://witmotion-sensor.com/products/bluetooth-5-0-accelerometer-inclinometer-wt901blecl-mpu9250-9-axis-imu-sensor) showed US$28.90 (~S$39 before freight) | Assembled enclosed wireless sensor with built-in battery and USB-C charging | 50 landed allowance | Delivery to Singapore and 200 Hz packet completeness are unverified. Charging and Bluetooth add failure modes. Use only if OpenLog timing or budget fails and checkout is approved. |
| Power measurement | **GMM-DDS108 Type-G power meter** | [Testmeter SG](https://testmeter.sg/products/GMM-DDS108-Digital-Power-Consumption-Energy-Meter-UK-Plug-Socket/) showed in stock, S$26.80 incl. tax | Finished plug-in instrument; no wiring | 26.80 | Measures whole-chain AC input, not actuator electrical power. Use voltage/current measurements separately if available. |
| Required actuator-voltage instrument | **Fluke 87V** true-RMS battery handheld meter with intact TL75 or equivalent shrouded leads, AC low-pass mode, and calibration/service state recorded | [Fluke Singapore](https://www.fluke.com/en-sg/product/electrical-testing/digital-multimeters/fluke-87v) specifies true RMS and a low-pass filter for noisy PWM-drive outputs; [RS Singapore](https://sg.rs-online.com/web/p/multimeters/4802355) showed S$953 | Fully assembled floating handheld instrument; attach across speaker terminals while amplifier is off/unplugged; no soldering, current jack, chassis earth, or oscilloscope ground clip | S$953 if bought; **owned/borrowed-only** | Buying it alone exceeds the complete S$300 budget by S$653. If it cannot be borrowed, this prototype is no-go under the current budget. Wall input power is not a substitute. |
| Budget hard-limit candidate | **RS PRO 175-3303**, Type-G regulated 12 V / 1 A / 12 W, 2.1 × 5.5 mm centre-positive, overload/overvoltage protected | [RS Singapore](https://sg.rs-online.com/web/p/ac-dc-adapters/1753303) showed S$19.40 incl. GST and 46 units ready to ship | Fully assembled molded lead; no soldering | 19.40 | Power conservation makes a genuinely current-limited 12 W DC source attractive, but the published page does not state the overload-current/time curve. It is not a sole 15 W control until exact amplifier barrel/polarity/startup compatibility and continuous current limit below 1.25 A are documented. |
| Manual disconnect | Reputable switched Type-G power strip already owned; otherwise a locally certified equivalent | Exact owned model must be recorded before use | Finished mains accessory; no modified AC leads | 0–20 | This is a manual disconnect, not a safety-rated E-stop. Reject travel adapters and unmarked products. |
| Speaker interconnect | 18–20 AWG stranded copper speaker lead plus **WAGO 221-2411** inline lever connector or direct amplifier spring terminal | [WAGO manufacturer record](https://www.wago.com/global/installation-terminal-blocks-and-connectors/inline-splicing-connector-with-levers/p/221-2411) specifies 0.2–4 mm² and all conductor types; [TT25 manual](https://www.daytonaudio.com/images/resources/dayton-audio-tt25-8-tt25-16-user-manual.pdf) permits standard wire nuts | Pre-cut/stripped by supplier or fabricator; lever connection; no solder | 10 | Exact cable OD, connector envelope, strip length, route, and bend radius are release blockers. No loose copper strands permitted. |
| Audio cable | Shielded 1/4-inch TS male-to-RCA male cable, <=1.5 m | Finished cable from a known retailer | AI-1 left rear output to Fosi left RCA input; no Y-splitter required | 8–15 | Confirm continuity/pinout before powered testing. Right channel remains disconnected. |
| Logger media/power | 8–32 GB genuine microSD and data-capable USB-C cable, if not owned | [SparkFun guide](https://learn.sparkfun.com/tutorials/openlog-artemis-hookup-guide/hardware-hookup) documents microSD logging | Finished parts | 0–20 | Prefer owned known-good items; format and destructive erase require explicit bench approval. |

## Budget scenarios

These modeled totals exclude the currently unpriced SMRK-2 accessory. None is
purchase-ready until the exact TT25 cart proves ring inclusion or the mount
decision selects the bare six-tab path.

They originally assumed some items were owned or borrowed. The Pi 4 and AI-1
are now confirmed owned, and the TT25-8 is ordered; all other ownership and
access assumptions remain invalid. Buying the S$953 reference instrument makes
every S$300 all-in scenario a no-go. The S$19.40 12 W adapter candidate can
become one bounded design control only after its overload behavior and exact
amplifier compatibility are verified; it does not replace vibration,
temperature, noise, or fit evidence.

| Scenario | Electronics and measurement | Remaining from S$300 | Decision |
| --- | ---: | ---: | --- |
| Current core: ordered TT25 + owned Pi 4/AI-1 + Fosi + finished interconnects | Quote required | Unknown | Mechanically and electrically coherent; paid actuator total, Fosi status, cable cart and fabrication quote remain unrecorded. |
| Current measured prototype: core + logger and verification access | Quote required | Unknown | Cannot earn a `working` receipt until logger, voltage access, sound, temperature, load and fixture evidence are named and priced. |

Current conclusion: **S$300 all-in feasibility is not established.** The next
useful comparison is (A) exact product cart + enclosed-body quote and (B) a
separate quote or named access route for measurement/verification. Do not hide
verification cost inside “borrowed.”

## Purchase gate

Proceed only if one cart satisfies all of these:

- actuator, amplifier, adapter, logger, and interconnect arrive by the locked
  assembly date;
- exact cart proves whether SMRK-2 is included; otherwise the cart adds the
  ring or the approved design selects the bare six-tab mount;
- amplifier variation includes the stated power adapter and supports the
  actuator impedance;
- electronics plus confirmed fabrication remain <=S$300;
- a named Fluke 87V-class or reviewed exact-equivalent access route is
  available with intact shrouded leads, service state, date, provider and cost;
  none is currently available;
- any proposed 12 W supply substitute has an exact connector/polarity match
  and a documented continuous current limit below 1.25 A at 12 V;
- no operator soldering is required;
- seller pages and checkout screens are saved as evidence;
- alternatives are not silently substituted.

If no cart satisfies the gate, report `no-go` or request a budget/deadline
decision. Do not buy a visually similar actuator or amplifier without revising
the interfaces and test plan.
