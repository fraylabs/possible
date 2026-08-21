# Full-size split V2 local CAD validation

Validated: 2026-07-29

## Native inspection

All artifacts were generated from Python sources with the repo-local CAD
tooling. Native STEP inspection returned no errors or warnings.

| File | Kind | Bounds (mm) |
| --- | --- | --- |
| `models/split_headrest_v2.step` | engineering assembly | `300 × 140 × 77.75` |
| `models/split_v2_primary_shell.step` | printable part | `239.85 × 140 × 77.748` |
| `models/split_v2_end_cap.step` | printable part | `59.85 × 140 × 77.7479` |
| `models/split_v2_panel.step` | printable part | `240 × 132 × 4` |
| `models/split_v2_spine.step` | printable part | `210 × 100 × 10` |
| `models/split_v2_alignment_pin.step` | printable part | `Ø6 × 19.2` |

Every individual printable X/Y envelope is below `256 × 256 mm`. The assembled
body returns to the original `300 × 140 mm` footprint.

## Deterministic joint checks

`npm run check:v2` verifies:

- the primary and end-cap split planes preserve the nominal `0.30 mm` gap;
- each shell section remains one connected solid;
- the actuator spine crosses the seam and has retained fasteners on both sides;
- the service panel crosses the seam and has retained fasteners on both sides;
- the alignment pin has `0.40 mm` nominal diametric clearance;
- the seam remains beyond the nominal actuator tab envelope;
- the oriented actuator fits the spine width; and
- the actuator envelope clears the installed service panel.

## Visual review

- installed body:
  `workstreams/mechanical/snapshots/split-v2-body-iso_*.png`
- top seam position:
  `workstreams/mechanical/snapshots/split-v2-body-top_*.png`
- panel-hidden internal joint:
  `workstreams/mechanical/snapshots/split-v2-engineering-open_*.png`
- exploded assembly:
  `workstreams/mechanical/snapshots/split-v2-engineering-exploded_*.png`

Visual review confirms that the seam sits near the right end rather than under
the centred actuator. The internal spine and underside panel visibly overlap
both shell sections.

## Boundary

This validates source generation, topology, placement, and printer-bed
envelopes. It does not validate slicing, physical printing, insert installation,
seam feel, received-part fit, load capacity, vibration retention, temperature,
or human use.
