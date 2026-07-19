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
    "working-web-app",
    "production-web-release",
  ]);
  assert.deepEqual(outcomePacks.map(({ slug, lane }) => [slug, lane]), [
    ["hardware-launch", "launch"],
    ["software-launch", "launch"],
    ["open-source-release", "release"],
    ["playable-web-game", "create"],
    ["web-app-operations", "operate"],
    ["working-web-app", "create"],
    ["production-web-release", "release"],
  ]);
  assert.deepEqual(outcomePacks.map((pack) => pack.catalogNumber), [1, 2, 3, 4, 5, 6, 7]);
  assert.equal(new Set(outcomePacks.map((pack) => pack.catalogNumber)).size, outcomePacks.length);
  assert.equal(new Set(outcomePacks.map((pack) => pack.slug)).size, outcomePacks.length);

  for (const pack of outcomePacks) {
    assert.ok(["create", "launch", "release", "operate"].includes(pack.lane));
    assert.match(pack.eyebrow, new RegExp(`^${String(pack.catalogNumber).padStart(2, "0")} / `));
    for (const forbidden of ["lanes", "category", "categories", "track", "tracks"]) assert.equal(forbidden in pack, false);
    const compiled = compilePack(pack);
    assert.equal(compiled.pack.lane, pack.lane);
    assert.ok(compiled.installCommands.length >= 1);
    assert.ok(pack.skills.length >= 3);
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
    for (const plugin of pack.plugins ?? []) {
      assert.match(plugin.invocation, /^@/);
      assert.ok(plugin.skills.length >= 1);
      assert.match(compiled.runPrompt, new RegExp(plugin.invocation.replace("@", "@")));
      for (const skill of plugin.skills) assert.match(compiled.runPrompt, new RegExp("\\$" + skill));
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
  const bySlug = (slug) => compilePack(outcomePacks.find((pack) => pack.slug === slug));
  const software = bySlug("software-launch");
  assert.equal(software.installCommands.length, 3);
  assert.match(software.installCommands[0], /anthropics\/skills.+frontend-design.+webapp-testing.+--agent codex/);
  assert.match(software.installCommands[1], /vercel-labs\/agent-skills.+vercel-react-best-practices.+web-design-guidelines.+deploy-to-vercel/);
  assert.equal(software.pack.plugins[0].invocation, "@sites");
  assert.deepEqual(software.pack.plugins[0].skills, ["sites-building", "sites-hosting"]);
  assert.match(software.runPrompt, /prefer it for the MVP deployment path so the user does not need a separate Vercel registration/i);
  assert.match(software.runPrompt, /Keep \$sites-hosting with the captain/);
  assert.deepEqual(software.pack.workstreams.find((stream) => stream.id === "release").skills, ["web-design-guidelines"]);

  const openSource = bySlug("open-source-release");
  assert.equal(openSource.installCommands.length, 1);
  assert.match(openSource.installCommands[0], /github\/awesome-copilot.+github-release.+create-readme.+documentation-writer.+github-actions-hardening.+security-review/);

  const game = bySlug("playable-web-game");
  assert.equal(game.installCommands.length, 3);
  assert.match(game.installCommands[0], /mrgoonie\/claudekit-skills.+threejs/);
  assert.match(game.installCommands[1], /dylantarre\/animation-principles.+game-designer.+mobile-touch/);
  assert.match(game.installCommands[2], /anthropics\/skills.+frontend-design.+webapp-testing/);

  const operations = bySlug("web-app-operations");
  assert.equal(operations.installCommands.length, 2);
  assert.match(operations.installCommands[0], /anthropics\/skills.+webapp-testing/);
  assert.match(operations.installCommands[1], /github\/awesome-copilot.+impediment-prioritization.+dependabot.+security-review.+devops-rollout-plan.+incident-postmortem/);
  assert.match(operations.runPrompt, /OPERATING LOOP/);
  assert.match(operations.runPrompt, /prior receipt/);
  assert.match(operations.runPrompt, /YYYY-MM-DDTHHMMSSZ\.md/);
  assert.match(operations.runPrompt, /First dated operations receipt/);

  const working = bySlug("working-web-app");
  assert.equal(working.installCommands.length, 2);
  assert.match(working.installCommands[0], /anthropics\/skills.+frontend-design.+webapp-testing/);
  assert.match(working.installCommands[1], /github\/awesome-copilot.+security-review/);
  assert.match(working.runPrompt, /^Build the Working Web App outcome/);

  const production = bySlug("production-web-release");
  assert.equal(production.installCommands.length, 3);
  assert.match(production.installCommands[0], /github\/awesome-copilot.+devops-rollout-plan.+github-actions-hardening.+security-review/);
  assert.match(production.installCommands[1], /anthropics\/skills.+webapp-testing/);
  assert.match(production.installCommands[2], /vercel-labs\/agent-skills.+deploy-to-vercel/);
  assert.match(production.runPrompt, /^Prepare and verify the Production Web Release outcome/);
  assert.match(production.runPrompt, /RELEASE GATE/);
  assert.match(production.runPrompt, /explicit approval for the exact candidate, target, method, and known risks/);
  assert.match(production.runPrompt, /captain invokes the selected deployment adapter: \$sites-hosting for OpenAI Sites or \$deploy-to-vercel for Vercel/);
  assert.equal(production.pack.plugins[0].invocation, "@sites");
  assert.deepEqual(production.pack.workstreams.find((stream) => stream.id === "delivery").skills, ["github-actions-hardening"]);
});

test("Sites is exposed only on web deployment outcomes and never as a fake Skills CLI install", () => {
  const sitesPacks = outcomePacks.filter((pack) => pack.plugins?.some((plugin) => plugin.id === "sites"));
  assert.deepEqual(sitesPacks.map((pack) => pack.slug), ["hardware-launch", "software-launch", "production-web-release"]);
  for (const pack of sitesPacks) {
    const compiled = compilePack(pack);
    assert.doesNotMatch(compiled.installCommands.join("\n"), /sites|openai-bundled/i);
    assert.match(compiled.runPrompt, /every Sites deployment URL as production/i);
    assert.match(compiled.runPrompt, /explicit approval/);
  }
});

test("the web-app lifecycle packs have non-overlapping entry conditions", () => {
  const pack = (slug) => outcomePacks.find((candidate) => candidate.slug === slug);
  assert.match(pack("working-web-app").useWhen.join(" "), /first coherent|first complete|first.*usable/i);
  assert.match(pack("software-launch").useWhen.join(" "), /existing working software product/i);
  assert.match(pack("software-launch").notFor.join(" "), /first complete usable application/i);
  assert.match(pack("production-web-release").useWhen.join(" "), /existing tested web app/i);
  assert.match(pack("web-app-operations").useWhen.join(" "), /already live/i);
});
