import test from "node:test";
import assert from "node:assert/strict";
import { DEFAULTS, createSnake, jointTarget, resolveCollisions, segmentPoses, stepSnake } from "../src/snake.js";

test("joint targets form a traveling wave", () => {
  assert.notEqual(jointTarget(0, 0), jointTarget(1, 0));
  assert.ok(Math.abs(jointTarget(0, 0)) <= DEFAULTS.amplitude);
});

test("forward input moves the head forward", () => {
  const moved = stepSnake(createSnake(), { drive: 1, steer: 0 }, 0.1);
  assert.ok(moved.x > 0);
  assert.equal(moved.y, 0);
});

test("steering changes heading and reverse flips steering", () => {
  const forward = stepSnake(createSnake(), { drive: 1, steer: 1 }, 0.1);
  const reverse = stepSnake(createSnake(), { drive: -1, steer: 1 }, 0.1);
  assert.ok(forward.heading > 0);
  assert.ok(reverse.heading < 0);
});

test("segment chain contains the requested number of fixed-length links", () => {
  const poses = segmentPoses(createSnake());
  assert.equal(poses.length, DEFAULTS.segmentCount);
  for (let i = 1; i < poses.length; i += 1) {
    assert.ok(Math.abs(Math.hypot(poses[i].x - poses[i - 1].x, poses[i].y - poses[i - 1].y) - DEFAULTS.segmentLength) < 1e-9);
  }
});

test("joint targets and movement obey angle and rate limits", () => {
  const params = { ...DEFAULTS, amplitude: 2, maxJointAngle: 0.5, maxJointSpeed: 1 };
  assert.ok(Math.abs(jointTarget(2, 0, params)) <= 0.5);
  const moved = stepSnake(createSnake(0, 0, params), { drive: 0, steer: 0 }, 0.01, params);
  assert.ok(moved.joints.every(angle => Math.abs(angle) <= 0.01 + 1e-12));
});

test("collision resolution separates every segment from circular obstacles", () => {
  const params = { ...DEFAULTS, segmentCount: 3, segmentLength: 26, bodyRadius: 10 };
  const obstacle = { x: 0, y: 0, radius: 20 };
  const resolved = resolveCollisions(createSnake(0, 0, params), [obstacle], params);
  assert.ok(resolved.collisions > 0);
  for (const pose of segmentPoses(resolved, params)) {
    assert.ok(Math.hypot(pose.x - obstacle.x, pose.y - obstacle.y) >= 30 - 1e-8);
  }
});

test("telemetry accumulates commanded travel", () => {
  const first = stepSnake(createSnake(), { drive: 1, steer: 0 }, 0.1);
  const second = stepSnake(first, { drive: 1, steer: 0 }, 0.1);
  assert.ok(second.distance > first.distance);
});
