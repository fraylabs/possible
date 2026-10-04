# Possible organic posting experiment, Oct 4–18 2026

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
| Bluesky | `possiblesh.bsky.social` → `@possible.sh` planned | ActAs inbox `agent-4b17e6db66da5522165e1c36@mail.actas.dev` | Form filled; stopped at hCaptcha, needs a human |
| Reddit | `possiblesh` planned | ActAs inbox | Registration opens with a "prove your humanity" challenge; needs a human |
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

## Post log

| # | Date (UTC) | Channel | Format | Link | Tests | 24–48h result | Site/CLI signal |
| --- | --- | --- | --- | --- | --- | --- | --- |

## Notes and learnings
