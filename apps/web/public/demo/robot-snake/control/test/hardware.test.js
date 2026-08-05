import test from "node:test";
import assert from "node:assert/strict";
import { DEFAULTS } from "../src/snake.js";
import { estimateHardware, HARDWARE_DEFAULTS } from "../src/hardware.js";

test("hardware estimate returns finite positive sizing values", () => {
  const result = estimateHardware(DEFAULTS);
  for (const key of ["totalMassKg", "requiredStallTorqueNm", "averagePowerW", "peakCurrentA", "estimatedRuntimeMinutes"]) {
    assert.ok(Number.isFinite(result[key]) && result[key] > 0, key);
  }
  assert.equal(result.jointCount, DEFAULTS.segmentCount - 1);
  assert.ok(result.peakCurrentA > result.averageCurrentA);
});

test("higher friction increases required torque", () => {
  const low = estimateHardware(DEFAULTS, { ...HARDWARE_DEFAULTS, frictionCoefficient: 0.2 });
  const high = estimateHardware(DEFAULTS, { ...HARDWARE_DEFAULTS, frictionCoefficient: 0.8 });
  assert.ok(high.requiredStallTorqueNm > low.requiredStallTorqueNm);
});

test("larger battery increases runtime without changing load", () => {
  const small = estimateHardware(DEFAULTS, { ...HARDWARE_DEFAULTS, batteryCapacityAh: 1 });
  const large = estimateHardware(DEFAULTS, { ...HARDWARE_DEFAULTS, batteryCapacityAh: 4 });
  assert.ok(large.estimatedRuntimeMinutes > small.estimatedRuntimeMinutes * 3.9);
  assert.equal(large.averagePowerW, small.averagePowerW);
});

test("faster gait increases electrical demand", () => {
  const slow = estimateHardware({ ...DEFAULTS, frequency: 0.5 });
  const fast = estimateHardware({ ...DEFAULTS, frequency: 2 });
  assert.ok(fast.averagePowerW > slow.averagePowerW);
  assert.ok(fast.requiredStallTorqueNm > slow.requiredStallTorqueNm);
});
