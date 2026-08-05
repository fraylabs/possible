#!/usr/bin/env python3
"""Load a MuJoCo model, check structural limits, and run a zero-control smoke test."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

import mujoco
import numpy as np


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("model", type=Path, help="MJCF/XML or URDF model path")
    parser.add_argument("--steps", type=int, default=200, help="Zero-control simulation steps")
    return parser.parse_args()


def named(model: mujoco.MjModel, object_type: mujoco.mjtObj, object_id: int) -> str:
    return mujoco.mj_id2name(model, object_type, object_id) or f"id:{object_id}"


def validate(model: mujoco.MjModel, steps: int) -> dict[str, object]:
    errors: list[str] = []
    warnings: list[str] = []

    if steps < 1:
        errors.append("steps must be at least 1")
    if not np.isfinite(model.opt.timestep) or model.opt.timestep <= 0:
        errors.append(f"invalid timestep: {model.opt.timestep}")

    for joint_id in range(model.njnt):
        if model.jnt_limited[joint_id] and model.jnt_range[joint_id, 0] >= model.jnt_range[joint_id, 1]:
            errors.append(f"joint {named(model, mujoco.mjtObj.mjOBJ_JOINT, joint_id)} has an invalid range")

    for actuator_id in range(model.nu):
        if model.actuator_ctrllimited[actuator_id] and model.actuator_ctrlrange[actuator_id, 0] >= model.actuator_ctrlrange[actuator_id, 1]:
            errors.append(f"actuator {named(model, mujoco.mjtObj.mjOBJ_ACTUATOR, actuator_id)} has an invalid control range")

    for body_id in range(1, model.nbody):
        body_name = named(model, mujoco.mjtObj.mjOBJ_BODY, body_id)
        mass = float(model.body_mass[body_id])
        inertia = model.body_inertia[body_id]
        if mass < 0 or np.any(inertia < 0):
            errors.append(f"body {body_name} has negative mass or inertia")
        elif mass == 0:
            warnings.append(f"body {body_name} has zero mass; confirm it is intentionally static or frame-only")
        elif np.any(inertia <= 0):
            errors.append(f"dynamic body {body_name} has non-positive principal inertia")

    data = mujoco.MjData(model)
    mujoco.mj_forward(model, data)
    initial_energy = np.asarray(data.energy, dtype=float).copy()
    if model.nu:
        data.ctrl[:] = 0

    simulated_steps = 0
    if not errors:
        for _ in range(steps):
            mujoco.mj_step(model, data)
            simulated_steps += 1
            arrays = (data.qpos, data.qvel, data.qacc, data.xpos, data.energy)
            if not all(np.all(np.isfinite(array)) for array in arrays):
                errors.append(f"non-finite simulation state after step {simulated_steps}")
                break

    return {
        "ok": not errors,
        "model": model.names.decode(errors="ignore").split("\0", 1)[0] or "unnamed",
        "dimensions": {
            "bodies": model.nbody,
            "joints": model.njnt,
            "position_dofs": model.nq,
            "velocity_dofs": model.nv,
            "actuators": model.nu,
            "sensors": model.nsensor,
            "geoms": model.ngeom,
        },
        "timestep_seconds": float(model.opt.timestep),
        "requested_steps": steps,
        "simulated_steps": simulated_steps,
        "initial_energy": initial_energy.tolist(),
        "final_energy": np.asarray(data.energy, dtype=float).tolist(),
        "errors": errors,
        "warnings": warnings,
    }


def main() -> int:
    args = parse_args()
    if not args.model.is_file():
        print(json.dumps({"ok": False, "errors": [f"model not found: {args.model}"]}, indent=2))
        return 2
    try:
        model = mujoco.MjModel.from_xml_path(str(args.model.resolve()))
        report = validate(model, args.steps)
    except Exception as error:  # MuJoCo exposes several loader exception types.
        report = {"ok": False, "errors": [f"failed to load model: {error}"]}
    print(json.dumps(report, indent=2, sort_keys=True))
    return 0 if report["ok"] else 1


if __name__ == "__main__":
    sys.exit(main())
