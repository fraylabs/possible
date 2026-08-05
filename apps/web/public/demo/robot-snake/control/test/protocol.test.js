import test from "node:test";
import assert from "node:assert/strict";
import { DEFAULTS } from "../src/snake.js";
import { armCommand, configCommand, driveCommand, estopCommand, telemetryCsv } from "../src/protocol.js";

test("protocol emits bounded newline-terminated commands", () => {
  assert.match(configCommand(DEFAULTS), /^CFG,(?:-?\d+\.\d{4},){5}\d+\n$/);
  assert.equal(driveCommand(4, -2), "DRV,1.0000,-1.0000\n");
  assert.equal(armCommand(), "ARM\n");
  assert.equal(estopCommand(), "ESTOP\n");
});

test("protocol rejects non-finite values", () => {
  assert.throws(() => driveCommand(NaN, 0), /finite/);
  assert.throws(() => configCommand({ ...DEFAULTS, frequency: Infinity }), /finite/);
});

test("telemetry export has a stable header and one row per sample", () => {
  const sample = { time_s: 1, x_px: 2, y_px: 3, heading_deg: 4, distance_px: 5,
    contacts: 0, drive: 1, steer: 0, amplitude_rad: 0.7, frequency_hz: 1.2,
    wavelength_joints: 5, peak_joint_deg: 30 };
  const lines = telemetryCsv([sample, sample]).trim().split("\n");
  assert.equal(lines.length, 3);
  assert.match(lines[0], /^time_s,/);
  assert.equal(lines[1].split(",").length, lines[0].split(",").length);
});
