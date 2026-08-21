# Full-size split V2 print and assembly guide

Status: printable geometry generated; slicing and physical retention remain
unverified

## Why the split is off-centre

The body remains `300 × 140 mm`, matching the original full-size concept. It
splits at `X = +90 mm`, producing:

| Part | Finished envelope | Fits a 256 mm square bed |
| --- | --- | --- |
| Primary shell | `239.85 × 140 × 77.75 mm` | Yes |
| End cap | `59.85 × 140 × 77.75 mm` | Yes |
| Structural service panel | `240 × 132 × 4 mm` | Yes |
| PETG actuator spine | `210 × 100 × 10 mm` | Yes |
| Alignment pin, two required | `Ø6 × 19.2 mm` | Yes |

The primary shell retains the centred head-contact and complete actuator
envelope. The seam is `90 mm` to the right of centre, outside the actuator tab
sweep and away from the main head-support area.

## How the two sections remain together

The seam is not held by glue alone:

1. Two `Ø6 × 19.2 mm` printed pins align the upper structure.
2. The one-piece `210 × 100 × 10 mm` PETG spine crosses the seam at the cavity
   ceiling. Four fasteners retain it to the primary shell and two retain it to
   the end cap.
3. The one-piece `240 × 132 × 4 mm` service panel crosses the seam below. Two
   panel fasteners retain the primary shell and two retain the end cap.
4. The nominal `0.30 mm` seam gap prevents printed faces from falsely appearing
   assembled when elephant foot or surface variation is present.

This is a redundant prototype retention concept. It is not yet proven under
vibration or head load.

## Print files

Prefer 3MF because it preserves units:

- `models/split_v2_primary_shell.3mf`
- `models/split_v2_end_cap.3mf`
- `models/split_v2_panel.3mf`
- `models/split_v2_spine.3mf`
- `models/split_v2_alignment_pin.3mf` — print two

Editable STEP and STL files are beside them.

## Before the full print

1. Slice the primary shell in the exact printer profile.
2. Compare normal and seam-face-down orientations; inspect supports, bed
   contact, bridge regions, and estimated mass.
3. Print an insert coupon and one alignment pin/hole coupon first.
4. Print the spine before the shell and verify all fastener clearances.
5. Do not print actuator holes until the received actuator is measured.

Starting material intent:

- PETG from one known batch;
- `0.20 mm` layer height;
- at least `5` perimeter walls for shell and panel;
- at least `6` perimeter walls for the structural spine;
- locally solid material around every insert, pin bore, and fastener;
- printer/filament manufacturer's PETG temperature profile; and
- slicer-generated supports only after overhang preview.

## Mechanical assembly order

1. Inspect and deburr the two seam faces without rounding their datum edges.
2. Prove the selected heat-set insert process on a matching coupon.
3. Install six spine inserts and four panel inserts using depth stops.
4. Dry-fit both alignment pins into the primary shell.
5. Mount the actuator to the removable spine after its real hole pattern is
   modeled and reprinted.
6. Bolt the spine to the primary shell at `X = -75/+60`, `Y = ±42`.
7. Slide the end cap over both alignment pins until the seam seats uniformly.
8. Bolt the spine to the end cap at `X = +100`, `Y = ±42`.
9. Complete the cable restraint and unpowered rattle inspection.
10. Fit the gasket and install the service panel at `X = ±105`, `Y = ±61`.
11. Apply witness marks and record every fastener before any energized test.

Do not use adhesive as the primary joint. Stop testing for any seam motion,
crack, whitening, heat deformation, shifted witness mark, or new rattle.

## External equipment

The Raspberry Pi, RØDE AI-1, power amplifier, and power supplies remain outside
the body. Only the actuator, passive cable, sensor, spine, fasteners, and strain
relief belong inside.

## What remains unknown

The files prove CAD bounds and topology only. They do not prove slicer support
strategy, print quality, insert retention, seam comfort, received actuator fit,
load capacity, vibration retention, temperature, or human-use suitability.
