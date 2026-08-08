# Possible

**AI made execution accessible. Possible makes operational judgment accessible.**

The [Robot Snake run](apps/web/public/demo/robot-snake/evidence/outcome-receipt.md) began with one rough idea: “I want to make a robot snake.” Possible supplied the missing robotics work and coordinated it as one outcome.

The run produced CAD, URDF/SRDF, MuJoCo control, obstacle avoidance, and Rerun telemetry. Fresh verification caught and repaired three defects. The final suite passed 12/12 tests and 186/186 interface checks.

A clean `/goal` control given the same rough idea produced a capable browser simulator, hardware plan, compiled firmware, and 18 tests. It did not infer the pack's CAD, robot descriptions, MuJoCo physics, autonomy proof, Rerun evidence, or fresh verification. [Inspect the preserved comparison](apps/web/public/demo/robot-snake/CONTROL-RUN.md).

`/goal` sustains dynamic pursuit. Possible supplies the outcome contract and its evidence boundary. They work together: persistence toward a stronger definition of done.

Possible.sh is an open-source library of Outcome Packs for Codex. An Outcome Pack combines a Structured Prompt, agent Skills, and an Expectations checklist; the compiler assembles one deterministic Run Prompt. The `$possible` skill understands the request, searches the current catalog, recommends a pack, asks for approval, and runs it.

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

The catalog is generated from accepted, immutable pack snapshots rather than a list embedded in the `$possible` skill. Each catalog record keeps authorship and trust separate:

- the source record identifies the author repository, exact Git revision, manifest path, and content hash;
- the accepted snapshot preserves the exact bytes indexed by Possible;
- the trust record says whether the pack is listed, experimental, verified, or archived and links any accepted run evidence.

You do not need to memorize or choose a pack. `$possible` searches the current catalog after understanding your outcome, rejects explicit non-fit, and explains the status and evidence behind its recommendation. New accepted packs become discoverable without changing the skill.

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

Each Outcome Pack has a [JSON manifest](packages/packs/src/manifests/playable-web-game.json) validated by the [manifest loader](packages/packs/src/manifest.ts). The [compiler](packages/packs/src/compiler.ts) prepares the prompt, skills, workstreams, and checks. The manifest defines:

- required outputs;
- independent workstreams and ownership;
- reviewed agent skills;
- approval gates;
- verification and the definition of done.

Pack authoring stays deliberately small: a Structured Prompt, reviewed Skills, and an Expectations checklist. The Structured Prompt is the manifest's promise, summary, fit, workstreams, outputs, guardrails, and verification fields—not a second prose blob. The compiler turns those fields into one deterministic Run Prompt. Domain-specific contract objects, module registries, plugin lists, schedules, prerequisites, remix schemas, and bespoke compiler branches are not part of the authoring surface; put genuinely necessary guidance in the Structured Prompt or express it as an expectation.

Each run freezes `.possible/runs/<run-id>/expectations.json` before implementation. Pack templates, explicit user expectations, and safe inferred preferences become one observable contract. Required expectations decide completion; preferred expectations guide tradeoffs without becoming hidden blockers. Workstreams, outputs, artifacts, verifier findings, and final results all map back to expectation IDs.

Possible then reviews one coherent integrated outcome—not a pile of individually passing parts—against that frozen contract. A failed required expectation becomes a preserved repair finding. The run repairs the actual artifact, reruns the affected verifier and the complete-outcome review, and passes only the final integrated revision where every active required expectation has direct evidence. This keeps validation and refinement attached to the prototype instead of turning them into preliminary ceremony; applicable hard stops and external-action gates still remain.

Each run writes one predictable `.possible/runs/<run-id>/outcome-record.json`. It indexes the approved brief, expectation contract, exact pack and skill versions, artifacts and hashes, expectation results, decisions, failures, repairs, approvals, limitations, and fresh verification. The linked files remain the evidence; the record makes it easy to extract.

After a verified run, Possible creates a new-reality checkpoint. It does not automatically begin another Outcome Pack or inherit approval into a future outcome.

### Core model

Possible keeps the user-facing model small:

- **Outcome** — the observable end state the user wants to make true.
- **Outcome Pack** — a versioned contract for one class of outcomes, including its Structured Prompt, Skills, and Expectations.
- **Run** — one approved pack applied to one project and one frozen brief.
- **Expectation** — an acceptance condition describing what must become true. Expectations are not outputs or tasks.
- **Output** — an inspectable artifact or deliverable produced by the run.
- **Evidence** — a preserved observation, measurement, test, or review record linked to an expectation.
- **Verification** — an independent attempt to determine whether the active expectations are true.
- **Checkpoint** — the new reality recorded after a run, including unknowns and the next decision.

Catalog trust status is visible discovery evidence, not a workflow primitive or permission. The legacy lane field remains internal browsing metadata. An Outcome Journey is retrospective: it is visible only after separate outcomes have been verified, not a predeclared sequence.

## Built During Build Week

Commit [`afb5fc1`](https://github.com/fraylabs/possible/commit/afb5fc1c1e01d746753712ddc79f456df0984826) marks the product reset that introduced the current Outcome Pack architecture. The repository history after that boundary records the JSON manifests, compiler, installable skill, CLI, public site, preserved runs and verification repairs.

[BUILD-WEEK.md](BUILD-WEEK.md) documents the implementation boundary, Codex session, Codex contributions and human product decisions.

## Repository

- `packages/packs` — canonical JSON manifests, schema validation, and compiler
- `apps/cli` — the published installer
- `apps/web` — website, documentation and demo evidence
- `skills/possible` — the conversational Codex workflow

## Author private packs

Public and project-local packs use the same JSON contract. Start a private pack in the project that owns it:

```bash
possible pack init my-pack
possible pack validate my-pack
possible pack inspect my-pack
possible pack compile my-pack
```

Draft packs can be edited and validated but cannot compile until reviewed. MCP only distributes accepted public catalog snapshots; the Possible skill and local CLI handle private packs and execution.

To contribute a public pack, keep its source in your own GitHub repository, export an exact source record and immutable snapshot, then open a normal pull request. The focused CI path validates the source commit, bytes, manifest, and generated catalog without letting authors assign trust. See [CONTRIBUTING.md](CONTRIBUTING.md).

## Verify

```bash
npm install
npm run packs:check
```

`packs:check` is the fast inner-loop check for Outcome Pack work. The full
`npm run check` release gate also builds the website and verifies every demo,
publication, and historical evidence bundle.

The build publishes discoverable pack specifications plus retained archived pack pages and their compiled JSON and Run Prompt contracts.

The [Robot Snake evaluation protocol](evaluations/robot-snake/README.md) preserves the exact comparison input, maps the pre-existing contract to direct evidence and verifies every published artifact checksum with `npm run evaluation:verify`.

## Supported surface

Possible is currently delivered and verified as a Codex project skill. The recorded runs were performed on macOS. The Node package is cross-platform; Windows has not been independently verified in this repository.
