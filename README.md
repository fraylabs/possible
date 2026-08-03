# Possible

**AI made execution accessible. Possible makes operational judgment accessible.**

The [Robot Snake run](apps/web/public/demo/robot-snake/evidence/outcome-receipt.md) began with one rough idea: “I want to make a robot snake.” Possible supplied the missing robotics work and coordinated it as one outcome.

The run produced CAD, URDF/SRDF, MuJoCo control, obstacle avoidance, and Rerun telemetry. Fresh verification caught and repaired three defects. The final suite passed 12/12 tests and 186/186 interface checks.

A clean `/goal` control given the same rough idea produced a capable browser simulator, hardware plan, compiled firmware, and 18 tests. It did not infer the pack's CAD, robot descriptions, MuJoCo physics, autonomy proof, Rerun evidence, or fresh verification. [Inspect the preserved comparison](apps/web/public/demo/robot-snake/CONTROL-RUN.md).

`/goal` sustains dynamic pursuit. Possible supplies the reviewed outcome contract. They work together: persistence toward a stronger definition of done.

Possible.sh is an open-source library of Outcome Packs for Codex. An Outcome Pack combines an execution prompt, agent skills, sequencing, safeguards, and completion checks. The `$possible` skill understands the request, recommends a pack, asks for approval, and runs it.

## OpenAI Build Week

Possible is a Developer Tools submission built with Codex using GPT-5.6.

[Watch the demo](https://youtu.be/s35aGhVI2Eo) · [Explore the evidence](https://possible.sh/judging) · [Read the Build Week record](BUILD-WEEK.md)

## Judge Quickstart

Requirements: Codex with project skills enabled, Node.js 22 or newer, npm and a disposable project.

From that project:

```bash
npx @fraylabs/possible@0.1.11 init
```

Open or reload the project in Codex, then enter:

```text
$possible
Create a web presentation that explains this project to a technical audience.
```

Possible then:

1. clarifies the outcome;
2. recommends the Web Presentation Outcome Pack;
3. explains the work and approval boundaries;
4. waits for an explicit yes;
5. runs the approved work and completion checks.

After approval, inspect `.possible/outcome-brief.md`, `.possible/pack.json`, `.possible/skills-lock.json` and the final completion report.

The installer is idempotent and refuses to overwrite conflicting skill files. Outcome approval permits disclosed repo-local work only. Deployment, publishing, spending, outreach, fabrication and other external actions require separate approval.

## Public Outcome Packs

Possible publishes four active reviewed public packs. Experimental packs remain available for testing, while archived packs preserve their original specifications and links without appearing in new recommendations.

- [Playable Web Game](packages/packs/src/playable-web-game.ts) — a polished browser game with responsive controls and playability review.
- [Web Presentation](packages/packs/src/web-presentation.ts) — an evidence-backed coded deck with responsive presenter behavior.
- [Software Opportunity Discovery](packages/packs/src/software-opportunity-discovery.ts) — turns a rough software ambition into one provisional opportunity and a credible first-customer approach.
- [First Customer Sprint](packages/packs/src/first-customer-sprint.ts) — takes one selected product, service, or software opportunity to real prospects and pursues the strongest available commercial commitment.

The experimental [Mechanical CAD Review](packages/packs/src/mechanical-cad-review.ts) pack is the focused option for passive objects and simple mechanisms: editable CAD, explicit restraint and assembly proof, fit coupons, a vendor package, and an honest review boundary without launch-site or film work.

The experimental [Functional Hardware Prototype](packages/packs/src/functional-hardware-prototype.ts) pack builds the simplest integrated artifact that proves one physical function. Battery, high-energy, motion, thermal, living-contact, networked, and health-claim work activates only when the actual architecture requires it; concrete safety review follows the first coherent artifact while hazardous actions retain early hard stops.

The experimental [Launch Content Package](packages/packs/src/launch-content-package.ts) pack produces one truthful, post-ready package for selected channels. Text posts, static visuals, carousels, short videos, long videos, and threads activate independently; it does not add a three-direction exercise, every platform, analytics, or a campaign calendar.

The experimental [Crowdfunding Campaign Readiness](packages/packs/src/crowdfunding-campaign-readiness.ts) pack verifies one physical-product campaign package before platform entry. It consumes existing prototype, manufacturing, study-boundary, and final-content evidence, recomputes economics and rewards, then stops before publication, audience activation, pledges, or payout.

The experimental [Developer Product Readiness](packages/packs/src/developer-product-readiness.ts) pack turns one working capability into a coherent developer product. Website, agent Skill, MCP server, CLI or package, SDK or API, expanded docs, demo, examples, and deployment activate only when the actual users and product require them; every active surface must agree with one verified capability contract.

The experimental [Robot Digital Prototype](packages/packs/src/robot-digital-prototype.ts), [Production Readiness Decision](packages/packs/src/production-readiness-decision.ts), and [Research Protocol Readiness](packages/packs/src/research-protocol-readiness.ts) packs prove one bounded core outcome and activate subsystem, production, ethics, privacy, and regulatory modules only from the actual project.

The experimental [Crowdfunding Funding Run](packages/packs/src/crowdfunding-funding-run.ts) consumes a passing readiness receipt and controls exact publication, audience, campaign, and payout evidence. [Crowdfunding Fulfillment Operations](packages/packs/src/crowdfunding-fulfillment-operations.ts) begins only from a funded-settled run and reconciles physical, digital, regional, address, exception, and communication obligations without imposing a universal shipment percentage.

[Hardware Launch](packages/packs/src/hardware-launch.ts), [Kickstarter Funding](packages/packs/src/kickstarter-funding.ts), [Kickstarter Fulfillment](packages/packs/src/kickstarter-fulfillment.ts), [Robot Prototype](packages/packs/src/robot-prototype.ts), [Developer Project Launch](packages/packs/src/developer-project-launch.ts), [Developer Adoption Readiness](packages/packs/src/developer-adoption-readiness.ts), [Working Hardware Prototype](packages/packs/src/working-hardware-prototype.ts), [Launch Content Campaign](packages/packs/src/launch-content-campaign.ts), [Manufacturing Readiness](packages/packs/src/manufacturing-readiness.ts), and [Study Readiness](packages/packs/src/study-readiness.ts) are archived. Their original specifications and existing public links remain available for historical evidence, but Possible no longer recommends their mixed, incomplete, or universally heavyweight contracts.

The preserved PatchProof journey verifies Software Opportunity Discovery and Developer Project Launch as separate outcomes—and records why Possible no longer chooses their sequence in advance.

You do not need to choose a pack. `$possible` recommends one after understanding your outcome.

## See the evidence

- [Still / Hardware Launch](apps/web/public/demo/still/OUTCOME-RECEIPT.md) preserves the failed asset-path review, repair and passing rerun.
- [Robot Snake / Robot Prototype](apps/web/public/demo/robot-snake/evidence/outcome-receipt.md) preserves the simulation contract, fresh-review defects, repairs and remaining physical gaps.
- [Fold / Playable Web Game](apps/web/public/demo/fold/verification.md) links the playable build to its review evidence.
- [Possible / Web Presentation](apps/web/public/presentation/possible.html) is the coded browser deck itself.

The public gallery is available at [possible.sh/examples](https://possible.sh/examples). Each example contains both its finished outputs and its process record.

## Preserved Outcome Journey

The [PatchProof example](examples/patchproof-chain/EXAMPLE.md) began with “I want to discover, build, and launch a useful developer tool.” Three separate agents ran Software Opportunity Discovery → Working Web App → Developer Project Launch.

That fixed sequence exposed an important failure. Discovery identified direct developer validation as the next experiment and named manual evidence import as the largest unknown. The predeclared sequence still advanced to a browser app and launch package.

Possible now selects one outcome at a time. After verification, it records what became true, what remains unknown, the riskiest assumption, and the next decision. It may recommend a next Outcome Pack, but it stops for fresh approval. The completed sequence becomes an Outcome Journey only in retrospect.

The preserved hashes, reviews, receipts, and Remix work remain useful evidence of what each outcome produced. No deployment or publication was authorized.

```bash
npm run journey-example:verify
```

## How Possible works

Each Outcome Pack has a [typed manifest](packages/packs/src/types.ts). The [compiler](packages/packs/src/compiler.ts) prepares the prompt, skills, workstreams, and checks. The manifest defines:

- required outputs;
- independent workstreams and ownership;
- reviewed agent skills;
- approval gates;
- verification and the definition of done.

Each run freezes `.possible/runs/<run-id>/expectations.json` before implementation. Pack templates, explicit user expectations, and safe inferred preferences become one observable contract. Required expectations decide completion; preferred expectations guide tradeoffs without becoming hidden blockers. Workstreams, outputs, artifacts, verifier findings, and final results all map back to expectation IDs.

Possible then reviews one coherent integrated outcome—not a pile of individually passing parts—against that frozen contract. A failed required expectation becomes a preserved repair finding. The run repairs the actual artifact, reruns the affected verifier and the complete-outcome review, and passes only the final integrated revision where every active required expectation has direct evidence. This keeps validation and refinement attached to the prototype instead of turning them into preliminary ceremony; applicable hard stops and external-action gates still remain.

Each run writes one predictable `.possible/runs/<run-id>/outcome-record.json`. It indexes the approved brief, expectation contract, exact pack and skill versions, artifacts and hashes, expectation results, decisions, failures, repairs, approvals, limitations, and fresh verification. The linked files remain the evidence; the record makes it easy to extract.

After a verified run, Possible creates a new-reality checkpoint. It does not automatically begin another Outcome Pack or inherit approval into a future outcome.

## Built During Build Week

Commit [`afb5fc1`](https://github.com/fraylabs/possible/commit/afb5fc1c1e01d746753712ddc79f456df0984826) marks the product reset that introduced the current Outcome Pack architecture. The repository history after that boundary records the typed manifests, compiler, installable skill, CLI, public site, preserved runs and verification repairs.

[BUILD-WEEK.md](BUILD-WEEK.md) documents the implementation boundary, Codex session, Codex contributions and human product decisions.

## Repository

- `packages/packs` — typed manifests and compiler
- `apps/cli` — the published installer
- `apps/web` — website, documentation and demo evidence
- `skills/possible` — the conversational Codex workflow

## Verify

```bash
npm install
npm run check
```

The build publishes the four featured pack specifications and their compiled JSON and text contracts.

The [Robot Snake evaluation protocol](evaluations/robot-snake/README.md) preserves the exact comparison input, maps the pre-existing contract to direct evidence and verifies every published artifact checksum with `npm run evaluation:verify`.

## Supported surface

Possible is currently delivered and verified as a Codex project skill. The recorded runs were performed on macOS. The Node package is cross-platform; Windows has not been independently verified in this repository.
