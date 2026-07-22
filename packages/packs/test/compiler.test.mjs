import assert from "node:assert/strict";
import test from "node:test";
import { compileChain, compilePack, compileWorkstreamWaves, experimentalOutcomePacks, getPackStatus, outcomePacks, stableOutcomePacks } from "../dist/index.js";

test("every outcome pack compiles to inspectable installs and a complete prompt", () => {
  assert.deepEqual(outcomePacks.map((pack) => pack.slug), [
    "hardware-launch",
    "software-launch",
    "open-source-release",
    "playable-web-game",
    "web-app-operations",
    "working-web-app",
    "production-web-release",
    "marketing-operations",
    "billion-dollar-saas",
    "kickstarter-funding",
    "kickstarter-fulfillment",
    "robot-prototype",
    "web-presentation",
    "developer-project-launch",
    "software-opportunity-discovery",
  ]);
  assert.deepEqual(outcomePacks.map(({ slug, lane }) => [slug, lane]), [
    ["hardware-launch", "launch"],
    ["software-launch", "launch"],
    ["open-source-release", "release"],
    ["playable-web-game", "create"],
    ["web-app-operations", "operate"],
    ["working-web-app", "create"],
    ["production-web-release", "release"],
    ["marketing-operations", "operate"],
    ["billion-dollar-saas", "create"],
    ["kickstarter-funding", "launch"],
    ["kickstarter-fulfillment", "operate"],
    ["robot-prototype", "create"],
    ["web-presentation", "create"],
    ["developer-project-launch", "launch"],
    ["software-opportunity-discovery", "create"],
  ]);
  assert.deepEqual(outcomePacks.map((pack) => pack.catalogNumber), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
  assert.equal(new Set(outcomePacks.map((pack) => pack.catalogNumber)).size, outcomePacks.length);
  assert.equal(new Set(outcomePacks.map((pack) => pack.slug)).size, outcomePacks.length);
  assert.deepEqual(stableOutcomePacks.map((pack) => pack.slug), [
    "hardware-launch",
    "playable-web-game",
    "robot-prototype",
    "web-presentation",
  ]);
  assert.equal(experimentalOutcomePacks.length, 11);
  assert.equal(getPackStatus("hardware-launch"), "stable");
  assert.equal(getPackStatus("software-launch"), "experimental");
  assert.equal(getPackStatus("missing"), undefined);

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
      assert.ok(
        compiled.installCommands.some((command) => command.includes(`@${source.reviewedRevision}`) && command.includes(`--skill ${source.skill}`)),
        `${source.id} must install the reviewed revision`,
      );
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

test("custom install sources cannot drift from the reviewed revision", () => {
  const pack = structuredClone(outcomePacks[0]);
  pack.skills[0].installSource = `${pack.skills[0].repository}@main`;
  assert.throws(() => compilePack(pack), /must install the exact reviewed revision/);
});

test("Developer Project Launch remixes project-specific direction before implementation", () => {
  const developer = outcomePacks.find((pack) => pack.slug === "developer-project-launch");
  assert.ok(developer);
  assert.deepEqual(compileWorkstreamWaves(developer).map((wave) => wave.map(({ id }) => id)), [
    ["positioning", "developer-experience"],
    ["creative-direction"],
    ["showcase"],
  ]);
  assert.equal(developer.remix?.candidateCount, 3);
  assert.equal(developer.remix?.decisionPath, "launch/direction/decision.json");
  assert.deepEqual(developer.workstreams.find(({ id }) => id === "showcase")?.dependsOn, ["positioning", "developer-experience", "creative-direction"]);
  const prompt = compilePack(developer).runPrompt;
  assert.match(prompt, /REMIX GATE/);
  assert.match(prompt, /exactly 3 project-specific directions/i);
  assert.match(prompt, /same truthful copy, content, and viewport/i);
  assert.match(prompt, /differ materially in at least three/i);
  assert.match(prompt, /Never randomize.*design jargon/is);
  assert.match(prompt, /Otherwise select the best-supported direction/i);
  assert.match(prompt, /launch\/direction\/decision\.json/);
  assert.match(prompt, /does not silently change claims, documentation, product behavior/i);

  const missing = structuredClone(developer);
  missing.remix.workstreamId = "missing";
  assert.throws(() => compilePack(missing), /does not exist/);
  const unsafe = structuredClone(developer);
  unsafe.remix.previewRoot = "../outside";
  assert.throws(() => compilePack(unsafe), /safe repository-relative path/);
  const wrongCount = structuredClone(developer);
  wrongCount.remix.candidateCount = 4;
  assert.throws(() => compilePack(wrongCount), /exactly three directions/);

  const missingDependency = structuredClone(developer);
  missingDependency.workstreams[0].dependsOn = ["missing"];
  assert.throws(() => compileWorkstreamWaves(missingDependency), /depends on missing workstream/);
  const cycle = structuredClone(developer);
  cycle.workstreams.find(({ id }) => id === "positioning").dependsOn = ["creative-direction"];
  assert.throws(() => compileWorkstreamWaves(cycle), /dependency cycle/);

  assert.doesNotMatch(compilePack(outcomePacks.find((pack) => pack.slug === "hardware-launch")).runPrompt, /REMIX GATE/);
});

test("Outcome Chains advance verified stages without inheriting approval", () => {
  const pack = (slug) => outcomePacks.find((candidate) => candidate.slug === slug);
  const discovery = pack("software-opportunity-discovery");
  const working = pack("working-web-app");
  const developer = pack("developer-project-launch");
  const chain = compileChain([discovery, working, developer]);
  assert.deepEqual(chain.handoffs.map(({ from, to }) => [from, to]), [
    ["software-opportunity-discovery", "working-web-app"],
    ["working-web-app", "developer-project-launch"],
  ]);
  assert.deepEqual(discovery.chainExit, {
    receiptPath: "outcome-room/decision-receipt.json",
    advanceStatuses: ["pursue"],
    pauseStatuses: ["investigate"],
    stopStatuses: ["no-go"],
  });
  assert.equal(developer.chainEntry.find(({ id }) => id === "working-project").satisfyWithPack, "working-web-app");
  assert.match(chain.runPrompt, /Software Opportunity Discovery.*Working Web App.*Developer Project Launch/s);
  assert.match(chain.runPrompt, /\.possible\/chain\.json/);
  assert.match(chain.runPrompt, /\.possible\/runs\/<run-id>/);
  assert.match(chain.runPrompt, /hashed handoff/);
  assert.match(chain.runPrompt, /facts, hypotheses, decisions, constraints, unknowns, and evidence as distinct fields/i);
  assert.match(chain.runPrompt, /fresh reviewer/i);
  assert.match(chain.runPrompt, /NOW \/ IF THIS PASSES \/ LATER/);
  assert.match(chain.runPrompt, /Source approval never approves the destination/i);
  assert.match(chain.runPrompt, /resume idempotent/i);

  const direct = compileChain([discovery, developer]);
  assert.match(direct.runPrompt, /If missing, propose working-web-app before continuing/i);
  assert.throws(() => compileChain([discovery]), /at least two/);
  assert.throws(() => compileChain([discovery, discovery]), /cannot repeat/);
  assert.throws(() => compileChain([pack("hardware-launch"), developer]), /does not define a chain exit/);
  assert.throws(() => compileChain([discovery, pack("hardware-launch")]), /does not define chain entry/);
  const overlap = structuredClone(discovery);
  overlap.chainExit.pauseStatuses = ["pursue"];
  assert.throws(() => compileChain([overlap, working]), /non-empty and disjoint/);
  const unsafe = structuredClone(discovery);
  unsafe.chainExit.receiptPath = "../receipt.json";
  assert.throws(() => compileChain([unsafe, working]), /safe repository-relative path/);
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
  assert.match(software.runPrompt, /Keep \$sites-hosting with the lead agent/);
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
  assert.match(operations.runPrompt, /prior completion report/);
  assert.match(operations.runPrompt, /YYYY-MM-DDTHHMMSSZ\.md/);
  assert.match(operations.runPrompt, /First dated operations completion report/);
  assert.match(operations.runPrompt, /SCHEDULE GATE/);
  assert.match(operations.runPrompt, /invokes \$possible resume/);
  assert.match(operations.runPrompt, /isolated worktree/);
  assert.match(operations.runPrompt, /Request direct approval for that exact schedule/);
  assert.match(operations.runPrompt, /scheduling-ready prompt and a completion report with a no-go status/);

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
  assert.match(production.runPrompt, /lead agent invokes the selected deployment adapter: \$sites-hosting for OpenAI Sites or \$deploy-to-vercel for Vercel/);
  assert.equal(production.pack.plugins[0].invocation, "@sites");
  assert.deepEqual(production.pack.workstreams.find((stream) => stream.id === "delivery").skills, ["github-actions-hardening"]);

  const robot = bySlug("robot-prototype");
  assert.equal(robot.installCommands.length, 3);
  assert.match(robot.installCommands[0], /fraylabs\/possible.+mujoco-robotics/);
  assert.match(robot.installCommands[1], /earthtojake\/text-to-cad.+cad.+step-parts.+urdf.+srdf.+cad-viewer/);
  assert.match(robot.installCommands[2], /arpitg1304\/robotics-agent-skills.+robotics-design-patterns.+robotics-software-principles.+ros2-development.+robotics-testing/);
  assert.match(robot.runPrompt, /MuJoCo simulation and control baseline/);
  assert.match(robot.runPrompt, /Do not connect to, commission, or command physical hardware/i);

  const presentation = bySlug("web-presentation");
  assert.equal(presentation.installCommands.length, 4);
  assert.match(presentation.installCommands[0], /coreyhaines31\/marketingskills.+copywriting/);
  assert.match(presentation.installCommands[1], /zarazhangrui\/frontend-slides.+frontend-slides/);
  assert.match(presentation.installCommands[2], /pbakaus\/impeccable.+impeccable/);
  assert.match(presentation.installCommands[3], /anthropics\/skills.+webapp-testing/);
  assert.match(presentation.runPrompt, /Coded presentation and presenter experience/);
  assert.match(presentation.runPrompt, /Impeccable hooks.*separate inspection and approval/i);
  assert.equal(presentation.pack.plugins[0].invocation, "@sites");
});

test("Web Presentation produces a coded, evidence-backed deck instead of a PowerPoint file", () => {
  const presentation = outcomePacks.find((pack) => pack.slug === "web-presentation");
  assert.ok(presentation);
  assert.equal(presentation.catalogNumber, 13);
  assert.equal(presentation.lane, "create");
  assert.match(presentation.promise, /runs in the browser/i);
  assert.match(presentation.useWhen.join(" "), /HTML, CSS, and JavaScript instead of PowerPoint/i);
  assert.match(presentation.outputs.join(" "), /coded browser presentation.*presenter-note controls.*PDF export.*contact sheet/i);
  assert.deepEqual(presentation.reviewSkills, ["webapp-testing", "impeccable"]);
  assert.match(presentation.guardrails.join(" "), /Do not invent citations, evidence, metrics, testimonials/i);
  assert.match(presentation.verification.join(" "), /1920×1080.*contact sheet.*keyboard and touch.*reduced-motion.*rehearsal time/i);

  const skillIds = new Set(presentation.skills.map((skill) => skill.id));
  for (const required of ["copywriting", "frontend-slides", "impeccable", "webapp-testing"]) {
    assert.equal(skillIds.has(required), true, `missing ${required}`);
  }
});

test("Robot Prototype generalizes one verified digital-prototype contract across robot forms", () => {
  const robot = outcomePacks.find((pack) => pack.slug === "robot-prototype");
  assert.ok(robot);
  assert.equal(robot.catalogNumber, 12);
  assert.equal(robot.lane, "create");
  assert.match(robot.useWhen.join(" "), /robot hand.*gripper.*arm.*mobile robot.*quadruped.*full robot/i);
  assert.match(robot.outputs.join(" "), /STEP assembly.*robot-description.*MuJoCo.*controller.*simulation tests.*sim-to-real gap/i);
  assert.deepEqual(robot.reviewSkills, ["robotics-testing", "cad-viewer"]);

  const skillIds = new Set(robot.skills.map((skill) => skill.id));
  for (const required of ["mujoco-robotics", "cad", "step-parts", "urdf", "srdf", "cad-viewer", "robotics-design-patterns", "robotics-software-principles", "ros2-development", "robotics-testing"]) {
    assert.equal(skillIds.has(required), true, `missing ${required}`);
  }

  const owned = robot.workstreams.flatMap((stream) => stream.owns.map((path) => ({ stream: stream.id, path })));
  for (const left of owned) {
    for (const right of owned) {
      if (left.stream === right.stream) continue;
      assert.equal(left.path.startsWith(right.path) || right.path.startsWith(left.path), false, `${left.path} overlaps ${right.path}`);
    }
  }
});

test("Sites is exposed only on web deployment outcomes and never as a fake Skills CLI install", () => {
  const sitesPacks = outcomePacks.filter((pack) => pack.plugins?.some((plugin) => plugin.id === "sites"));
  assert.deepEqual(sitesPacks.map((pack) => pack.slug), ["hardware-launch", "software-launch", "production-web-release", "web-presentation", "developer-project-launch"]);
  for (const pack of sitesPacks) {
    const compiled = compilePack(pack);
    assert.doesNotMatch(compiled.installCommands.join("\n"), /sites|openai-bundled/i);
    assert.match(compiled.runPrompt, /every Sites deployment URL as production/i);
    assert.match(compiled.runPrompt, /explicit approval/);
  }
});

test("Developer Project Launch turns a working developer project into an evidence-backed adoption path", () => {
  const developer = outcomePacks.find((pack) => pack.slug === "developer-project-launch");
  const software = outcomePacks.find((pack) => pack.slug === "software-launch");
  const openSource = outcomePacks.find((pack) => pack.slug === "open-source-release");
  assert.ok(developer);
  assert.equal(developer.catalogNumber, 14);
  assert.equal(developer.lane, "launch");
  assert.match(developer.eyebrow, /EXPERIMENTAL/);
  assert.match(developer.useWhen.join(" "), /working CLI.*library.*API.*developer platform/i);
  assert.match(developer.notFor.join(" "), /core product.*Software Launch/i);
  assert.match(developer.notFor.join(" "), /repository release engineering.*Open-Source Release/i);
  assert.match(software.notFor.join(" "), /Developer Project Launch/i);
  assert.match(openSource.notFor.join(" "), /Developer Project Launch/i);

  const outputs = developer.outputs.join(" ");
  assert.match(outputs, /positioning.*claims register/i);
  assert.match(outputs, /responsive project launch site/i);
  assert.match(outputs, /demonstration/i);
  assert.match(outputs, /five-minute quickstart/i);
  assert.match(outputs, /smallest runnable example/i);
  assert.match(outputs, /launch receipt/i);

  const skillIds = new Set(developer.skills.map(({ id }) => id));
  for (const required of ["copywriting", "frontend-design", "impeccable", "create-readme", "documentation-writer", "webapp-testing", "web-design-guidelines"]) {
    assert.equal(skillIds.has(required), true, `missing ${required}`);
  }
  assert.notDeepEqual([...skillIds].sort(), software.skills.map(({ id }) => id).sort());

  const owned = developer.workstreams.flatMap((stream) => stream.owns.map((path) => ({ stream: stream.id, path })));
  for (const item of owned) {
    assert.doesNotMatch(item.path, /^(?:\/|[A-Za-z]:)|\.\.|[*?]/, `unsafe ownership path: ${item.path}`);
    for (const other of owned) {
      if (item.stream === other.stream) continue;
      const left = item.path.replace(/\/+$/, "");
      const right = other.path.replace(/\/+$/, "");
      assert.equal(left === right || left.startsWith(`${right}/`) || right.startsWith(`${left}/`), false, `${item.path} overlaps ${other.path}`);
    }
  }

  const compiled = compilePack(developer);
  assert.equal(compiled.installCommands.length, 5);
  assert.match(compiled.runPrompt, /LAUNCH GATE/);
  assert.match(compiled.runPrompt, /local preparation only/i);
  assert.match(compiled.runPrompt, /exact candidate and immutable source, account or target, method, risks, and rollback/i);
  assert.match(compiled.runPrompt, /prepared or no-go—never launched/i);
  assert.match(developer.guardrails.join(" "), /deploy.*publish.*push.*tag.*release.*DNS.*analytics/i);
  assert.match(developer.verification.join(" "), /launch-receipt\.json.*prepared.*no-go.*published.*verified/i);
  assert.match(developer.verification.join(" "), /explicit approval evidence.*public URLs.*immutable source.*clean-room quickstart.*rollback target/i);
  assert.doesNotMatch(developer.outputs.join(" "), /\bLive launch\b/i);
});

test("Software Opportunity Discovery produces one traceable decision instead of a generic idea list", () => {
  const discovery = outcomePacks.find((pack) => pack.slug === "software-opportunity-discovery");
  const working = outcomePacks.find((pack) => pack.slug === "working-web-app");
  const company = outcomePacks.find((pack) => pack.slug === "billion-dollar-saas");
  assert.ok(discovery);
  assert.equal(discovery.catalogNumber, 15);
  assert.equal(discovery.lane, "create");
  assert.match(discovery.eyebrow, /EXPERIMENTAL/);
  assert.match(discovery.promise, /vague desire.*evidence-backed opportunity worth testing/i);
  assert.match(discovery.useWhen.join(" "), /developer.*does not yet know which problem or audience/i);
  assert.match(discovery.notFor.join(" "), /generic brainstorm/i);
  assert.match(working.notFor.join(" "), /Software Opportunity Discovery/i);
  assert.match(company.notFor.join(" "), /Software Opportunity Discovery/i);

  const skillIds = new Set(discovery.skills.map(({ id }) => id));
  assert.deepEqual([...skillIds], ["customer-research", "competitor-profiling", "product-marketing", "analytics"]);
  const compiled = compilePack(discovery);
  assert.equal(compiled.installCommands.length, 1);
  assert.match(compiled.installCommands[0], /coreyhaines31\/marketingskills@67264763cb107d61749f418d081c56e5bcbc0209/);
  for (const id of skillIds) assert.match(compiled.installCommands[0], new RegExp(`--skill ${id}`));

  const outputs = discovery.outputs.join(" ");
  assert.match(outputs, /source ledger.*customer-problem evidence/i);
  assert.match(outputs, /Three to five.*opportunity candidates/i);
  assert.match(outputs, /scorecard.*evidence and unknowns/i);
  assert.match(outputs, /recommended opportunity.*rejected alternatives/i);
  assert.match(outputs, /falsifiable validation experiment/i);
  assert.match(outputs, /pursue, investigate, or no-go decision receipt/i);

  const guardrails = discovery.guardrails.join(" ");
  assert.match(guardrails, /Never invent customer quotes.*demand.*market size.*willingness to pay/i);
  assert.match(guardrails, /Do not contact people.*publish surveys.*spend money/i);
  assert.match(guardrails, /no-go or research-incomplete result is valid/i);
  const verification = discovery.verification.join(" ");
  assert.match(verification, /multiple independent sources or mark its confidence low/i);
  assert.match(verification, /doing nothing.*strongest current alternative.*best rejected candidate/i);
  assert.match(verification, /decision-receipt\.json.*pursue.*investigate.*no-go/i);
  assert.match(verification, /Do not claim the opportunity is validated/i);

  const owned = discovery.workstreams.flatMap((stream) => stream.owns.map((path) => ({ stream: stream.id, path })));
  for (const item of owned) {
    assert.doesNotMatch(item.path, /^(?:\/|[A-Za-z]:)|\.\.|[*?]/, `unsafe ownership path: ${item.path}`);
    for (const other of owned) {
      if (item.stream === other.stream) continue;
      const left = item.path.replace(/\/+$/, "");
      const right = other.path.replace(/\/+$/, "");
      assert.equal(left === right || left.startsWith(`${right}/`) || right.startsWith(`${left}/`), false, `${item.path} overlaps ${other.path}`);
    }
  }
});

test("Marketing Operations compiles a manual-first, truthfully gated recurring schedule", () => {
  const marketing = outcomePacks.find((pack) => pack.slug === "marketing-operations");
  assert.ok(marketing, "Marketing Operations is present in the catalog");
  assert.equal(marketing.catalogNumber, 8);
  assert.equal(marketing.lane, "operate");
  assert.match(marketing.eyebrow, /^08 \/ /);
  assert.match(marketing.useWhen.join(" "), /schedule (?:recurring )?marketing operations/i);
  assert.match(marketing.promise, /repeatable|recurring/i);

  const compiled = compilePack(marketing);
  assert.match(compiled.installCommands[0], /coreyhaines31\/marketingskills@67264763cb107d61749f418d081c56e5bcbc0209/);
  assert.match(compiled.runPrompt, /^Establish and run the first cycle of the Marketing Operations outcome/);
  assert.match(compiled.runPrompt, /OPERATING LOOP/);
  assert.match(compiled.runPrompt, /marketing\/receipts\/YYYY-MM-DDTHHMMSSZ\.md/);
  assert.match(compiled.runPrompt, /SCHEDULE GATE/);
  assert.match(compiled.runPrompt, /manual first cycle/i);
  assert.match(compiled.runPrompt, /invokes \$possible resume/);
  assert.match(compiled.runPrompt, /isolated worktree and report-only behavior/);
  assert.match(compiled.runPrompt, /exact task name, cadence, timezone, project/);
  assert.match(compiled.runPrompt, /Request direct approval for that exact schedule/);
  assert.match(compiled.runPrompt, /\.possible\/schedule\.json/);
  assert.match(compiled.runPrompt, /scheduling-ready prompt and a completion report with a no-go status/);
  assert.match(compiled.runPrompt, /never gain unattended authority.*communication, spending, publishing/is);
  assert.equal(marketing.schedule.request, "I want to schedule marketing operations.");
  assert.match(marketing.schedule.safeDefault, /write-capable connectors/i);
  assert.match(marketing.notFor.join(" "), /application health checks|dependency maintenance/i);
  assert.match(marketing.notFor.join(" "), /one isolated post|landing page|email|campaign/i);

  const ownedPaths = marketing.workstreams.flatMap((stream) => stream.owns.map((path) => ({ stream: stream.id, path })));
  for (const left of ownedPaths) {
    for (const right of ownedPaths) {
      if (left.stream === right.stream) continue;
      assert.equal(left.path.startsWith(right.path) || right.path.startsWith(left.path), false, `${left.path} overlaps ${right.path}`);
    }
  }

  const guardrails = marketing.guardrails.join(" ");
  assert.match(guardrails, /publish|post|send|outreach/i);
  assert.match(guardrails, /spend|budget|paid (?:media|advertising)|ads?/i);
  assert.match(guardrails, /credential|private data|customer data/i);
  assert.match(guardrails, /invent|fabricate/i);
  assert.match(guardrails, /performance|attribution|engagement|conversion/i);
  assert.match(guardrails, /explicit approval/i);
  assert.match(marketing.verification.join(" "), /approved external schedule identifier.*completion report.*no-go/i);
  assert.match(marketing.verification.join(" "), /unsupported lift.*testimonial.*competitor-claim/i);
  assert.match(marketing.verification.join(" "), /publish.*email a list.*ad budget.*no external write/i);
  assert.doesNotMatch(compiled.runPrompt, /marketing on autopilot|always-on growth engine|set it and forget it|guaranteed leads/i);
});

test("the web-app lifecycle packs have non-overlapping entry conditions", () => {
  const pack = (slug) => outcomePacks.find((candidate) => candidate.slug === slug);
  assert.match(pack("working-web-app").useWhen.join(" "), /first coherent|first complete|first.*usable/i);
  assert.match(pack("software-launch").useWhen.join(" "), /existing working software product/i);
  assert.match(pack("software-launch").notFor.join(" "), /first complete usable application/i);
  assert.match(pack("production-web-release").useWhen.join(" "), /existing tested web app/i);
  assert.match(pack("web-app-operations").useWhen.join(" "), /already live/i);
});

test("benchmark outcome packs compile operational knowledge without upgrading coverage into success", () => {
  const pack = (slug) => outcomePacks.find((candidate) => candidate.slug === slug);
  const company = pack("billion-dollar-saas");
  const funding = pack("kickstarter-funding");
  const fulfillment = pack("kickstarter-fulfillment");

  assert.ok(company);
  assert.equal(company.catalogNumber, 9);
  assert.equal(company.lane, "create");
  assert.match(company.promise, /Atlassian-scale SaaS/i);
  assert.match(company.outputs.join(" "), /company-system coverage matrix/i);
  assert.match(company.outputs.join(" "), /revenue ledger beginning at zero/i);
  assert.match(company.guardrails.join(" "), /operational coverage and economic outcomes remain separate/i);
  assert.match(company.notFor.join(" "), /copying another company.*trademark/i);
  assert.match(compilePack(company).runPrompt, /^Build the Billion-Dollar SaaS outcome/);

  assert.ok(funding);
  assert.equal(funding.catalogNumber, 10);
  assert.equal(funding.lane, "launch");
  assert.match(funding.promise, /Kickstarter campaign system/i);
  assert.match(funding.outputs.join(" "), /deposited net payout/i);
  assert.match(funding.guardrails.join(" "), /Only privacy-safe evidence of the deposited platform payout/i);
  assert.match(funding.verification.join(" "), /unfunded and cancelled outcomes/i);
  assert.match(compilePack(funding).runPrompt, /^Build the Kickstarter Funding outcome/);

  assert.ok(fulfillment);
  assert.equal(fulfillment.catalogNumber, 11);
  assert.equal(fulfillment.lane, "operate");
  assert.match(fulfillment.promise, /95% shipped/i);
  assert.match(fulfillment.guardrails.join(" "), /personal names.*addresses.*version control/i);
  assert.match(fulfillment.verification.join(" "), /frozen denominator/i);
  assert.match(fulfillment.schedule.request, /schedule Kickstarter fulfillment operations/i);
  const fulfillmentPrompt = compilePack(fulfillment).runPrompt;
  assert.match(fulfillmentPrompt, /^Establish and run the first cycle of the Kickstarter Fulfillment outcome/);
  assert.match(fulfillmentPrompt, /SCHEDULE GATE/);
  assert.match(fulfillmentPrompt, /fulfillment\/receipts\/YYYY-MM-DDTHHMMSSZ\.md/);

  for (const candidate of [company, funding, fulfillment]) {
    const owned = candidate.workstreams.flatMap((stream) => stream.owns.map((path) => ({ stream: stream.id, path })));
    for (const left of owned) {
      for (const right of owned) {
        if (left.stream === right.stream) continue;
        assert.equal(left.path.startsWith(right.path) || right.path.startsWith(left.path), false, `${candidate.slug}: ${left.path} overlaps ${right.path}`);
      }
    }
  }
});
