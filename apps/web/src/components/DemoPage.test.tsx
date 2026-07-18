import { describe, expect, it } from "vitest";
import { DEMO_DURATION_MS, demoSceneAt } from "./DemoPage";

describe("scripted demo timeline", () => {
  it.each([
    [0, "intro"],
    [1_999, "intro"],
    [2_000, "outcome"],
    [9_999, "outcome"],
    [10_000, "research"],
    [20_999, "research"],
    [21_000, "execution"],
    [30_999, "execution"],
    [31_000, "final"],
    [DEMO_DURATION_MS, "final"],
  ] as const)("shows %s ms as the %s scene", (elapsed, scene) => {
    expect(demoSceneAt(elapsed)).toBe(scene);
  });
});
