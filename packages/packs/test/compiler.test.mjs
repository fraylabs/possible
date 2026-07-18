import assert from "node:assert/strict";
import test from "node:test";
import { compilePack, hardwareLaunchPack } from "../dist/index.js";

test("Hardware Launch compiles to inspectable installs and a complete run prompt", () => {
  const compiled = compilePack(hardwareLaunchPack);
  assert.equal(compiled.installCommands.length, 4);
  assert.equal(hardwareLaunchPack.skills.length, 5);
  assert.match(compiled.installCommands[0], /anthropics\/skills.+frontend-design.+webapp-testing.+--agent codex/);
  for (const source of hardwareLaunchPack.skills) {
    assert.match(compiled.runPrompt, new RegExp(`\\$${source.skill.replaceAll("-", "\\-")}`));
    assert.equal(source.reviewedRevision.length, 40);
  }
  assert.match(compiled.runPrompt, /Do not create one subagent per skill/);
  assert.match(compiled.runPrompt, /fresh verification subagent/);
  assert.match(compiled.runPrompt, /Do not deploy, purchase, fabricate/);
  assert.doesNotMatch(compiled.runPrompt, /customer demand is proven|manufacturing-ready/i);
});
