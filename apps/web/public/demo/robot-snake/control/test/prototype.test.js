import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { DEFAULTS } from "../src/snake.js";
import { estimateHardware, HARDWARE_DEFAULTS } from "../src/hardware.js";

const prototype = JSON.parse(await readFile(new URL("../hardware/prototype.json", import.meta.url)));
const firmware = await readFile(new URL("../firmware/robot_snake/robot_snake.ino", import.meta.url), "utf8");

test("selected servo exceeds the simulated full-chain torque envelope", () => {
  const estimate = estimateHardware(DEFAULTS, HARDWARE_DEFAULTS);
  assert.ok(prototype.servos.stallTorqueKgCm >= estimate.requiredStallTorqueKgCm * 2);
});

test("prototype fuse exceeds combined servo stall current", () => {
  const combinedStall = prototype.servos.count * prototype.servos.stallCurrentAEach;
  assert.ok(prototype.protection.servoBranchFuseA > combinedStall);
  assert.ok(prototype.protection.servoBranchFuseA <= 10);
});

test("machine-readable pins and watchdog match firmware", () => {
  for (const pin of prototype.pins.jointSignals) assert.match(firmware, new RegExp(`\\b${pin}\\b`));
  assert.match(firmware, new RegExp(`ESTOP_SENSE_PIN = ${prototype.pins.physicalEstopSense}\\b`));
  assert.match(firmware, new RegExp(`WATCHDOG_MS = ${prototype.protection.firmwareWatchdogMs}\\b`));
  assert.match(firmware, /digitalRead\(ESTOP_SENSE_PIN\) != LOW/);
});

test("malformed serial commands do not refresh the watchdog", () => {
  const handler = firmware.slice(firmware.indexOf("void handleCommand"), firmware.indexOf("void updateJoints"));
  const errorPosition = handler.indexOf('Serial.println("ERR,COMMAND")');
  assert.ok(errorPosition > 0);
  assert.equal(handler.slice(errorPosition).includes("lastCommandMs = millis()"), false);
});
