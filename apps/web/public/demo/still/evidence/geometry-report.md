# Still exterior concept — geometry report

## Scope

This model communicates exterior form and static assembly intent for the fictional Still focus device. It is not a fabrication model and makes no claim about fit, electronics, ergonomics, connector compliance, thermal behavior, tolerances, manufacturability, safety, or production readiness.

The shared brief's approximately 72 × 72 × 18 mm value is treated as an **unvalidated enclosure-body design target**. The press-dial protrudes above that body, so the measured complete concept envelope is taller.

## Measured assembly facts

Measured from `still.step` using the bundled CAD inspection CLI:

| Fact | Measured result | Interpretation |
| --- | ---: | --- |
| Primary kind | assembly | Labeled static STEP assembly |
| Root / leaf occurrences | 1 / 5 | Lower shell, faceplate, e-ink face, signal ring, dial |
| Shapes / faces / edges | 5 / 66 / 156 | Exported topology counts |
| Complete bounds | X −36…36, Y −36…36, Z 0…23 mm | 72 × 72 × 23 mm total concept envelope |
| Lower shell (`#o1.1`) | 72 × 72 × 12 mm | Root occurrence, Z 0…12 mm |
| Faceplate (`#o1.2`) | 72 × 72 × 6 mm | Z 12…18 mm |
| Enclosure body | 72 × 72 × 18 mm | Lower shell plus seated faceplate; design target only |
| E-ink face (`#o1.3`) | 50 × 35 × 0.8 mm | Center (0, −7.5, 17.4); top Z 17.8 mm |
| Signal ring (`#o1.4`) | approximately 18 mm OD × 0.6 mm | Frame translation (0, 24, 18) |
| Rotary press-dial (`#o1.5`) | approximately 15 mm diameter × 5 mm | Frame translation (0, 24, 18); top Z 23 mm |

The ring and dial X/Y mesh bounds differ from nominal diameters by about 0.01 mm because the reported occurrence bounds come from tessellated viewer topology. Their exact source parameters remain 18 mm and 15 mm.

## Positioning and relationship checks

- Lower-shell top `#o1.1.f5` and faceplate bottom `#o1.2.f4`: flush alignment translation `[0, 0, 0]` mm.
- Lower-shell height `#o1.1.f4` → `#o1.1.f5`: 12.0 mm.
- Faceplate height `#o1.2.f4` → `#o1.2.f5`: 6.0 mm.
- Pocket floor `#o1.2.f20` → display bottom `#o1.3.f9`: 0.2 mm visual gap.
- Display bottom `#o1.3.f9` → display top `#o1.3.f10`: 0.8 mm.
- Faceplate frame: translation `[0, 0, 12]` mm, axes aligned to assembly XYZ.
- Display frame: translation `[0, −7.5, 17]` mm, axes aligned to assembly XYZ.
- Ring and dial frames: both translation `[0, 24, 18]` mm, confirming concentric placement intent.

Placements are explicit, named parameters in `still.py`. No persistent STEP constraints or motion behavior are claimed.

## Visual review

The mandatory four-view packet was generated at 1800 × 1200 and reviewed:

- `snapshots/iso_20260718T143834Z.png`: coherent rounded-square form, recessed display, readable dial and signal ring.
- `snapshots/iso-opposite_20260718T143834Z.png`: hollow lower-shell cavity and rear wall opening visible; no unintended floating exterior parts observed.
- `snapshots/top-ortho_20260718T143834Z.png`: display and concentric dial/ring placement read clearly and are centered on their intended axes.
- `snapshots/front-ortho_20260718T143834Z.png`: 18 mm body stack and 5 mm dial protrusion read as intended.

The rear opening uses a source-defined 12 × 4.5 mm cutting envelope and is visually present in the opposed view. Its finished topology was not independently dimensioned with selector-pair measurement, so no USB-C connector-fit claim is made.

## Assumptions and unproven claims

- 10 mm outer corner radius, 2.4 mm shell wall/floor, 6 mm faceplate, display envelope, dial envelope, signal ring, and rear opening are concept assumptions.
- The model omits internal electronics, PCB, battery, fasteners, seals, speaker/haptics, antenna clearance, strain relief, and real connector geometry.
- The STL and native GLB are secondary review meshes. STEP remains the primary artifact.
- No physical validation, load analysis, thermal analysis, tolerance analysis, ergonomic testing, DFM review, compliance work, procurement, fabrication, or manufacturing study was performed.

