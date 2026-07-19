import assert from "node:assert/strict";
import test from "node:test";
import { compilePack, outcomePacks } from "../dist/index.js";

test("every outcome pack compiles to inspectable installs and a complete prompt", () => {
  assert.deepEqual(outcomePacks.map((pack) => pack.slug), [
    "hardware-launch",
    "software-launch",
    "open-source-release",
    "playable-web-game",
    "web-app-operations",
  ]);
  assert.deepEqual(outcomePacks.map(({ slug, lane }) => [slug, lane]), [
    ["hardware-launch", "launch"],
    ["software-launch", "launch"],
    ["open-source-release", "release"],
    ["playable-web-game", "create"],
    ["web-app-operations", "operate"],
  ]);

  for (const pack of outcomePacks) {
    assert.ok(["create", "launch", "release", "operate"].includes(pack.lane));
    for (const forbidden of ["lanes", "category", "categories", "track", "tracks"]) assert.equal(forbidden in pack, false);
    const compiled = compilePack(pack);
    assert.equal(compiled.pack.lane, pack.lane);
    assert.ok(compiled.installCommands.length >= 1);
    assert.ok(pack.skills.length >= 5);
    assert.ok(pack.workstreams.length >= 3);
    assert.ok(pack.outputs.length >= 5);
    assert.ok(pack.useWhen.length >= 2);
    assert.ok(pack.notFor.length >= 2);
    assert.equal(new Set(pack.useWhen).size, pack.useWhen.length);
    assert.equal(new Set(pack.notFor).size, pack.notFor.length);
    for (const source of pack.skills) {
      assert.match(compiled.runPrompt, new RegExp("\\$" + source.skill.replaceAll("-", "\\-")));
      assert.equal(source.reviewedRevision.length, 40);
      assert.match(source.reviewUrl, new RegExp(source.reviewedRevision));
    }
    for (const reviewer of pack.reviewSkills) assert.match(compiled.runPrompt, new RegExp("\\$" + reviewer));
    assert.match(compiled.runPrompt, /Do not create one subagent per skill/);
    assert.match(compiled.runPrompt, /fresh verification subagent/);
    assert.match(compiled.runPrompt, /explicit approval|explicitly tested|direct evidence/i);
    assert.match(compiled.runPrompt, /passed\/failed\/skipped/);
    assert.doesNotMatch(compiled.runPrompt, /choose a lane|\nLANE\n/i);
  }
});

test("install commands group skills by upstream repository", () => {
  const software = compilePack(outcomePacks[1]);
  assert.equal(software.installCommands.length, 3);
  assert.match(software.installCommands[0], /anthropics\/skills.+frontend-design.+webapp-testing.+--agent codex/);
  assert.match(software.installCommands[1], /vercel-labs\/agent-skills.+vercel-react-best-practices.+web-design-guidelines.+deploy-to-vercel/);

  const openSource = compilePack(outcomePacks[2]);
  assert.equal(openSource.installCommands.length, 1);
  assert.match(openSource.installCommands[0], /github\/awesome-copilot.+github-release.+create-readme.+documentation-writer.+github-actions-hardening.+security-review/);

  const game = compilePack(outcomePacks[3]);
  assert.equal(game.installCommands.length, 3);
  assert.match(game.installCommands[0], /mrgoonie\/claudekit-skills.+threejs/);
  assert.match(game.installCommands[1], /dylantarre\/animation-principles.+game-designer.+mobile-touch/);
  assert.match(game.installCommands[2], /anthropics\/skills.+frontend-design.+webapp-testing/);

  const operations = compilePack(outcomePacks[4]);
  assert.equal(operations.installCommands.length, 2);
  assert.match(operations.installCommands[0], /anthropics\/skills.+webapp-testing/);
  assert.match(operations.installCommands[1], /github\/awesome-copilot.+impediment-prioritization.+dependabot.+security-review.+devops-rollout-plan.+incident-postmortem/);
  assert.match(operations.runPrompt, /OPERATING LOOP/);
  assert.match(operations.runPrompt, /prior receipt/);
  assert.match(operations.runPrompt, /YYYY-MM-DDTHHMMSSZ\.md/);
  assert.match(operations.runPrompt, /First dated operations receipt/);
});
