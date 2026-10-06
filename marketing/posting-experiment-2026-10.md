# Possible organic posting experiment, Oct 2026

**Resumed Oct 5** with a narrower goal: real builders install the CLI, capture their own
sessions and publish recipes. Primary measures are those three; views are context only.
Social is X, Instagram and TikTok only (rule below). Those wait on accounts, so the first moves
use channels that need no new human-verified account: Possible's GitHub presence and
directories whose maintainers accept submissions.

**Rule, Brian Oct 6:** social is only X, Instagram and TikTok, on Possible's own accounts,
through the shared posting tool once it's announced. No Reddit, LinkedIn, Bluesky, Hacker News
or dev.to: the Reddit drafts, subreddit shortlist and dev.to how-to were removed. Still allowed,
because they're directory listings and our own repo rather than social posting: one honest
awesome-list PR per list and a Discussions post in fraylabs/possible, both through the GitHub
API from `fray-agents`. API first: browsers only for one-time sign-ins.

## Baseline — 2026-10-05 05:25 UTC

| Measure | Value | Source |
| --- | --- | --- |
| CLI release downloads (binaries) | v0.6.0: 1 (darwin-arm64) · v0.5.2: 1 · v0.5.1: 3 · v0.5.0 tgz: 2 · v0.4.0 tgz: 3 | `node marketing/snapshot.mjs` |
| npm `@fraylabs/possible` (legacy 0.3.1) | 20 / week | same |
| Outside publishers (sources not `fraylabs/*`) | **0** | `outcomes:listPublic`, `source_locator` |
| Published Outcomes | 21, all from `fraylabs/possible-outcomes` | same |
| Captured recipes (Recorded from session) | **0** (10 Reconstructed, 11 prompt-only) | same, `recipe.provenance.method` |
| Site visits, 7 days | 1 (our own `utm_source=test`) | `npm run visits -- --days 7` |
| Uses all-time / likes | 19 / 0 (unchanged since Oct 4) | snapshot |
| GitHub `fraylabs/possible` | 11 stars, 2 views/14d | snapshot |

Downloads count every install (brew and install.sh both fetch release assets), including
our own; treat single-digit moves as noise.

## Oct 5 changes (no new account needed)

- `fraylabs/possible` description was stale ("Outcome Packs … with Codex"). Now: "See what
  AI made and the recipe behind it…". Topics: dropped outcome-packs, verification,
  agentic-workflows; added claude-code, claude-skills, prompts, prompt-library, recipes,
  cli, ai-tools.
- `fraylabs/possible-outcomes`: added description, homepage and topics
  (possible-recipes, prompts, recipes, claude-code, codex, ai-agents).

## Channel status (Oct 5)

| Channel | Status | Blocker / next step |
| --- | --- | --- |
| X, Instagram, TikTok | No account yet | Posted through the shared posting tool (Fray in Public Owner) once it's announced. |
| Reddit, dev.to | Dropped Oct 6 | Not allowed (see the rule at the top). |
| Awesome lists, directories, Discussions | Not posted | Company rule: GitHub writes only as BrianLYS and never post or comment as BrianLYS, so listing PRs/issues and Discussion posts need a Possible GitHub account. Asked Possible Owner for a one-minute human step to create one. |
| Possible's own repos | Done | Description and topics only (metadata, not posts). |

## Oct 5, later

- Account plan changed (Operator 2): one shared GitHub machine account, `fray-agents`, for all
  Fray products; posts from it say they're from Fray's AI agents on behalf of Possible. The
  `possiblesh` credentials I'd stored were deleted.
- GitHub refused `github.com/signup` in the agent-driven Chrome ("Access is temporarily
  restricted", citing automation and developer tools). We didn't retry. The signup has to
  happen in a Chrome window that no agent is connected to. Human sequence is with ActAs Owner.
- Terminal Trove form fully filled in Possible's Chrome profile (saved there), waiting on
  the reCAPTCHA. Preview: `drafts/cli-recipe.gif` and `.png`, re-recorded on CLI 0.6.0,
  where `fetch` prints the recipe.
- Recorded demos (approved, not to be published until Brian reviews the first): falling-sand
  sandbox, one Claude Code session with 3 prompts, captured and the draft completed. Review
  and export are left to the creator, because the CLI forbids agents approving on the
  creator's behalf.
- Second recorded demo: flow-field poster maker (one Claude Code session, 2 prompts). Both
  drafts pass the CLI's manifest validation; media and the generated HTML are staged beside
  each draft. Waiting for Brian's review before anything recorded is published.

## Snapshot — 2026-10-05 10:15 UTC (before any post)

- Outcomes 24, all `fraylabs/possible-outcomes`: 3 **Recorded from session** (falling sand,
  flow field, robot snake; all ours), 10 Reconstructed, 11 prompt-only. Outside publishers 0.
- Binary downloads: v0.6.2 1, v0.6.1 1, v0.6.0 2, v0.5.2 1, v0.5.1 3. New releases today
  account for these; treat them as our own installs.
- Site visits 7d: 6 (5 direct, 1 test). Uses 19, likes 0 (unchanged).

## Directory rules checked (2026-10-05)

| Directory | Submission | Rule that matters | Decision |
| --- | --- | --- | --- |
| hesreallyhim/awesome-claude-code (55k) | Web issue form only | "resource recommendations must be created by human beings"; no `gh` CLI | **Do not submit** (agent). Human-only option, copy ready. |
| travisvn/awesome-claude-skills (15k) | PR | AI-assisted PRs "closed without comment" | **Do not submit** |
| agarrharr/awesome-cli-apps (20k) | PR | "AI-generated PRs are not welcome"; >3 months, >20 stars | **Do not submit** |
| RoggeOhta/awesome-codex-cli, milisp/awesome-codex-cli, ai-for-developers/awesome-ai-coding-tools | PR | Relevance, real value, one-line format | Qualifies; needs a Possible GitHub account |
| VoltAgent/awesome-agent-skills (35k) | PR | "Brand new skills … are not accepted" | Later |
| Terminal Trove | Web form | Image preview, author confirmation; reCAPTCHA on the form | Needs one human checkbox |
| skills.sh / claudemarketplaces.com | Automatic from `npx skills add` telemetry | — | Listed, but showing the old "Outcome Packs" SKILL.md and one Snyk WARN. One scratch install of ours on Oct 5 did not refresh it yet. Flagged to Possible Owner. |

---

# Oct 4 plan (on hold, kept for reference)

**On hold by Brian, Oct 4:** no posts were made. Bluesky is deprioritized because its
community is strongly anti-AI; if this resumes, prefer X, Reddit and developer communities.
Bluesky and Reddit signups were stopped at their captchas and not completed. Drafts
(MicroDuck for Bluesky and Reddit, the CLI clip and its VHS tape, profile bios) are in
[drafts/](drafts/).

Goal: learn what organic posting works for Possible, not volume. Each post tests one
thing on purpose. Organic only: no spend, DMs, cold outreach, vote asking or
sockpuppets. Posts never speak as Brian or for Fray Labs as a company.

Run by the Possible posting-experiment agent for Possible Owner. Snapshot numbers come
from `node marketing/snapshot.mjs` (public Convex counts, GitHub release downloads and
traffic, npm weekly downloads).

## What we can measure

| Signal | Source | Attributable to a post? |
| --- | --- | --- |
| Uses (copy prompt/recipe on web, `possible fetch`/`use` in CLI), deduplicated per visitor per day | Convex `outcomes:listPublic` `use_count` | Per-Outcome only; a jump on the posted Outcome within 48h is the best signal we have |
| Likes | Convex `like_count` | Same |
| CLI downloads | GitHub release assets (brew and install.sh both download these) | Timing only |
| npm downloads | api.npmjs.org (still 0.3.1) | Timing only, noisy |
| GitHub repo views, referrers | GitHub traffic API (14-day window) | Yes, by referrer host |
| Site visits | **None.** possible.sh is a static Cloudflare Pages site with no analytics beacon; the shared Cloudflare token lacks zone analytics | No |
| Platform stats | Views, likes, reposts, replies, votes on each post | Yes |

Outcome pages are client-rendered (`/outcomes/view/?id=…`), so a shared link shows the
generic homepage card. Posts attach media natively and put the link in the text.

Own test runs use `POSSIBLE_TELEMETRY=0` so they don't count as uses.

## Baseline — 2026-10-04 11:42 UTC

- 21 Outcomes listed. 10 Fray Labs Outcomes have recipes, all labelled **Reconstructed**;
  11 are prompt-only demos by outside creators (model creator-reported; some prompts are
  Fray adaptations). Creator media is theirs, not MIT: posts link or quote the creator's
  original rather than re-uploading it.
- Uses all-time: **19** (solar deck 4, cat shelter 4, robot snake 3, photo frame 2,
  robot hand 2, cyberpunk city 2, launch film 1, neon fluid 1; others 0). Likes: **0**.
- CLI downloads: v0.5.1 (released today) darwin-arm64 3, others 0; v0.5.0 tgz 2;
  v0.4.0 tgz 3. npm `@fraylabs/possible`: 20 in the week to Oct 3.
- GitHub `fraylabs/possible`: 11 stars, 2 views / 2 unique in 14 days (referrer github.com),
  100 clones / 69 unique. `fraylabs/possible-outcomes`: 0 stars, 0 views, 138 clones / 84 unique
  (clones are mostly the Possible indexer and CI, not people).

## Accounts

Credentials live only in Infisical project `possible`, prod:/marketing. The inbox
connection is in prod:/actas. Accounts are created in a dedicated Chrome profile, not Brian's.

| Channel | Handle | Email used | Status (2026-10-04) |
| --- | --- | --- | --- |
| Hacker News | `possiblesh` | none (HN needs no email) | Created; not used for posting (see rules) |
| Bluesky | `possiblesh.bsky.social` → `@possible.sh` planned | ActAs inbox `agent-4b17e6db66da5522165e1c36@mail.actas.dev` | Not created: stopped at hCaptcha, then put on hold |
| Reddit | `possiblesh` planned | ActAs inbox | Not created; Reddit dropped Oct 6 |
| X | — | ActAs inbox | Signup requires a phone number; not created (brief: no Brian phone) |

The ActAs address is temporary; accounts move to an ActAs identity once delegated
provisioning is live.

## Community rules checked

| Channel | Checked | Rule that matters | Decision |
| --- | --- | --- | --- |
| Hacker News | 2026-10-04, [guidelines](https://news.ycombinator.com/newsguidelines.html) | "Don't post generated text or AI-edited text." "Please don't automate posting." Own stuff ok part of the time. | **Do not post.** An agent writing and submitting would break both rules. Account `possiblesh` exists; a Show HN draft goes to Possible Owner for a human to write and post. |

## Plan: formats and what each tests

| # | Format | Content | Tests |
| --- | --- | --- | --- |
| A | Short video | MicroDuck: an agent trained a robot duck to dance with RL in simulation for $2.86 of compute; exact prompt linked | Does a concrete, surprising result plus cost hook travel? |
| B | CLI clip | `possible search "teach a robot duck a dance"` then `possible fetch` prints the exact prompt | Do developers respond to the CLI/agent-tool angle? |
| C | Single striking image | Cat shelter CAD with the pinned skills | Does a static engineering result get saves/clicks? |
| D | "How it was made" breakdown | Digital photo frame: enclosure, schematic, PCB in one run, and where it failed (PCB fails DRC) | Does honesty about failure earn more discussion than a polished win? |
| E | Remake challenge | A creator's disclosed prompt (credited): run it in your agent and reply with your result | Does an invitation produce replies/remakes? |

Channels: Bluesky, Reddit (communities whose rules allow it), X if it can be verified
without Brian's phone. Times vary between US morning (13–15 UTC) and Asia/Europe (06–09 UTC).

Every link is tagged `?utm_source=<platform>&utm_campaign=<post-id>` (post IDs `p01-…`)
so first-party visit counts can attribute visits once they're live.

Subreddit shortlist removed Oct 6 (Reddit is off; see the rule at the top).

## Post log

| # | Date (UTC) | Channel | Format | Link | Tests | 24–48h result | Site/CLI signal |
| --- | --- | --- | --- | --- | --- | --- | --- |

## Notes and learnings
