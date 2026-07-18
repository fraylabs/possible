# Still hardware workstream receipt

## Outcome

**Passed with explicit prototype caveats.** A reviewable STEP-first exterior assembly concept, secondary STL/native GLB exports, a measured geometry report, and a reviewed four-view packet were produced locally. Nothing was deployed, purchased, fabricated, or physically validated.

## Checks

| Check | Status | Evidence |
| --- | --- | --- |
| Hardware-local Python environment | Passed after repair | Initial Python 3.11 environment was incompatible with `cadpy` (`Python>=3.12`). Recreated with uv and Python 3.12.12, then installed the bundled requirements from `.agents/skills/cad/requirements.txt`. |
| CAD CLI help before use | Passed | `step --help`, `inspect --help`, and `snapshot --help` all exited 0 before generation. |
| STEP generation | Passed | `hardware/still.step`, SHA-256 `f22d316dfd2cb4ac16ca048bb2a87f28a13997079fa517442cf97a79ff529cd2`. |
| Labeled assembly structure | Passed | 1 root, 5 leaf occurrences, 5 shapes; labels resolved for lower shell, faceplate, e-ink face, signal ring, and rotary press-dial. |
| Required `refs --facts --planes --positioning` | Passed | Assembly size `[72, 72, 23]` mm; seven major plane groups; occurrence frames resolved. |
| 72 × 72 × 18 mm body target | Passed as geometric concept check only | Shell 72 × 72 × 12 mm plus flush 72 × 72 × 6 mm faceplate. This does not validate the target physically. |
| Base/faceplate interface | Passed | Flush alignment delta `[0, 0, 0]` mm at Z = 12 mm. |
| Display placement | Passed | 50 × 35 × 0.8 mm; top Z = 17.8 mm; 0.2 mm above pocket floor. |
| Dial/ring concentric placement | Passed | Both occurrence frames translate to `[0, 24, 18]` mm. |
| Secondary STL | Passed | Non-empty `exports/still.stl`, SHA-256 `01d6a78de0a5853ec8ed439213fce531d71699a7edabc8a9c33d3dae0544da6f`. |
| Secondary native GLB | Passed | Valid glTF binary v2, 93,928 bytes; SHA-256 `954e91343487ccc90faaba9d78b30be1c4c8b256570851cb571fd87263a943e0`. |
| Mandatory snapshot packet | Passed | Four 1800 × 1200 PNGs saved and visually reviewed; see `GEOMETRY-REPORT.md`. |
| CAD Viewer live handoff | Failed, reported | Installed `cad-viewer` skill was read and invoked exactly as documented, but its bundled `scripts/viewer/package.json` has no `agent:start` script. CLI facts and reviewed snapshots remain available. |
| USB-C connector fit | Skipped / unproven | Only a source-defined, visually confirmed 12 × 4.5 mm exterior concept opening exists; no connector model or fit validation. |
| Fabrication/manufacturing/safety validation | Skipped / out of scope | No fabrication, purchase, FEA, thermal, tolerance, DFM, compliance, or physical testing performed. |

## Exact verifier commands run

From repository root unless noted:

```bash
# Environment (requirements command was run from .agents/skills/cad)
uv venv --clear --python 3.12 /Users/brianlim/coding/fray/repos/possible-hardware-demo-run/hardware/.venv
uv pip install \
  --python /Users/brianlim/coding/fray/repos/possible-hardware-demo-run/hardware/.venv/bin/python \
  -r requirements.txt

# Required help checks
hardware/.venv/bin/python .agents/skills/cad/scripts/step --help
hardware/.venv/bin/python .agents/skills/cad/scripts/inspect --help
hardware/.venv/bin/python .agents/skills/cad/scripts/snapshot --help

# Final generation
hardware/.venv/bin/python .agents/skills/cad/scripts/step \
  hardware/still.py \
  --stl exports/still.stl \
  --glb exports/still.glb \
  --force \
  --verbose

# Baseline and occurrence facts
hardware/.venv/bin/python .agents/skills/cad/scripts/inspect refs \
  hardware/still.step --facts --planes --positioning --format text
hardware/.venv/bin/python .agents/skills/cad/scripts/inspect refs \
  hardware/still.step '#o1.1' '#o1.2' '#o1.3' '#o1.4' '#o1.5' \
  --facts --positioning --detail --format json

# Relationship and dimension checks
hardware/.venv/bin/python .agents/skills/cad/scripts/inspect align \
  hardware/still.step --moving '#o1.2.f4' --target '#o1.1.f5' \
  --mode flush --axis z --format text
hardware/.venv/bin/python .agents/skills/cad/scripts/inspect measure \
  hardware/still.step --from '#o1.1.f4' --to '#o1.1.f5' --axis z --format text
hardware/.venv/bin/python .agents/skills/cad/scripts/inspect measure \
  hardware/still.step --from '#o1.2.f4' --to '#o1.2.f5' --axis z --format text
hardware/.venv/bin/python .agents/skills/cad/scripts/inspect measure \
  hardware/still.step --from '#o1.2.f20' --to '#o1.3.f9' --axis z --format text
hardware/.venv/bin/python .agents/skills/cad/scripts/inspect measure \
  hardware/still.step --from '#o1.3.f9' --to '#o1.3.f10' --axis z --format text
hardware/.venv/bin/python .agents/skills/cad/scripts/inspect frame \
  hardware/still.step '#o1.2' --format text
hardware/.venv/bin/python .agents/skills/cad/scripts/inspect frame \
  hardware/still.step '#o1.3' --format text
hardware/.venv/bin/python .agents/skills/cad/scripts/inspect frame \
  hardware/still.step '#o1.4' --format text
hardware/.venv/bin/python .agents/skills/cad/scripts/inspect frame \
  hardware/still.step '#o1.5' --format text

# Snapshot packet
hardware/.venv/bin/python .agents/skills/cad/scripts/snapshot \
  --job hardware/snapshot-job.json

# Non-empty and file-type checks
test -s hardware/still.step
test -s hardware/exports/still.stl
test -s hardware/exports/still.glb
test -s hardware/.still.step.glb
file hardware/still.step hardware/exports/still.stl hardware/exports/still.glb hardware/snapshots/*.png
```

## Viewer handoff attempt

Run from `/Users/brianlim/.codex/plugins/cache/text-to-cad/cad/0.3.9/skills/cad-viewer`:

```bash
npm --prefix scripts/viewer run agent:start -- \
  --host 127.0.0.1 \
  --dir /Users/brianlim/coding/fray/repos/possible-hardware-demo-run/hardware \
  --json
```

Result: failed with `npm error Missing script: "agent:start"`. No live Viewer URL can be honestly supplied from this installed skill version.

