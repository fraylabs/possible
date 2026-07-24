# Possible Outcome Pack catalog

Use this bundled snapshot when the Possible MCP tools are unavailable. Link the recommended Outcome Pack's public page during the recommendation; disclose its selected agent skills, sources, and reviewed revisions before installing them.

Catalog categories are browsing labels only: Create is a first complete usable thing, Launch is a compelling public presentation, Release is evidence-backed readiness to ship or distribute, and Operate is a repeatable ongoing workflow. Do not ask the user to choose a category; select across the complete catalog from the desired finished outcome.

## Hardware Launch

Slug: `hardware-launch`

Lane: `launch`

Public page: `https://possible.sh/packs/hardware-launch`

Use for a physical-product idea or prototype that needs one coherent launch presentation.

Outputs: launch site, launch film, prototype CAD, honest waitlist contract, approved MVP deployment or a completion report explaining why deployment could not proceed, evidence report.

Optional lead-agent capability: OpenAI `@sites` plugin (`$sites-building`, `$sites-hosting`), reviewed at plugin version `0.1.30`. When it is available in the current Codex workspace, prefer it for a new MVP launch-site deployment so no separate Vercel registration is needed. It is not installed by the Skills CLI commands below. Deployment and provider mutations still require separate explicit approval.

Workstreams:

- Launch site — `frontend-design`, `vercel-react-best-practices`; owns `site/` and the waitlist contract.
- Launch film — `remotion-best-practices`; owns `film/` and the rendered preview.
- Prototype CAD — `cad`; owns `hardware/` and the geometry report.
- Fresh review — `webapp-testing`; verifies the integrated outcome after production.

Sources:

- `anthropics/skills`: `frontend-design`, `webapp-testing`; reviewed `fa0fa64bdc967915dc8399e803be67759e1e62b8`.
- `vercel-labs/agent-skills`: `vercel-react-best-practices`; reviewed `f8a72b9603728bb92a217a879b7e62e43ad76c81`.
- `remotion-dev/skills`: `remotion-best-practices`; reviewed `ab22f5fa89962ec943eaa18797cbf38c9d727743`.
- `earthtojake/text-to-cad`: `cad`; reviewed `fdbb4b4fb62d95ae298cfe9a46fdc7092bdaf423`.

Install:

```bash
npx skills@1.5.19 add anthropics/skills@fa0fa64bdc967915dc8399e803be67759e1e62b8 --skill frontend-design --skill webapp-testing --agent codex
npx skills@1.5.19 add vercel-labs/agent-skills@f8a72b9603728bb92a217a879b7e62e43ad76c81 --skill vercel-react-best-practices --agent codex
npx skills@1.5.19 add remotion-dev/skills@ab22f5fa89962ec943eaa18797cbf38c9d727743 --skill remotion-best-practices --agent codex
npx skills@1.5.19 add earthtojake/text-to-cad@fdbb4b4fb62d95ae298cfe9a46fdc7092bdaf423 --skill cad --agent codex
```

Never imply manufacturing readiness, physical validation, certification, or customer demand. Deployment, fabrication, purchasing, outreach, and real waitlist collection remain separate gates.

## Software Launch

Slug: `software-launch`

Lane: `launch`

Public page: `https://possible.sh/packs/software-launch`

Use for an existing working software product whose primary flow already exists but needs a coherent release and launch presentation.

Outputs: stabilized product release candidate, launch site, demo film, approved MVP deployment or a completion report explaining why deployment could not proceed, evidence report.

Optional lead-agent capability: OpenAI `@sites` plugin (`$sites-building`, `$sites-hosting`), reviewed at plugin version `0.1.30`. Prefer it for a new MVP deployment when it is available and no provider is already selected; retain `deploy-to-vercel` as the reviewed fallback for an existing authorized Vercel target. The plugin is not installed by the Skills CLI commands below. Either external path requires separate explicit approval.

Workstreams:

- Product release candidate — `vercel-react-best-practices`; stabilizes the existing release candidate and owns `product/` and its test report.
- Launch site — `frontend-design`; owns `site/` and the launch narrative.
- Demo film — `remotion-best-practices`; owns `film/` and the rendered preview.
- Release readiness — `web-design-guidelines`; owns `release/` and the deployment plan. The lead agent retains `sites-hosting` or `deploy-to-vercel` until separate deployment approval.
- Fresh review — `webapp-testing`, `web-design-guidelines`; verifies the integrated outcome.

Sources:

- `anthropics/skills`: `frontend-design`, `webapp-testing`; reviewed `fa0fa64bdc967915dc8399e803be67759e1e62b8`.
- `vercel-labs/agent-skills`: `vercel-react-best-practices`, `web-design-guidelines`, `deploy-to-vercel`; reviewed `f8a72b9603728bb92a217a879b7e62e43ad76c81`.
- `remotion-dev/skills`: `remotion-best-practices`; reviewed `ab22f5fa89962ec943eaa18797cbf38c9d727743`.

Install:

```bash
npx skills@1.5.19 add anthropics/skills@fa0fa64bdc967915dc8399e803be67759e1e62b8 --skill frontend-design --skill webapp-testing --agent codex
npx skills@1.5.19 add vercel-labs/agent-skills@f8a72b9603728bb92a217a879b7e62e43ad76c81 --skill vercel-react-best-practices --skill web-design-guidelines --skill deploy-to-vercel --agent codex
npx skills@1.5.19 add remotion-dev/skills@ab22f5fa89962ec943eaa18797cbf38c9d727743 --skill remotion-best-practices --agent codex
```

Never imply demand, uptime, security, performance, or production readiness. Deployment, DNS, analytics, outreach, and real data collection remain separate gates.

## Open-Source Release

Slug: `open-source-release`

Lane: `release`

Public page: `https://possible.sh/packs/open-source-release`

Use for an existing repository that needs a trustworthy, usable release package without publishing it.

Outputs: release-ready package, README and docs, runnable examples, hardened CI, changelog and release plan, evidence report.

Workstreams:

- Release engineering — `github-release`; owns `release/`, versioning, and the changelog plan.
- Documentation and examples — `create-readme`, `documentation-writer`; owns `README.md`, `docs/`, and `examples/`.
- CI and security assurance — `github-actions-hardening`, `security-review`; owns workflow changes and the risk report.
- Fresh review — `security-review`, `github-actions-hardening`; verifies the release outcome.

Sources:

- `github/awesome-copilot`: all five skills below; reviewed `26fe2d126bf79aafb38f43344d450b69632200f8`.

Install:

```bash
npx skills@1.5.19 add github/awesome-copilot@26fe2d126bf79aafb38f43344d450b69632200f8 --skill github-release --skill create-readme --skill documentation-writer --skill github-actions-hardening --skill security-review --agent codex
```

Never imply security, compatibility, production readiness, or release authority. Pushing, tagging, publishing packages, creating releases, and changing repository settings remain separate gates.

## Playable Web Game

Slug: `playable-web-game`

Lane: `create`

Public page: `https://possible.sh/packs/playable-web-game`

Use for a browser-game idea that needs one polished, replayable Three.js experience rather than a general game engine or sprawling feature set.

Outputs: playable browser game, game brief and tuning rules, responsive HUD and controls, production build, evidence report.

Workstreams:

- Core loop and game feel — `game-designer`; owns `game/brief.md` and `game/tuning/`.
- Three.js game runtime — `threejs`; owns `game/src/`, `game/assets/`, and `game/build/`.
- HUD and controls — `frontend-design`, `mobile-touch`; owns `game/ui/` and `game/controls.md`.
- Fresh review — `webapp-testing`; verifies the integrated game with keyboard and touch-sized input paths.

Sources:

- `mrgoonie/claudekit-skills`: `threejs`; reviewed `80113d86bc4407f105af40a2c4ea58194f7c370a`.
- `dylantarre/animation-principles`: `game-designer`, `mobile-touch`; reviewed `83597134ba8ff59838270f94d7ac7282ffa3b54d`.
- `anthropics/skills`: `frontend-design`, `webapp-testing`; reviewed `fa0fa64bdc967915dc8399e803be67759e1e62b8`.

Install:

```bash
npx skills@1.5.19 add mrgoonie/claudekit-skills@80113d86bc4407f105af40a2c4ea58194f7c370a --skill threejs --agent codex
npx skills@1.5.19 add dylantarre/animation-principles@83597134ba8ff59838270f94d7ac7282ffa3b54d --skill game-designer --skill mobile-touch --agent codex
npx skills@1.5.19 add anthropics/skills@fa0fa64bdc967915dc8399e803be67759e1e62b8 --skill frontend-design --skill webapp-testing --agent codex
```

Never imply player demand, accessibility, compatibility, performance, or production readiness beyond direct evidence. Deployment, publishing, analytics, paid assets, and external distribution remain separate gates.

## Web App Operations

Slug: `web-app-operations`

Lane: `operate`

Public page: `https://possible.sh/packs/web-app-operations`

Use for an existing live web app that needs a repeatable or scheduled operating loop for detecting problems, triaging work, maintaining dependencies, and recovering safely. A request such as “schedule operations” selects this Outcome Pack when the application is already live.

Outputs: executable operations check and dated health baseline, issue intake and prioritized operations queue, dependency and security maintenance loop, incident/change/rollback runbooks, exercised recovery drill, first dated completion report, scheduling-ready task prompt, and—only when separately approved—an enabled schedule record.

Workstreams:

- Reliability loop — `webapp-testing`; owns `operations/checks/`, `operations/receipts/`, and the repository-native operations command.
- Triage and maintenance — `impediment-prioritization`, `dependabot`, `security-review`; owns the operations queue, maintenance/security evidence, and Dependabot configuration.
- Safe change and incident response — `devops-rollout-plan`, `incident-postmortem`; owns change, incident, rollback, and postmortem surfaces.
- Fresh review — `webapp-testing`, `security-review`; verifies the integrated operating loop after its first cycle.

Sources:

- `anthropics/skills`: `webapp-testing`; reviewed `fa0fa64bdc967915dc8399e803be67759e1e62b8`.
- `github/awesome-copilot`: `impediment-prioritization`, `dependabot`, `security-review`, `devops-rollout-plan`, `incident-postmortem`; reviewed `26fe2d126bf79aafb38f43344d450b69632200f8`.

Install:

```bash
npx skills@1.5.19 add anthropics/skills@fa0fa64bdc967915dc8399e803be67759e1e62b8 --skill webapp-testing --agent codex
npx skills@1.5.19 add github/awesome-copilot@26fe2d126bf79aafb38f43344d450b69632200f8 --skill impediment-prioritization --skill dependabot --skill security-review --skill devops-rollout-plan --skill incident-postmortem --agent codex
```

Establish the durable workflow and execute its first dated cycle manually before offering a schedule. For recurring operations, default to a standalone scheduled task in an isolated worktree whose prompt invokes `$possible resume`, runs one cycle, writes a new dated completion report, reports findings, and stops at every external-action gate. Show the exact cadence, timezone, project, execution mode, prompt, and permissions before requesting separate approval to create or enable it. If scheduled-task management is unavailable, provide a tested scheduling-ready prompt without claiming a task exists.

One health snapshot never proves uptime. Preserve empty queues, skipped checks, unavailable signals, unresolved work, and unproven claims honestly. Scheduled-task changes, production changes, issue-tracker writes, monitoring changes, deploys, rollbacks, paging, status communication, and customer-data access remain separate gates.

## Working Web App

Slug: `working-web-app`

Lane: `create`

Public page: `https://possible.sh/packs/working-web-app`

Use when an idea, prototype, or rough repository needs to become a small locally runnable web product with one complete verified user flow—not a launch campaign or deployment.

Outputs: locally runnable working application, primary-flow and state contract, reproducible fixtures or demo data, automated checks, production build, evidence report, machine-readable product receipt.

Workstreams:

- Product flow and states — `frontend-design`; owns `product/flow.md`, `product/states.md`, and `product/data-contract.md`.
- Working application — `frontend-design`; owns application source, fixtures, and the production build.
- Automated product proof — `webapp-testing`; owns tests, the repeatable verification command, and the implementation report.
- Fresh review — `webapp-testing`, `security-review`; verifies the integrated app and reports scoped risks without claiming security.

Sources:

- `anthropics/skills`: `frontend-design`, `webapp-testing`; reviewed `fa0fa64bdc967915dc8399e803be67759e1e62b8`.
- `github/awesome-copilot`: `security-review`; reviewed `26fe2d126bf79aafb38f43344d450b69632200f8`.

Install:

```bash
npx skills@1.5.19 add anthropics/skills@fa0fa64bdc967915dc8399e803be67759e1e62b8 --skill frontend-design --skill webapp-testing --agent codex
npx skills@1.5.19 add github/awesome-copilot@26fe2d126bf79aafb38f43344d450b69632200f8 --skill security-review --agent codex
```

When starting from a prior First Customer Sprint or historical discovery run, inspect its receipt, selected and rejected opportunities, commercial evidence, customer objections, requested delivery boundary, and unresolved assumptions against the current reality before recommending this pack. On completion, write `outcome-room/product-receipt.json` with `passed`, `repair-required`, or `no-go`. A `passed` receipt is evidence for a later reassessment, not authority to begin a launch outcome.

Prove clean local setup, one complete user job, one material failure path, every promised state and persistence boundary, a production build, responsive browser behavior, and an exact completion report. Deployment, publishing, analytics, third-party services, and real customer data remain separate gates. Never call a local build secure, scalable, reliable, or production-ready.

## Production Web Release

Slug: `production-web-release`

Lane: `release`

Public page: `https://possible.sh/packs/production-web-release`

Use when an existing tested web app needs a gated, reversible production release with an immutable candidate, verified preview, exact approval, rollback path, post-deploy smoke evidence, and final completion report. Automated execution supports the reviewed OpenAI Sites and Vercel adapters; other providers stop with a provider-neutral completion report explaining why release could not proceed.

Optional lead-agent capability: OpenAI `@sites` plugin (`$sites-building`, `$sites-hosting`), reviewed at plugin version `0.1.30`. If `.openai/hosting.json` exists, use Sites. Otherwise prefer it for a new MVP target when available, so no separate Vercel registration is needed. It is not installed by the Skills CLI commands below. Every Sites URL is production, and exact provider mutations remain separately gated.

Outputs: pinned release candidate and provider inventory, security and pipeline preflight, rollout and rollback plan, preview smoke report, approved production deployment or a completion report explaining why deployment could not proceed, post-deployment evidence, final release report.

Workstreams:

- Candidate and release readiness — `devops-rollout-plan`, `security-review`; owns the candidate record, preflight, rollout plan, and rollback plan.
- Provider and delivery path — `github-actions-hardening`; owns provider evidence, pipeline review, and exact deploy commands. The lead agent holds `sites-hosting` or `deploy-to-vercel` until the separate exact production approval.
- Release verification — `webapp-testing`; owns repeatable preview, production, and rollback-recovery checks and reports.
- Fresh review — `webapp-testing`, `devops-rollout-plan`; verifies the integrated release evidence before any promotion.

Sources:

- `github/awesome-copilot`: `devops-rollout-plan`, `github-actions-hardening`, `security-review`; reviewed `26fe2d126bf79aafb38f43344d450b69632200f8`.
- `anthropics/skills`: `webapp-testing`; reviewed `fa0fa64bdc967915dc8399e803be67759e1e62b8`.
- `vercel-labs/agent-skills`: `deploy-to-vercel`; reviewed `f8a72b9603728bb92a217a879b7e62e43ad76c81`.

Install:

```bash
npx skills@1.5.19 add github/awesome-copilot@26fe2d126bf79aafb38f43344d450b69632200f8 --skill devops-rollout-plan --skill github-actions-hardening --skill security-review --agent codex
npx skills@1.5.19 add anthropics/skills@fa0fa64bdc967915dc8399e803be67759e1e62b8 --skill webapp-testing --agent codex
npx skills@1.5.19 add vercel-labs/agent-skills@f8a72b9603728bb92a217a879b7e62e43ad76c81 --skill deploy-to-vercel --agent codex
```

Outcome Pack confirmation does not authorize production. Workstreams prepare evidence first; the lead agent integrates it, records go or no-go, and asks again for approval naming the provider, account or team, project, production target, exact candidate, method, and accepted risks. Do not mutate provider state, secrets, databases, DNS, billing, repositories, or workflows without approval for that exact action. Never infer success, availability, security, or rollback readiness from a plan or one browser pass.

## Marketing Operations

Slug: `marketing-operations`

Lane: `operate`

Public page: `https://possible.sh/packs/marketing-operations`

Use for a real product or offer that needs a repeatable or scheduled marketing rhythm across positioning, campaign planning, channel-ready draft production, measurement, and review. The product and audience must be grounded in confirmed evidence; this is not a substitute for building the product or creating its first complete launch package.

Outputs: versioned product-marketing source of truth and claims register, prioritized campaign plan and editorial calendar, first batch of channel-ready drafts, decision-led measurement and experiment plan, bounded recurring marketing loop, first dated completion report, scheduling-ready task prompt, and—only when separately approved—an enabled schedule record.

Workstreams:

- Positioning and campaign plan — `product-marketing`, `content-strategy`; owns the versioned context, `marketing/evidence/`, `marketing/plan/`, and `marketing/calendar/`.
- Channel-ready draft production — `copywriting`, `social`; owns `marketing/briefs/`, `marketing/drafts/`, and `marketing/review/`.
- Measurement and recurring loop — `analytics`, `marketing-loops`; owns `marketing/measurement/`, `marketing/loop.md`, `marketing/state/`, and `marketing/receipts/`.
- Fresh review — `product-marketing`, `analytics`; verifies claims, approval state, measurement logic, privacy boundaries, loop state, and honest unknowns after the first cycle.

Sources:

- `coreyhaines31/marketingskills`: all six skills below; reviewed `67264763cb107d61749f418d081c56e5bcbc0209`.

Install:

```bash
npx skills@1.5.19 add coreyhaines31/marketingskills@67264763cb107d61749f418d081c56e5bcbc0209 --skill product-marketing --skill content-strategy --skill copywriting --skill social --skill analytics --skill marketing-loops --agent codex
```

Establish the source of truth and execute the first dated cycle manually before offering a schedule. Scheduled cycles remain permanently repo-local and read-only toward external systems: they may inspect explicitly authorized evidence, maintain plans, and prepare reviewable drafts, but they never post, send, spend, perform outreach, change tracking or accounts, use write-capable connectors, or use credentials. Perform any such action later in a separate interactive task after separate explicit approval. Preserve one canonical durable state location, an atomic no-overlap lock, and a kill switch across runs. Never fabricate customer language, testimonials, metrics, baselines, attribution, rankings, competitor facts, demand, or results. Preserve honest no-signal and empty-calendar states.

## Billion-Dollar SaaS

Slug: `billion-dollar-saas`

Lane: `create`

Public page: `https://possible.sh/packs/billion-dollar-saas`

Use when the user asks for a successful, category-defining, Atlassian-scale, or billion-dollar software company without knowing every product, growth, revenue, trust, and operating system required. This Outcome Pack supplies the operational map; it never guarantees valuation, customers, product-market fit, or revenue.

Outputs: company and market thesis, working product and activation path, positioning and distribution system, pricing/revenue/sales/customer-success system, trust and reliability baseline, company operating cadence, system-coverage matrix, separate customer and revenue ledger beginning at zero, independent completion report.

Workstreams:

- Market, category, and company thesis — `product-marketing`, `analytics`; owns `company/market/`, `company/thesis.md`, and the evidence register.
- Product, onboarding, and activation — `frontend-design`, `vercel-react-best-practices`, `webapp-testing`; owns `company/product/`, `company/onboarding/`, and its report.
- Positioning, acquisition, and distribution — `product-marketing`, `content-strategy`, `copywriting`, `social`; owns `company/brand/`, `company/acquisition/`, and `company/distribution/`.
- Pricing, revenue, sales, and customer success — `product-marketing`, `analytics`; owns `company/revenue/`, `company/sales/`, and `company/customer-success/`.
- Security, reliability, compliance, and release trust — `security-review`, `devops-rollout-plan`, `webapp-testing`; owns `company/trust/`, `company/reliability/`, and `company/release/`.
- Measurement and company operations — `analytics`, `marketing-loops`; owns `company/operations/`, `company/metrics/`, and `company/receipts/`.
- Fresh review — `webapp-testing`, `analytics`, `security-review`; scores company-system maturity and verifies economic evidence separately.

Sources:

- `coreyhaines31/marketingskills`: `product-marketing`, `content-strategy`, `copywriting`, `social`, `analytics`, `marketing-loops`; reviewed `67264763cb107d61749f418d081c56e5bcbc0209`.
- `anthropics/skills`: `frontend-design`, `webapp-testing`; reviewed `fa0fa64bdc967915dc8399e803be67759e1e62b8`.
- `vercel-labs/agent-skills`: `vercel-react-best-practices`; reviewed `f8a72b9603728bb92a217a879b7e62e43ad76c81`.
- `github/awesome-copilot`: `security-review`, `devops-rollout-plan`; reviewed `26fe2d126bf79aafb38f43344d450b69632200f8`.

Install:

```bash
npx skills@1.5.19 add coreyhaines31/marketingskills@67264763cb107d61749f418d081c56e5bcbc0209 --skill product-marketing --skill content-strategy --skill copywriting --skill social --skill analytics --skill marketing-loops --agent codex
npx skills@1.5.19 add anthropics/skills@fa0fa64bdc967915dc8399e803be67759e1e62b8 --skill frontend-design --skill webapp-testing --agent codex
npx skills@1.5.19 add vercel-labs/agent-skills@f8a72b9603728bb92a217a879b7e62e43ad76c81 --skill vercel-react-best-practices --agent codex
npx skills@1.5.19 add github/awesome-copilot@26fe2d126bf79aafb38f43344d450b69632200f8 --skill security-review --skill devops-rollout-plan --agent codex
```

Do not copy a reference company's identity, code, private data, or copyrighted content. Public companies are system references, not cloning targets. Keep described, produced, executable, used, and economically validated systems distinct. Deployment, publishing, outreach, payments, contracts, spending, data collection, and provider mutations remain separate gates.

## Kickstarter Funding

Slug: `kickstarter-funding`

Lane: `launch`

Public page: `https://possible.sh/packs/kickstarter-funding`

Use when a rough product idea or prototype needs the complete Kickstarter path: feasibility, economics, offer, rewards, story, proof film, prelaunch audience, campaign operations, and payout evidence. Use Hardware Launch for a presentation without crowdfunding mechanics.

Outputs: feasibility and fixed funding-goal model, audience/offer/rewards/risks, responsive campaign story, proof-led film, prelaunch and campaign distribution system, measurement and payout controls, approved live execution or publication-ready blocked status, verified funding report.

Workstreams:

- Product feasibility, cost, and funding model — `product-marketing`, `analytics`; owns campaign feasibility, economics, and risk evidence.
- Audience, promise, rewards, and offer — `product-marketing`, `copywriting`; owns the offer, rewards, and claims register.
- Kickstarter story and campaign page — `frontend-design`, `copywriting`; owns the responsive local proof page and story.
- Proof-led campaign film — `remotion-best-practices`; owns rendered media and its report.
- Prelaunch audience and distribution — `content-strategy`, `social`, `copywriting`; owns audience research, calendar, and review-required drafts.
- Campaign decisions and payout evidence — `analytics`, `marketing-loops`, `webapp-testing`; owns measurement, operations, fixtures, and reports.
- Fresh review — `product-marketing`, `analytics`, `webapp-testing`; verifies economics, claims, media, local campaign behavior, and money evidence.

Sources:

- `coreyhaines31/marketingskills`: `product-marketing`, `content-strategy`, `copywriting`, `social`, `analytics`, `marketing-loops`; reviewed `67264763cb107d61749f418d081c56e5bcbc0209`.
- `anthropics/skills`: `frontend-design`, `webapp-testing`; reviewed `fa0fa64bdc967915dc8399e803be67759e1e62b8`.
- `remotion-dev/skills`: `remotion-best-practices`; reviewed `ab22f5fa89962ec943eaa18797cbf38c9d727743`.

Install:

```bash
npx skills@1.5.19 add coreyhaines31/marketingskills@67264763cb107d61749f418d081c56e5bcbc0209 --skill product-marketing --skill content-strategy --skill copywriting --skill social --skill analytics --skill marketing-loops --agent codex
npx skills@1.5.19 add anthropics/skills@fa0fa64bdc967915dc8399e803be67759e1e62b8 --skill frontend-design --skill webapp-testing --agent codex
npx skills@1.5.19 add remotion-dev/skills@ab22f5fa89962ec943eaa18797cbf38c9d727743 --skill remotion-best-practices --agent codex
```

Never imply funding, demand, manufacturing feasibility, delivery, or payout. A local page must not impersonate Kickstarter or accept payment. Publishing, outreach, posting, email, advertising, account changes, and live campaign actions require separate approval. Count money only after privacy-safe evidence proves the platform payout was deposited.

## Kickstarter Fulfillment

Slug: `kickstarter-fulfillment`

Lane: `operate`

Public page: `https://possible.sh/packs/kickstarter-fulfillment`

Use after a real Kickstarter campaign reaches its funding goal and needs a durable production-to-shipment operation. This Outcome Pack manages obligations, suppliers, quality, privacy-safe orders, logistics, exceptions, communications, milestones, and a recurring control loop until 95% shipped or an honest blocked outcome.

Outputs: campaign-obligation baseline, production and quality system, privacy-safe order ledger, inventory/logistics/exception system, review-required backer communications, first control-loop report, scheduling-ready task, shipment milestone ledger, independent fulfillment report.

Workstreams:

- Production readiness and quality — `impediment-prioritization`, `incident-postmortem`; owns production, quality, and supplier evidence.
- Backer obligations and order ledger — `analytics`, `security-review`; owns privacy-safe backer, order, and data-boundary state.
- Inventory, freight, carrier, and shipment — `analytics`, `impediment-prioritization`; owns inventory, logistics, and exceptions.
- Backer communications — `product-marketing`, `copywriting`; owns evidence-grounded update and support drafts.
- Fulfillment control tower — `analytics`, `marketing-loops`, `incident-postmortem`; owns control state, dated completion reports, and scheduling handoff.
- Fresh review — `analytics`, `security-review`, `incident-postmortem`; verifies the frozen denominator, evidence milestones, privacy, exceptions, and exact shipment clocks.

Sources:

- `coreyhaines31/marketingskills`: `product-marketing`, `copywriting`, `analytics`, `marketing-loops`; reviewed `67264763cb107d61749f418d081c56e5bcbc0209`.
- `github/awesome-copilot`: `impediment-prioritization`, `security-review`, `incident-postmortem`; reviewed `26fe2d126bf79aafb38f43344d450b69632200f8`.

Install:

```bash
npx skills@1.5.19 add coreyhaines31/marketingskills@67264763cb107d61749f418d081c56e5bcbc0209 --skill product-marketing --skill copywriting --skill analytics --skill marketing-loops --agent codex
npx skills@1.5.19 add github/awesome-copilot@26fe2d126bf79aafb38f43344d450b69632200f8 --skill impediment-prioritization --skill security-review --skill incident-postmortem --agent codex
```

Run the first control cycle manually before offering a schedule. Scheduled cycles may inspect authorized privacy-safe evidence and prepare local state or drafts only. Purchasing, supplier contact, contracts, manufacturing orders, address exports, carrier bookings, labels, refunds, campaign changes, and backer messages remain separate explicit gates. Award 95% shipped only from privacy-safe campaign and carrier or fulfillment evidence against a frozen denominator; delivery is a separate claim.

## Robot Prototype

Slug: `robot-prototype`

Lane: `create`

Public page: `https://possible.sh/packs/robot-prototype`

Use when a robot hand, gripper, arm, mobile robot, quadruped, or full robot needs one coherent digital prototype across mechanics, kinematics, planning semantics, controls, and simulation.

Outputs: robot architecture and safety contract, parametric STEP assembly and component ledger, validated robot-description and planning-semantics package, MuJoCo model and task scene, bounded controller and ROS 2 interface baseline, deterministic tests and inspectable rollout, completion report and sim-to-real gap report.

Workstreams:

- Robot architecture and safety contract — `robotics-design-patterns`, `robotics-software-principles`; owns `robot/architecture/` and `robot/interfaces/`.
- Mechanical system and component model — `cad`, `step-parts`; owns `robot/mechanical/` and `robot/bom/`.
- Robot description and planning semantics — `urdf`, `srdf`, `cad-viewer`; owns `robot/description/` and `robot/planning/`.
- MuJoCo simulation and control baseline — `mujoco-robotics`, `ros2-development`; owns `robot/simulation/`, `robot/control/`, and `robot/tests/`.
- Fresh review — `robotics-testing`, `cad-viewer`; verifies the integrated digital prototype and reports remaining sim-to-real gaps.

Sources:

- `fraylabs/possible`: `mujoco-robotics`; reviewed `9adb697c211d2cebc07164554d7a9f859e7f763d`.
- `earthtojake/text-to-cad`: `cad`, `step-parts`, `urdf`, `srdf`, `cad-viewer`; reviewed `fdbb4b4fb62d95ae298cfe9a46fdc7092bdaf423`.
- `arpitg1304/robotics-agent-skills`: `robotics-design-patterns`, `robotics-software-principles`, `ros2-development`, `robotics-testing`; reviewed `54f7b578f3dc269d29c0beb623b3f2611fd3a430`.

Install:

```bash
npx skills@1.5.19 add fraylabs/possible@9adb697c211d2cebc07164554d7a9f859e7f763d --skill mujoco-robotics --agent codex
npx skills@1.5.19 add earthtojake/text-to-cad@fdbb4b4fb62d95ae298cfe9a46fdc7092bdaf423 --skill cad --skill step-parts --skill urdf --skill srdf --skill cad-viewer --agent codex
npx skills@1.5.19 add arpitg1304/robotics-agent-skills@54f7b578f3dc269d29c0beb623b3f2611fd3a430 --skill robotics-design-patterns --skill robotics-software-principles --skill ros2-development --skill robotics-testing --agent codex
```

Simulation is not physical validation. Do not connect to hardware, disable safety limits, purchase parts, fabricate components, or claim fabrication readiness, functional safety, payload, precision, stability, durability, or real-world task success without separate approval and direct evidence.

## Web Presentation

Slug: `web-presentation`

Lane: `create`

Public page: `https://possible.sh/packs/web-presentation`

Use when a pitch, talk, lesson, demo, or internal presentation should be an editable browser experience rather than a PowerPoint file, and the story, evidence, visual direction, motion, presenter experience, export, and review must work together.

Outputs: narrative, audience, timing, and evidence map; selected visual direction and asset ledger; editable coded browser presentation; keyboard, touch, fullscreen, progress, and presenter-note controls; responsive and reduced-motion behavior; PDF export and contact sheet; approved shareable deployment or deployment no-go completion report; evidence and completion report.

Workstreams:

- Narrative and evidence map — `copywriting`; owns `presentation/story/` and `presentation/evidence/`.
- Visual direction and illustration system — `frontend-slides`, `impeccable`; owns `presentation/direction/` and `presentation/assets/`.
- Coded presentation and presenter experience — `frontend-slides`, `impeccable`; owns `presentation/index.html`, `presentation/notes/`, and `presentation/export/`.
- Fresh review — `webapp-testing`, `impeccable`; verifies claims, every rendered slide, interaction paths, accessibility, timing, exports, provenance, and public/private boundaries.

Sources:

- `coreyhaines31/marketingskills`: `copywriting`; reviewed `67264763cb107d61749f418d081c56e5bcbc0209`.
- `zarazhangrui/frontend-slides`: `frontend-slides`; reviewed `9906a34d640d2111f724544cbc50f7f130569ae1`.
- `pbakaus/impeccable`: `impeccable`; reviewed `4d849eb75f216109ea7053ed21530a11fafcc786`.
- `anthropics/skills`: `webapp-testing`; reviewed `fa0fa64bdc967915dc8399e803be67759e1e62b8`.
- Optional OpenAI plugin: `@sites` with `$sites-building` and `$sites-hosting`, reviewed as a separate capability and not installed by the Skills CLI.

Install:

```bash
npx skills@1.5.19 add coreyhaines31/marketingskills@67264763cb107d61749f418d081c56e5bcbc0209 --skill copywriting --agent codex
npx skills@1.5.19 add zarazhangrui/frontend-slides@9906a34d640d2111f724544cbc50f7f130569ae1 --skill frontend-slides --agent codex
npx skills@1.5.19 add pbakaus/impeccable@4d849eb75f216109ea7053ed21530a11fafcc786 --skill impeccable --agent codex
npx skills@1.5.19 add anthropics/skills@fa0fa64bdc967915dc8399e803be67759e1e62b8 --skill webapp-testing --agent codex
```

Do not invent evidence, metrics, testimonials, users, product capabilities, citations, or competitive claims. Generated imagery is illustrative, not factual proof. Do not copy protected deck or brand expression, publish private notes, install project hooks, deploy, upload, or share without the required inspection and separate approval.

## Developer Project Launch

Slug: `developer-project-launch`

Lane: `launch`

Status: `experimental` — available to test; promote only after a preserved end-to-end run and independent verification.

Public page: `https://possible.sh/packs/developer-project-launch`

Use when a working CLI, library, API, application, agent tool, or developer platform needs one coherent public explanation across its positioning, website, demonstration, README, examples, installation path, and proof.

Outputs: developer audience, pain, positioning, and claims register; three project-specific creative-direction previews and decision record; distinctive responsive project launch site; evidence-backed demonstration; verified five-minute quickstart; installation path and runnable example; approved deployment or deployment no-go report; independent verification; machine-readable launch receipt.

Workstreams:

- Product truth and positioning — `copywriting`; owns `launch/positioning/` and `launch/claims/`.
- Developer adoption path — `create-readme`, `documentation-writer`; owns `launch/docs/`, `launch/examples/`, and the clean-room quickstart report.
- Project-specific creative direction — `frontend-design`, `impeccable`; runs after positioning and owns `launch/direction/`.
- Launch site and project demonstration — `frontend-design`, `impeccable`, `vercel-react-best-practices`; runs after positioning, documentation, and creative direction, then owns `launch/site/`, `launch/demo/`, and `launch/assets/`.
- Fresh review — `webapp-testing`, `web-design-guidelines`, `impeccable`; verifies the integrated launch without owning implementation files.

Sources:

- `coreyhaines31/marketingskills`: `copywriting`; reviewed `67264763cb107d61749f418d081c56e5bcbc0209`.
- `anthropics/skills`: `frontend-design`, `webapp-testing`; reviewed `fa0fa64bdc967915dc8399e803be67759e1e62b8`.
- `pbakaus/impeccable`: `impeccable`; reviewed `4d849eb75f216109ea7053ed21530a11fafcc786`.
- `vercel-labs/agent-skills`: `vercel-react-best-practices`, `web-design-guidelines`, `deploy-to-vercel`; reviewed `f8a72b9603728bb92a217a879b7e62e43ad76c81`.
- `github/awesome-copilot`: `create-readme`, `documentation-writer`; reviewed `26fe2d126bf79aafb38f43344d450b69632200f8`.
- Optional OpenAI plugin: `@sites` with `$sites-building` and `$sites-hosting`, reviewed separately and not installed by the Skills CLI.

Install:

```bash
npx skills@1.5.19 add coreyhaines31/marketingskills@67264763cb107d61749f418d081c56e5bcbc0209 --skill copywriting --agent codex
npx skills@1.5.19 add anthropics/skills@fa0fa64bdc967915dc8399e803be67759e1e62b8 --skill frontend-design --skill webapp-testing --agent codex
npx skills@1.5.19 add pbakaus/impeccable@4d849eb75f216109ea7053ed21530a11fafcc786 --skill impeccable --agent codex
npx skills@1.5.19 add vercel-labs/agent-skills@f8a72b9603728bb92a217a879b7e62e43ad76c81 --skill vercel-react-best-practices --skill web-design-guidelines --skill deploy-to-vercel --agent codex
npx skills@1.5.19 add github/awesome-copilot@26fe2d126bf79aafb38f43344d450b69632200f8 --skill create-readme --skill documentation-writer --agent codex
```

This pack supports **Remix**. It derives exactly three project-specific directions from product truth and shows the same copy and viewport in every preview. Each pair must differ in at least three material visual dimensions. If taste is not material, the agent selects using audience fit, accessibility, maintainability, distinctiveness, and lower complexity, then records the evidence and decision in `launch/direction/decision.json`. Remix never changes confirmed claims, product behavior, documentation, safeguards, or completion checks.

Entry requires a matching working project with an immutable revision, documented run command, passing primary-flow smoke check, opportunity reference, project evidence, and recorded mismatches. If no working product exists, recommend Working Web App instead.

The underlying product must already work. Never invent adoption, benchmarks, compatibility, performance, security, or capabilities. Deployment, publishing, pushing, tagging, release creation, DNS, analytics, data collection, and provider mutations require separate explicit approval. A local site is prepared, not launched. `launch/launch-receipt.json` may use verified only with approval evidence, public URLs, immutable identifiers, a passing clean-room quickstart, fresh public checks, and rollback evidence.

## Software Opportunity Discovery

Slug: `software-opportunity-discovery`

Lane: `create`

Status: `stable`.

Public page: `https://possible.sh/packs/software-opportunity-discovery`

Use when a developer has a rough software ambition but no selected problem, user, or opportunity.

Outputs: demonstrated or conservative operator baseline; execution-gap analysis; dated problem evidence; alternatives and reachable-path landscape; three to five consistently scored opportunities; one provisional thesis or broaden or stop decision; machine-readable first-customer handoff; independent review.

Workstreams:

- Operator baseline and execution fit — `product-marketing`, `analytics`; owns `discovery/operator/`.
- Problems and observed workarounds — `customer-research`; owns `discovery/research/`.
- Alternatives and reachable paths — `competitor-profiling`, `product-marketing`; owns `discovery/market/`.
- Opportunity comparison and selection — `product-marketing`, `analytics`; runs after the first three workstreams and writes the opportunity brief and discovery receipt.
- Fresh review — `customer-research`, `competitor-profiling`, `analytics`; audits source reachability, scoring, operator assumptions, and the selection.

Sources:

- `coreyhaines31/marketingskills`: `customer-research`, `competitor-profiling`, `product-marketing`, `analytics`; reviewed `67264763cb107d61749f418d081c56e5bcbc0209`.

Install:

```bash
npx skills@1.5.19 add coreyhaines31/marketingskills@67264763cb107d61749f418d081c56e5bcbc0209 --skill customer-research --skill competitor-profiling --skill product-marketing --skill analytics --agent codex
```

When personal operator evidence is absent, disclose a conservative baseline: solo technical builder, Codex available, no privileged data, no established audience, and no assumed budget. Infer the operator requirements for every opportunity, what agents can cover, and the remaining execution gap. Do not block on a generic operator questionnaire or invent an advantage.

Compare exactly three to five traceable opportunities. Write `outcome-room/discovery-receipt.json` with exactly one status: `select`, `broaden`, or `stop`, plus `outcome-room/opportunity-brief.json`. A selected opportunity is ready for a first-customer attempt; it is not evidence of demand or approval to build.

Never invent operator capabilities, user quotes, demand, market size, willingness to pay, users, revenue, growth, or product-market fit. Discovery performs no outreach, experiment, prototype, or product build.

## First Customer Sprint

Slug: `first-customer-sprint`

Lane: `launch`

Status: `stable`.

Public page: `https://possible.sh/packs/first-customer-sprint`

Use when one specific product, service, or software opportunity and intended customer exist, but nobody has yet made a credible commercial commitment.

Outputs: customer, offer, price or commitment ask, delivery boundary, channel, timebox, and stop condition; prospect-access and authority preflight; local sales kit; approved prospect ledger; durable state and dated cycles; complete funnel evidence; money requested and collected; continue, revise, or stop receipt; independent review.

Workstreams:

- Customer, offer, and funnel baseline — `customer-research`, `product-marketing`, `analytics`; owns `sales/baseline/` and `sales/funnel.json`.
- Prospect access and authority preflight — `customer-research`, `competitor-profiling`, `analytics`; verifies real prospects and an allowed route to reach them.
- Offer and sales assets — conditional `product-marketing`, `customer-research`; creates only what is needed for the next sale.
- Approved prospecting and conversations — conditional `customer-research`, `product-marketing`, `analytics`; preserves every denominator, reply, refusal, meeting, no-show, problem, and objection.
- Approved commitment and close — conditional `product-marketing`, `customer-research`, `analytics`; asks for the strongest honest commitment supportable.
- Decision-critical proof or concierge delivery — conditional `create-technical-spike`, `product-marketing`, `analytics`; answers one objection from a real qualified prospect.
- Fresh review — `customer-research`, `analytics`, `product-marketing`; audits authorization, funnel integrity, commercial evidence, and the final decision.

Sources:

- `coreyhaines31/marketingskills`: `customer-research`, `competitor-profiling`, `product-marketing`, `analytics`; reviewed `67264763cb107d61749f418d081c56e5bcbc0209`.
- `github/awesome-copilot`: `create-technical-spike`; reviewed `26fe2d126bf79aafb38f43344d450b69632200f8`.

Install:

```bash
npx skills@1.5.19 add coreyhaines31/marketingskills@67264763cb107d61749f418d081c56e5bcbc0209 --skill customer-research --skill competitor-profiling --skill product-marketing --skill analytics --agent codex
npx skills@1.5.19 add github/awesome-copilot@26fe2d126bf79aafb38f43344d450b69632200f8 --skill create-technical-spike --agent codex
```

The sprint follows an explicit evidence ladder: reply → conversation → qualified problem → demo requested → pilot agreed → payment attempted → payment received → repeat use. It pursues the strongest ethical evidence presently available and never upgrades one rung into another.

The sprint may span days or weeks. Preserve `sales/state.json` and immutable records under `sales/cycles/`. Outreach, interviews, calls, fake doors, deployments, analytics, authenticated data, payments, spending, delivery promises, and scheduled follow-ups require exact separate approval. A schedule only invokes `$possible resume` for one bounded cycle; waiting and silence are not commercial evidence.

For physical products, the offer must disclose verified prototype state, inventory or production status, safety and claims boundaries, quantities, estimated timing, manufacturing dependencies, shipping scope, and cancellation and refund terms. A render, CAD model, preorder, or planned run is not finished inventory or evidence of safety, certification, manufacturability, delivery, or efficacy.

Write `outcome-room/first-customer-receipt.json` with exactly one status: `continue`, `revise`, or `stop`. Record the highest evidence rung reached, money requested and collected, what customers actually did, objections, the next product or sales boundary, and unresolved risks. The receipt recommends but does not authorize the next Outcome Pack.

## Working Hardware Prototype

Slug: `working-hardware-prototype`

Lane: `create`

Status: `stable`.

Public page: `https://possible.sh/packs/working-hardware-prototype`

Use when a consumer device, wearable, home object, wellness product, or connected physical product must become one functional, measured prototype before launch or sales.

Outputs: intended-use, functional, interface, and measurement specification; evidence and claims register; hazard and safe-state architecture; three physical directions and one decision; STEP assembly, drawings, components, BOM, and assembly instructions; electronics, controls, firmware, and bench harness; calibrated raw measurements; one instrumented physical prototype or explicit no-go; independent completion receipt.

Workstreams:

- Intended use, evidence, and claims boundary — `customer-research`, `product-marketing`; owns the specification, evidence ledger, and claims register.
- System architecture and hazard controls — `robotics-design-patterns`, `robotics-software-principles`; owns architecture, hazard analysis, safe defaults, limits, watchdog, timer, stop, reset, and human-use gates.
- Industrial form and interaction direction — `cad`, `product-marketing`; produces three comparable physical directions after intended use and safety pass.
- Mechanical system, CAD, and component ledger — `cad`, `step-parts`; owns STEP, drawings, tolerances, contact geometry, fixtures, BOM, and assembly sequence.
- Electronics, power, controls, and firmware — `create-technical-spike`, `robotics-software-principles`; owns schematics, components, protection, configuration, source, logging, and failure handling.
- Calibration and measurement system — `create-technical-spike`, `step-parts`; defines instruments, fixtures, units, sampling, uncertainty, thresholds, and nominal, boundary, and failing cases.
- Instrumented physical prototype and receipt — `cad`, `cad-viewer`, `create-technical-spike`; integrates only after exact physical-action approval and stops with no-go if authentic physical evidence is unavailable.
- Fresh review — `cad-viewer`, `create-technical-spike`, `robotics-design-patterns`; independently audits the artifact, measurements, hazards, claims, and status.

Sources:

- `coreyhaines31/marketingskills`: `customer-research`, `product-marketing`; reviewed `67264763cb107d61749f418d081c56e5bcbc0209`.
- `earthtojake/text-to-cad`: `cad`, `step-parts`, `cad-viewer`; reviewed `fdbb4b4fb62d95ae298cfe9a46fdc7092bdaf423`.
- `arpitg1304/robotics-agent-skills`: `robotics-design-patterns`, `robotics-software-principles`; reviewed `54f7b578f3dc269d29c0beb623b3f2611fd3a430`.
- `github/awesome-copilot`: `create-technical-spike`; reviewed `26fe2d126bf79aafb38f43344d450b69632200f8`.

Install:

```bash
npx skills@1.5.19 add coreyhaines31/marketingskills@67264763cb107d61749f418d081c56e5bcbc0209 --skill customer-research --skill product-marketing --agent codex
npx skills@1.5.19 add earthtojake/text-to-cad@fdbb4b4fb62d95ae298cfe9a46fdc7092bdaf423 --skill cad --skill step-parts --skill cad-viewer --agent codex
npx skills@1.5.19 add arpitg1304/robotics-agent-skills@54f7b578f3dc269d29c0beb623b3f2611fd3a430 --skill robotics-design-patterns --skill robotics-software-principles --agent codex
npx skills@1.5.19 add github/awesome-copilot@26fe2d126bf79aafb38f43344d450b69632200f8 --skill create-technical-spike --agent codex
```

This pack supports physical **Remix**. It holds intended use, function, components, safety, interfaces, claims, and measurement access constant while comparing three materially different form, ergonomic, material, component-layout, control, assembly, service, portability, or sensory directions. Styling cannot hide components or override hazards.

Purchasing, fabrication, external assembly, energized bench work, battery charging, hardware connection, and human testing each require separate exact approval. Health-adjacent products require qualified professional input for preliminary human-use exclusions and test boundaries. Missing parts, tools, authority, review, or physical evidence produces no-go; CAD, firmware, and synthetic traces cannot substitute.

Write `outcome-room/hardware-prototype-receipt.json` with exactly one status: `working`, `repair-required`, or `no-go`. Working means only that the locked prototype contract passed. It never means safe for sale, clinically effective, certified, manufacturable, or production-ready.

## Selection rule

Recommend the Outcome Pack whose finished outputs most closely match the user's desired end state:

- Web-app idea or rough repository plus its first complete locally verified user flow → Working Web App.
- Browser-game idea plus one polished playable build → Playable Web Game.
- Physical product plus launch presentation → Hardware Launch.
- Software product plus release and launch presentation → Software Launch.
- Existing repository plus trustworthy public release materials → Open-Source Release.
- Existing tested web app plus a reversible approved production deployment and smoke report → Production Web Release.
- Live web app plus a repeatable reliability, issue-triage, maintenance, incident-response, and safe-change cadence → Web App Operations.
- Existing product or offer plus a repeatable positioning, campaign-planning, draft-production, measurement, and review cadence → Marketing Operations.
- Rough ambition for an Atlassian-scale or billion-dollar SaaS company plus the complete product, growth, revenue, trust, and operating system → Billion-Dollar SaaS.
- Rough product idea plus feasibility, offer, campaign assets, audience system, and a real Kickstarter funding path → Kickstarter Funding.
- Funded Kickstarter campaign plus production, backer, logistics, communication, and 95%-shipped operations → Kickstarter Fulfillment.
- Robot hand, gripper, arm, mobile robot, quadruped, or full robot plus coherent CAD, description, controls, and simulation evidence → Robot Prototype.
- Consumer device, wearable, home object, wellness product, or connected physical product plus one functional measured physical artifact → Working Hardware Prototype.
- Pitch, talk, lesson, demo, or internal presentation plus a coded browser deck, presenter experience, export, and evidence review → Web Presentation.
- Working developer tool, library, CLI, API, agent project, or platform plus positioning, a distinctive site, honest demonstration, verified quickstart, and adoption path → Developer Project Launch.
- Vague software ambition with no selected opportunity plus one traceable provisional thesis and first-customer handoff → Software Opportunity Discovery.
- Selected product, service, or software opportunity plus real prospects, one concrete offer, and the strongest available commercial commitment → First Customer Sprint.

Recommend Software Opportunity Discovery when no opportunity is selected. Recommend Working Hardware Prototype when a selected consumer-hardware concept must become a measured physical artifact; Hardware Launch presents a product and Robot Prototype proves a simulated robot, so neither substitutes. Recommend First Customer Sprint when one selected direction should face a concrete offer and real prospects; require truthful prototype, safety, claims, manufacturing, delivery, and refund boundaries before physical-product payment or delivery promises. Recommend Working Web App only when customer evidence or another explicit delivery requirement makes a bounded application the next useful outcome. Use Developer Project Launch when a working developer project needs comprehension, presentation, proof, and a verified adoption path. Use Software Launch for a broader product release candidate, launch story, and film. Use Web Presentation when the primary deliverable is a slide-based browser presentation; a conventional landing page belongs elsewhere. Use Billion-Dollar SaaS when the user explicitly wants the broader company operating system and accepts that operational coverage cannot guarantee economic success. Use Kickstarter Funding when crowdfunding mechanics and payout are part of the outcome; use Kickstarter Fulfillment only after the campaign is funded. Use Robot Prototype for a simulation-backed digital prototype, not a fabrication-ready machine or hardware commissioning. Use Production Web Release when a tested candidate exists and the missing outcome is a gated production promotion with rollback and smoke evidence. Use Web App Operations only after the app is live and the desired outcome is an ongoing reliability and maintenance rhythm. Use Marketing Operations when the product or offer exists and the missing outcome is a recurring marketing system. Repository-only licensing, packaging, CI, versioning, and release engineering belong to Open-Source Release; one isolated bug, incident, or marketing asset with no requested recurring workflow is focused work, not an Outcome Pack run.

For an ambition spanning several valuable results, recommend only the next independently useful Outcome Pack. Choose it from the current reality and the most important unresolved decision; do not preselect a future sequence. After the outcome passes verification, reassess the new evidence before recommending zero or more candidates and stop for fresh approval. A strong matching working project may qualify for Developer Project Launch directly; a discovery receipt alone does not.

If none fits, say so. Do not force an Outcome Pack or invent a new one during intake.
