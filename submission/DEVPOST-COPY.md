# Possible — Build Week submission copy

## Submission fields

**Project name:** Possible

**Track:** Developer Tools

**Tagline:** Open-source Outcome Packs for Codex.

**One-line description:** Possible turns a rough ambition into an expert-shaped, coordinated, independently verified outcome by giving Codex the reviewed operational knowledge a non-expert may not know to request.

**Primary link after deploying and live-verifying the frozen candidate:** https://possible.sh

**Source after pushing the frozen candidate:** https://github.com/fraylabs/possible

**Demo video:** `[ADD PUBLIC YOUTUBE URL AFTER FINAL CUT]`

**Primary Codex `/feedback` session ID:** `[ADD THE CORE GPT-5.6 BUILD SESSION]`

## Short pitch

AI made execution accessible. It did not make operational judgment accessible. A non-expert can ask Codex to launch a product, release software, or operate a company, but may not know all the work, decisions, safeguards, and quality checks a strong outcome requires.

Possible makes that missing operational knowledge accessible. It turns a rough ambition into expert-shaped work: surfacing requirements the user omitted, asking only the decisions that can change the result, coordinating the necessary specialties, defining what done means, and independently checking the integrated outcome.

Possible.sh is an open-source library of Outcome Packs for Codex. Each pack combines a reusable execution prompt, selected agent skills, sequencing, safeguards, and completion checks for one outcome. The `$possible` skill understands the request, recommends one pack, explains its outputs and boundaries, and waits for approval before starting the run.

**Skills give agents capabilities. Outcome Packs coordinate them toward a complete result.**

## Inspiration

Codex can build a frontend, review a repository, render a film, or produce CAD. But users are still expected to know which of those tasks a real outcome requires, what is missing, how the pieces must agree, where approval is necessary, and what evidence is strong enough to call the work complete.

We built Possible for solo developers and small technical teams who want to build, launch, release, and operate with Codex without already possessing every discipline involved—or becoming full-time prompt coordinators.

## What it does

Possible adds three things to Codex:

1. **Outcome discovery.** A short conversation turns rough intent into a confirmed end state, identifies missing knowledge, and recommends one Outcome Pack. Before approval, Possible performs read-only intake: it installs no agent skills, writes no project state, and starts no production work.
2. **Coordinated execution.** Typed TypeScript manifests record selected skills, outputs, bounded areas of work, safeguards, and verification. The approved run installs the disclosed skills, writes project-specific completion checks, coordinates parallel work, and integrates the result.
3. **Completion with evidence.** A fresh verification-only agent checks the integrated result. Failures, skipped checks, limitations, and unproven claims remain in the completion report.

The current source candidate contains twelve Outcome Packs across build, launch, release, and recurring operations. The published `0.1.6` judge package contains seven; a new candidate must be packed, independently installed, and published before claiming the five newer packs through the npm install path. The user does not need to choose a category, agent skill, or intermediate task. `$possible` recommends the pack from the desired result.

## What an Outcome Pack contains

Possible includes reusable prompts, but the prompt is only one part of each pack:

- typed, versioned pack manifests;
- reviewed capability sources and revisions;
- deterministic installation-command and execution-prompt generation;
- bounded ownership and a defined integration sequence;
- explicit external-action gates;
- promised outputs and verification contracts;
- fresh independent review; and
- preserved completion reports for failures, passes, skips, and unknowns.

The website, static publications, and MCP tools consume the typed pack registry directly. The installed Codex skill carries a reviewed fallback snapshot so it can work without MCP; the package and source versions are disclosed because that snapshot can lag.

## A real verification moment

For Still, a fictional palm-sized e-ink focus device, Possible coordinated a launch website, a 24-second 1080p product film, STEP-first prototype CAD, a local-only waitlist contract, and an integrated evidence room.

Production checks were green, but Possible did not stop there. A fresh reviewer opened the integrated room in a real browser and found that the embedded site requested root-relative JavaScript and CSS. Both assets returned 404, so the site did not render. The reviewer preserved the failed trace and did not modify implementation. The coordinating agent changed the Vite base to `./`, rebuilt and recopied the site, and sent the complete outcome through fresh verification again.

The repaired result passed 58/58 artifact checks. All 50 recorded browser responses were successful with zero console errors, page errors, or non-OK responses. The remaining CAD Viewer launcher failure and unproven physical claims stayed disclosed.

**Production is not completion. Possible stops only when the outcome passes—or returns an honest no-go.**

## Controlled pilot

We also froze one Daymark product brief and ran five fresh Codex coordination conditions that inherited the same model configuration in clean worktrees with the same workspace rules and a common independent verifier. The Direct and Possible treatments both complied with their assigned method:

| Condition | Independent outcome | Required checks | Elapsed | Human coordination after dispatch |
| --- | --- | ---: | ---: | --- |
| Direct | Not verified | 19/20 | 715 s to stop | 0 follow-ups |
| Possible | Verified | 20/20 | 1,850 s | 2 follow-ups / 14 words / 1 approval |

Direct passed its tests and build, but independent production-browser verification found keyboard submission did not work. Possible passed all 20 frozen checks and its treatment contract.

The Possible condition used the then-published `@fraylabs/possible@0.1.6`; the submission source is the separately verified `0.1.7` candidate. The submission owner must attach the official GPT-5.6 Codex session evidence rather than asking the repository to prove a model label it did not record.

This is a **one-run pilot, not proof of typical superiority**. It has no replication, randomization, variance estimate, or confidence interval. Possible also took longer and required an explicit approval. Spec-, plan-, and goal-led runs are preserved alongside these results; two failed their assigned treatment, so treatment fidelity and outcome success must not be conflated. We publish the protocol, traces, machine-readable results, verifier report, failures, and limitations so judges can inspect the observation rather than accept a marketing claim.

## How we built it

- A TypeScript Outcome Pack registry produces installation commands and reusable execution prompts.
- A repo-local npm CLI installs the Possible Codex skill with conflict checks; the repository candidate is `0.1.7`, the published package is `0.1.6`, and both require Node.js 22 or newer.
- A read-only MCP server exposes `list_packs` and `compile_pack`.
- The installed skill handles intake, recommendation, confirmation, execution, resume, and external-action gates.
- A Next.js site publishes the pack catalog, raw JSON and text contracts, documentation, recorded runs, artifacts, transcripts, and benchmark evidence.
- Node tests, browser checks, schema validation, static-publication checks, and artifact-specific verifiers protect the implementation and its public evidence.

Possible is currently presented and verified for Codex. The recorded demo and pilot were produced locally on macOS; this submission does not claim cross-platform outcome equivalence or real-user validation.

## Challenges

The hardest design problem was separating capability from authority. Installing a deployment, CAD, or marketing skill cannot silently authorize publishing, fabrication, spending, outreach, credentials, or customer-data access. Possible therefore treats run approval as permission for disclosed repo-local work only and gates consequential external actions separately.

The second challenge was resisting attractive but unsupported claims. The pilot result is useful evidence from these runs, but it cannot establish a general performance ranking. The product preserves negative evidence—including the Still 404 trace, a remaining CAD Viewer limitation, and benchmark treatment failures—because trust depends on knowing what did not pass.

## Accomplishments and learning

We are proud that the strongest demo moment is a failure. The first integrated Still build looked complete, yet the verification-only agent found a real broken path, the coordinating agent repaired it, and the same outcome passed fresh checks. That made the product thesis concrete: the value is not more generated output; it is operational knowledge that carries work through integration and proof.

We learned that independent executable checks matter more than self-authored completion reports, and that human judgment is most valuable at outcome choice, approval boundaries, and consequential actions—not in manually coordinating every intermediate task.

## What is next

Next we will repeat the frozen pilot to measure variation, expand negative fixtures for integration failures, improve pack-authoring ergonomics, and validate the workflow with solo developers and small engineering teams. Until replicated evidence exists, we will keep the public comparison labeled as a measured pilot.

## Installation

Requirements: Codex, Node.js 22+, and npm/npx.

```bash
npx @fraylabs/possible@0.1.6 init
```

That pinned command reproduces the published package used by the controlled run. To test the exact unpublished source candidate from another target repository, run `node /absolute/path/to/possible/apps/cli/src/index.mjs init`. Update the judge command only after `0.1.7` is published and independently verified from npm.

Open or reload the project in Codex, then invoke:

```text
$possible
```

Repository verification:

```bash
npm install
npm run check
```

## Built during Build Week — evidence note

The repository-observed product-reset boundary is `afb5fc1` on 2026-07-18. Official eligible range: `[FIRST ELIGIBLE COMMIT]..[FINAL SUBMISSION COMMIT]` — confirm both endpoints against the event timestamps and freeze them before submission. The observable history from the reset records the typed Outcome Pack registry, prompt generator, CLI, MCP, website, documentation, recorded runs, failure evidence, recurring-operation gates, and controlled pilot; that component list becomes a Build Week claim only after the owner confirms the eligible range.

Codex contributed implementation, parallel specialist execution, artifact generation, tests, browser inspection, completion reports, and independent verification. The submission owner must attach the official task record establishing GPT-5.6 usage. The human chose the product thesis, outcome model, pack boundaries, target users, acceptance standard, and which claims were safe to publish.

## Closing line

**Stop prompting tasks. Start specifying outcomes. Make it Possible.**
