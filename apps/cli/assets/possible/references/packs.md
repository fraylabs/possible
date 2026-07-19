# Possible pack catalog

Use this bundled snapshot when the Possible MCP tools are unavailable. Link the recommended pack's public page during the recommendation; disclose its relevant source list and reviewed revisions before installing it.

Lanes are browsing labels only: Create is a first complete usable thing, Launch is a compelling public presentation, Release is evidence-backed readiness to ship or distribute, and Operate is a repeatable ongoing workflow. Do not ask the user to choose a lane; select across the complete catalog from the desired finished outputs.

## Hardware Launch

Slug: `hardware-launch`

Lane: `launch`

Public page: `https://possible.sh/packs/hardware-launch`

Use for a physical-product idea or prototype that needs one coherent launch presentation.

Outputs: launch site, launch film, prototype CAD, honest waitlist contract, approved MVP deployment or deployment-ready no-go receipt, evidence report.

Optional captain capability: OpenAI `@sites` plugin (`$sites-building`, `$sites-hosting`), reviewed at plugin version `0.1.30`. When it is available in the current Codex workspace, prefer it for a new MVP launch-site deployment so no separate Vercel registration is needed. It is not installed by the Skills CLI commands below. Deployment and provider mutations still require separate explicit approval.

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
npx skills@1.5.19 add anthropics/skills --skill frontend-design --skill webapp-testing --agent codex
npx skills@1.5.19 add vercel-labs/agent-skills --skill vercel-react-best-practices --agent codex
npx skills@1.5.19 add remotion-dev/skills --skill remotion-best-practices --agent codex
npx skills@1.5.19 add earthtojake/text-to-cad --skill cad --agent codex
```

Never imply manufacturing readiness, physical validation, certification, or customer demand. Deployment, fabrication, purchasing, outreach, and real waitlist collection remain separate gates.

## Software Launch

Slug: `software-launch`

Lane: `launch`

Public page: `https://possible.sh/packs/software-launch`

Use for an existing working software product whose primary flow already exists but needs a coherent release and launch presentation.

Outputs: stabilized product release candidate, launch site, demo film, approved MVP deployment or deployment-ready no-go receipt, evidence report.

Optional captain capability: OpenAI `@sites` plugin (`$sites-building`, `$sites-hosting`), reviewed at plugin version `0.1.30`. Prefer it for a new MVP deployment when it is available and no provider is already selected; retain `deploy-to-vercel` as the reviewed fallback for an existing authorized Vercel target. The plugin is not installed by the Skills CLI commands below. Either external path requires separate explicit approval.

Workstreams:

- Product release candidate — `vercel-react-best-practices`; stabilizes the existing release candidate and owns `product/` and its test receipt.
- Launch site — `frontend-design`; owns `site/` and the launch narrative.
- Demo film — `remotion-best-practices`; owns `film/` and the rendered preview.
- Release readiness — `web-design-guidelines`; owns `release/` and the deployment plan. The captain retains `sites-hosting` or `deploy-to-vercel` until separate deployment approval.
- Fresh review — `webapp-testing`, `web-design-guidelines`; verifies the integrated outcome.

Sources:

- `anthropics/skills`: `frontend-design`, `webapp-testing`; reviewed `fa0fa64bdc967915dc8399e803be67759e1e62b8`.
- `vercel-labs/agent-skills`: `vercel-react-best-practices`, `web-design-guidelines`, `deploy-to-vercel`; reviewed `f8a72b9603728bb92a217a879b7e62e43ad76c81`.
- `remotion-dev/skills`: `remotion-best-practices`; reviewed `ab22f5fa89962ec943eaa18797cbf38c9d727743`.

Install:

```bash
npx skills@1.5.19 add anthropics/skills --skill frontend-design --skill webapp-testing --agent codex
npx skills@1.5.19 add vercel-labs/agent-skills --skill vercel-react-best-practices --skill web-design-guidelines --skill deploy-to-vercel --agent codex
npx skills@1.5.19 add remotion-dev/skills --skill remotion-best-practices --agent codex
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
npx skills@1.5.19 add github/awesome-copilot --skill github-release --skill create-readme --skill documentation-writer --skill github-actions-hardening --skill security-review --agent codex
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
npx skills@1.5.19 add mrgoonie/claudekit-skills --skill threejs --agent codex
npx skills@1.5.19 add dylantarre/animation-principles --skill game-designer --skill mobile-touch --agent codex
npx skills@1.5.19 add anthropics/skills --skill frontend-design --skill webapp-testing --agent codex
```

Never imply player demand, accessibility, compatibility, performance, or production readiness beyond direct evidence. Deployment, publishing, analytics, paid assets, and external distribution remain separate gates.

## Web App Operations

Slug: `web-app-operations`

Lane: `operate`

Public page: `https://possible.sh/packs/web-app-operations`

Use for an existing live web app that needs a repeatable or scheduled operating loop for detecting problems, triaging work, maintaining dependencies, and recovering safely. A request such as “schedule operations” selects this pack when the application is already live.

Outputs: executable operations check and dated health baseline, issue intake and prioritized operations queue, dependency and security maintenance loop, incident/change/rollback runbooks, exercised recovery drill, first dated operations receipt, scheduling-ready task prompt, and—only when separately approved—an enabled schedule receipt.

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
npx skills@1.5.19 add anthropics/skills --skill webapp-testing --agent codex
npx skills@1.5.19 add github/awesome-copilot --skill impediment-prioritization --skill dependabot --skill security-review --skill devops-rollout-plan --skill incident-postmortem --agent codex
```

Establish the durable workflow and execute its first dated cycle manually before offering a schedule. For recurring operations, default to a standalone scheduled task in an isolated worktree whose prompt invokes `$possible resume`, runs one cycle, writes a new dated receipt, reports findings, and stops at every external-action gate. Show the exact cadence, timezone, project, execution mode, prompt, and permissions before requesting separate approval to create or enable it. If scheduled-task management is unavailable, provide a tested scheduling-ready prompt without claiming a task exists.

One health snapshot never proves uptime. Preserve empty queues, skipped checks, unavailable signals, unresolved work, and unproven claims honestly. Scheduled-task changes, production changes, issue-tracker writes, monitoring changes, deploys, rollbacks, paging, status communication, and customer-data access remain separate gates.

## Working Web App

Slug: `working-web-app`

Lane: `create`

Public page: `https://possible.sh/packs/working-web-app`

Use when an idea, prototype, or rough repository needs to become a small locally runnable web product with one complete verified user flow—not a launch campaign or deployment.

Outputs: locally runnable working application, primary-flow and state contract, reproducible fixtures or demo data, automated checks, production build, evidence report.

Workstreams:

- Product flow and states — `frontend-design`; owns `product/flow.md`, `product/states.md`, and `product/data-contract.md`.
- Working application — `frontend-design`; owns application source, fixtures, and the production build.
- Automated product proof — `webapp-testing`; owns tests, the repeatable verification command, and the implementation receipt.
- Fresh review — `webapp-testing`, `security-review`; verifies the integrated app and reports scoped risks without claiming security.

Sources:

- `anthropics/skills`: `frontend-design`, `webapp-testing`; reviewed `fa0fa64bdc967915dc8399e803be67759e1e62b8`.
- `github/awesome-copilot`: `security-review`; reviewed `26fe2d126bf79aafb38f43344d450b69632200f8`.

Install:

```bash
npx skills@1.5.19 add anthropics/skills --skill frontend-design --skill webapp-testing --agent codex
npx skills@1.5.19 add github/awesome-copilot --skill security-review --agent codex
```

Prove clean local setup, one complete user job, one material failure path, every promised state and persistence boundary, a production build, responsive browser behavior, and an exact receipt. Deployment, publishing, analytics, third-party services, and real customer data remain separate gates. Never call a local build secure, scalable, reliable, or production-ready.

## Production Web Release

Slug: `production-web-release`

Lane: `release`

Public page: `https://possible.sh/packs/production-web-release`

Use when an existing tested web app needs a gated, reversible production release with an immutable candidate, verified preview, exact approval, rollback path, post-deploy smoke evidence, and final receipt. Automated execution supports the reviewed OpenAI Sites and Vercel adapters; other providers stop at a provider-neutral no-go receipt.

Optional captain capability: OpenAI `@sites` plugin (`$sites-building`, `$sites-hosting`), reviewed at plugin version `0.1.30`. If `.openai/hosting.json` exists, use Sites. Otherwise prefer it for a new MVP target when available, so no separate Vercel registration is needed. It is not installed by the Skills CLI commands below. Every Sites URL is production, and exact provider mutations remain separately gated.

Outputs: pinned release candidate and provider inventory, security and pipeline preflight, rollout and rollback plan, preview smoke receipt, approved production deployment or no-go receipt, post-deployment evidence, final release receipt.

Workstreams:

- Candidate and release readiness — `devops-rollout-plan`, `security-review`; owns the candidate record, preflight, rollout plan, and rollback plan.
- Provider and delivery path — `github-actions-hardening`; owns provider evidence, pipeline review, and exact deploy commands. The captain holds `sites-hosting` or `deploy-to-vercel` until the separate exact production approval.
- Release verification — `webapp-testing`; owns repeatable preview, production, and rollback-recovery checks and receipts.
- Fresh review — `webapp-testing`, `devops-rollout-plan`; verifies the integrated release evidence before any promotion.

Sources:

- `github/awesome-copilot`: `devops-rollout-plan`, `github-actions-hardening`, `security-review`; reviewed `26fe2d126bf79aafb38f43344d450b69632200f8`.
- `anthropics/skills`: `webapp-testing`; reviewed `fa0fa64bdc967915dc8399e803be67759e1e62b8`.
- `vercel-labs/agent-skills`: `deploy-to-vercel`; reviewed `f8a72b9603728bb92a217a879b7e62e43ad76c81`.

Install:

```bash
npx skills@1.5.19 add github/awesome-copilot --skill devops-rollout-plan --skill github-actions-hardening --skill security-review --agent codex
npx skills@1.5.19 add anthropics/skills --skill webapp-testing --agent codex
npx skills@1.5.19 add vercel-labs/agent-skills --skill deploy-to-vercel --agent codex
```

Pack confirmation does not authorize production. Workstreams prepare evidence first; the captain integrates it, records go or no-go, and asks again for approval naming the provider, account or team, project, production target, exact candidate, method, and accepted risks. Do not mutate provider state, secrets, databases, DNS, billing, repositories, or workflows without approval for that exact action. Never infer success, availability, security, or rollback readiness from a plan or one browser pass.

## Selection rule

Recommend the pack whose finished outputs most closely match the user's desired end state:

- Web-app idea or rough repository plus its first complete locally verified user flow → Working Web App.
- Browser-game idea plus one polished playable build → Playable Web Game.
- Physical product plus launch presentation → Hardware Launch.
- Software product plus release and launch presentation → Software Launch.
- Existing repository plus trustworthy public release materials → Open-Source Release.
- Existing tested web app plus a reversible approved production deployment and smoke receipt → Production Web Release.
- Live web app plus a repeatable reliability, issue-triage, maintenance, incident-response, and safe-change cadence → Web App Operations.

Use Working Web App when the missing outcome is the product itself. Use Software Launch when the product works and the missing outcome is its public story, site, and demo. Use Production Web Release when a tested candidate exists and the missing outcome is a gated production promotion with rollback and smoke evidence. Use Web App Operations only after the app is live and the desired outcome is an ongoing rhythm. A distributable repository release belongs to Open-Source Release; one isolated bug or incident with no requested recurring workflow is focused work, not a pack.

If none fits, say so. Do not force a pack or invent a new one during intake.
