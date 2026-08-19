import assert from "node:assert/strict";
import test from "node:test";
import {
  bundledOutcomePacks,
  compilePack,
  skillInstallSource,
  skillNameFromReference,
  skillPageUrl,
  skillSourceUrl,
} from "../dist/index.js";

const standardKeys = new Set(["schemaVersion", "name", "promise", "prompt", "skills", "products", "expectations", "notFor"]);

test("all bundled outcomes compile from one prompt with optional expectations and Skills", () => {
  assert.ok(bundledOutcomePacks.length > 0);
  for (const { slug, pack } of bundledOutcomePacks) {
    for (const key of Object.keys(pack)) assert.ok(standardKeys.has(key), `${slug} has non-standard key ${key}`);
    assert.ok(pack.prompt.trim());
    const skills = pack.skills ?? [];
    const expectations = pack.expectations ?? [];
    assert.ok(expectations.every((expectation) => typeof expectation === "string" && expectation.trim()));
    assert.doesNotMatch(pack.prompt, /^## (?:Final checks|Finish and verify)$/m);
    const compiled = compilePack(pack);
    assert.equal(compiled.installCommands.length, skills.length);
    assert.ok(compiled.runPrompt.startsWith(pack.prompt));
    if (expectations.length > 0) {
      if (skills.length > 0) assert.match(compiled.runPrompt, /SKILLS/);
      assert.match(compiled.runPrompt, /EXPECTATIONS/);
      assert.equal(compiled.runPrompt.match(/cheapest reliable method available/g)?.length, 1);
      assert.match(compiled.runPrompt, /Do not create extra verification artifacts/);
    } else {
      assert.equal(compiled.runPrompt, pack.prompt.trim());
      assert.doesNotMatch(compiled.runPrompt, /\nEXPECTATIONS\n/);
    }
    assert.doesNotMatch(compiled.runPrompt, /WORKSTREAMS|RUN EVIDENCE|outcome-record\.json/);
    for (const skill of skills) {
      assert.match(skill.lastReviewedCommit, /^(?:[0-9a-f]{40}|[0-9a-f]{64})$/);
      assert.ok(compiled.installCommands.includes(`npx skills@1.5.22 add ${skillInstallSource(skill)} --agent codex`));
      assert.match(skillPageUrl(skill), new RegExp(`^https://skills\\.sh/${skill.repository}/`));
      assert.match(skillSourceUrl(skill), new RegExp(`^https://github\\.com/${skill.repository}/tree/${skill.lastReviewedCommit}`));
      if (expectations.length > 0) assert.match(compiled.runPrompt, new RegExp(`\\$${skillNameFromReference(skill)}(?:\\n|$)`));
    }
  }
});

test("a pack without additional Skills compiles directly to prompt and expectations", () => {
  const pack = structuredClone(bundledOutcomePacks[0].pack);
  delete pack.skills;
  const compiled = compilePack(pack);
  assert.deepEqual(compiled.installCommands, []);
  assert.doesNotMatch(compiled.runPrompt, /\nSKILLS\n/);
  assert.match(compiled.runPrompt, /\nEXPECTATIONS\n/);
});

test("compileInstallCommands targets the Skill directory through the standard installer", () => {
  const pack = bundledOutcomePacks.find(({ slug }) => slug === "html-css-animated-product-launch-film")?.pack;
  assert.ok(pack);
  const compiled = compilePack(pack);
  assert.ok(compiled.installCommands.some((command) => command.includes("heygen-com/hyperframes/skills/hyperframes --agent codex")));
});

test("a direct outcome keeps its exact prompt byte-for-byte after trimming", () => {
  const pack = bundledOutcomePacks.find(({ slug }) => slug === "html-css-animated-product-launch-film")?.pack;
  assert.ok(pack);
  assert.equal(pack.expectations, undefined);
  assert.equal(compilePack(pack).runPrompt, pack.prompt.trim());
});

test("Product attribution never changes or duplicates Skill installation", () => {
  const source = bundledOutcomePacks.find(({ slug }) => slug === "html-css-animated-product-launch-film")?.pack;
  assert.ok(source);
  const withProduct = compilePack(source);
  const withoutProduct = structuredClone(source);
  delete withoutProduct.products;
  const withoutProductMetadata = compilePack(withoutProduct);
  assert.deepEqual(withProduct.installCommands, withoutProductMetadata.installCommands);
  assert.equal(withProduct.runPrompt, withoutProductMetadata.runPrompt);
  assert.doesNotMatch(withProduct.runPrompt, /HeyGen|HyperFrames product/i);
});
