# Local Rerun viewer

The Rerun recordings are a polished replay of the preserved MuJoCo evidence.
The exporter reads the generated URDF, `trajectory.npz`, `metrics.json`, and the
canonical model specification. It does not rerun or modify the simulation.

## Export

```bash
uv sync
uv run python -m robot.simulation.export_rerun all
```

The command writes:

- `robot/simulation/rerun/locomotion.rrd`
- `robot/simulation/rerun/obstacle_course.rrd`
- one adjacent `.manifest.json` receipt per recording

Open either recording locally:

```bash
uv run rerun robot/simulation/rerun/obstacle_course.rrd
```

The default **Replay** tab combines the rounded presentation shell, preserved
head path, obstacle, live range rays, controller-state timeline, and key
metrics. **Raw telemetry** exposes every joint position, command, tracking
error, and all five range values. **Generated URDF** shows the canonical box
visuals imported directly from the URDF. **Evidence and limits** records the
source files and evidence boundary.

The obstacle replay uses a 10× presentation timeline so the 190-second
simulation can be reviewed in about 19 seconds. Every dynamic sample also has
its original `sim_time` and frame index in the recording.

## Verify

```bash
uv run rerun rrd verify --check-footers true robot/simulation/rerun/locomotion.rrd
uv run rerun rrd verify --check-footers true robot/simulation/rerun/obstacle_course.rrd
uv run rerun rrd stats robot/simulation/rerun/obstacle_course.rrd
uv run python -m pytest robot/tests/test_rerun_export.py
```

For a repeatability check, export the same scenario twice and compare it:

```bash
uv run python -m robot.simulation.export_rerun obstacle_course --output /tmp/robot-snake-a.rrd
uv run python -m robot.simulation.export_rerun obstacle_course --output /tmp/robot-snake-b.rrd
uv run rerun rrd compare --unordered /tmp/robot-snake-a.rrd /tmp/robot-snake-b.rrd
```

## Evidence boundary

The rounded shell changes presentation only. It derives its dimensions and
visual offset from the URDF, while the generated-URDF tab retains the canonical
visual geometry. The replay does not strengthen the simulation evidence.

The prototype still uses the documented bounded, activity-scaled net force and
steering-moment surrogate for unresolved belly–floor propulsion. Physical
locomotion, fabrication readiness, structural adequacy, sensing, and actuator
performance remain unvalidated. Read `SIM-TO-REAL-GAPS.md` before hardware work.
