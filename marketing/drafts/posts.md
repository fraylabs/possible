# Drafts

Link pattern: https://possible.sh/outcomes/view/?id=<ID>&utm_source=<platform>&utm_campaign=<post-id>
MicroDuck ID: kh79hk92ss2q5d96kb9f6h0aan8dnzdt

Social channels (Brian, Oct 6): only X, Instagram and TikTok, on Possible's own accounts, posted through the shared posting tool once it's announced. No Reddit, LinkedIn, Bluesky, Hacker News or dev.to. Every profile says it's run with AI help.

## Profiles

X / Instagram / TikTok name: Possible
Bio (≤150): AI-made things and the recipe behind them: prompts, skills, tools, steps. Remake them with your agent. Run with AI help. possible.sh

## p01-microduck · X · video

Video: MicroDuck happy-shuffle preview (16 s)
Alt: A small two-legged robot duck in a simulator steps left and right in place, swaying its body and head, without falling.

Text:
An AI agent taught a robot duck a happy little shuffle.

Codex wrote a reinforcement-learning task for Pollen Robotics' MicroDuck and trained it on one cloud GPU: 4,096 simulated ducks, 2.5 hours, $2.86. Simulation only for now.

The prompt and how it was made (reconstructed from the run report): possible.sh/outcomes/view/?id=kh79hk92ss2q5d96kb9f6h0aan8dnzdt&utm_source=x&utm_campaign=p01-microduck

Tests: does a concrete, surprising result with a cost hook travel?

## p02-falling-sand · X, Instagram Reels, TikTok · video

Video: the falling-sand preview, re-rendered vertical 9:16 for Reels/TikTok (the published preview is landscape).
Text (X):
Three prompts to Claude Code: a falling-sand game in one HTML file. Sand, water, fire, plants, lava, steam.

Recorded straight from the session, so you can see every prompt and remake it with your own agent:
possible.sh/outcomes/view/?id=kh7024axj2cksgg0hetxgdfy9n8fpryd&utm_source=x&utm_campaign=p02-falling-sand
Caption (IG/TikTok): One HTML file, three prompts, no hand edits. The recipe is on possible.sh (link in bio). #claudecode #gamedev #pixelart #ai
Tests: does a recorded, remakeable build lead to installs and captures more than a showcase does?

## p03-cli · X · CLI clip

Video: marketing/drafts/cli-recipe.mp4
Alt: A terminal. "possible search 'teach a robot duck a dance'" finds the MicroDuck Outcome; "possible fetch <id>" prints how it was made: model, agent, references, tools, requirements and steps.

Text:
Before you prompt your agent, check whether someone already made the thing.

possible search "teach a robot duck a dance"
possible fetch <id>

You get the recipe behind the result, ready to hand to Codex or Claude Code.
brew install fraylabs/tap/possible
possible.sh/?utm_source=x&utm_campaign=p03-cli
Tests: do developers respond to the CLI angle?

## p04-flow-field · X, Instagram, TikTok · video + carousel

Media: flow-field preview video; for Instagram, a 4-image carousel of posters (paper and ink, risograph, ocean, neon).
Text (X): Two prompts, one HTML file: a generative poster maker. Every poster can be reproduced from its URL. Recorded session and prompts: possible.sh/outcomes/view/?id=kh76caapj64dkt1w44t7txmdb98fpqva&utm_source=x&utm_campaign=p04-flow-field
Tests: does generative art drive saves and shares on Instagram?

## Directory entry copy (Oct 5)

One line (awesome lists):
- [Possible](https://github.com/fraylabs/possible) - Searchable AI-made results with the recipe behind each one (prompts, pinned skills, tools, steps). Its CLI turns a finished Claude Code or Codex session into a recipe locally, for you to review before publishing from your own repo.

Short (≤160): Find AI-made results and the recipe behind them, capture your own Claude Code or Codex session as a recipe, and publish it from your repo.

Skill entry: possible: before your agent starts, finds earlier results that match the task and builds one complete starting prompt from their recipes. Install: npx skills add https://github.com/fraylabs/possible/tree/skill/skills/possible --skill possible

## Terminal Trove submission copy (Oct 5)

Categories: cli, ai, llm, coding-agents · Language: javascript · Licence: MIT · Open source · Author: yes (Possible ActAs inbox)
Install: macOS brew install fraylabs/tap/possible, or curl -fsSL https://possible.sh/install.sh | sh; Linux: the same two.

- name: Possible
- url: possible.sh
- tagline: Search AI-made results and get the recipe behind them: prompts, skills, tools and steps.
- source_code: https://github.com/fraylabs/possible
- desc_1: Possible is a CLI for AI recipes. possible search finds results people made with coding agents, and possible fetch prints the recipe behind one: prompts, pinned skills, references, tools and ordered steps. possible capture turns your own finished Claude Code or Codex session into a recipe draft, locally.
- desc_2: Search a live directory of AI-made results in plain language. Print a recipe as text to hand to your agent, or as JSON. Capture a finished Claude Code or Codex session into a draft you review in the terminal before anything is exported; nothing is uploaded. Publish recipes from your own GitHub repo, no account needed.
- differentiator: Prompt collections give you text without the result or the context. Possible pairs each result with how it was made and says what is unknown: every recipe is labelled Recorded from session, Reconstructed or Prompt only. Capture is local, the creator approves the exact export, and publishing is a separate step from a repo you own.
- desc_3: Standalone binary with its own runtime for macOS and Linux (arm64 and x86_64); the install script verifies SHA256 and needs no sudo. Optional agent skill via npx skills add. Local bookmarks without an account.
- desc_4: Developers using Claude Code, Codex or other coding agents who want to start from something that already worked, or share how they made something without writing it up by hand.
- private_note: Submitted by the Possible project. This submission was prepared with AI help; the preview is a real recording of possible 0.6.0.
- preview_gif: https://raw.githubusercontent.com/fraylabs/possible/main/marketing/drafts/cli-recipe.gif
- preview_png: https://raw.githubusercontent.com/fraylabs/possible/main/marketing/drafts/cli-recipe.png

## GitHub posts once fray-agents exists (via the GitHub API)

Every post from fray-agents says it's from Fray's AI agents on behalf of Possible. One PR per list, one at a time, 24-48h apart.
Recorded recipes (live): falling sand kh7024axj2cksgg0hetxgdfy9n8fpryd · flow field kh76caapj64dkt1w44t7txmdb98fpqva · robot snake kh71eba7mm80pnbj1b7x6hwcmh8fptge

### g01 · PR · RoggeOhta/awesome-codex-cli (then g02 milisp/awesome-codex-cli)
Entry: - [fraylabs/possible](https://github.com/fraylabs/possible) - Turn a finished Codex or Claude Code session into a reviewed, shareable recipe (prompts, tools, steps), and search other people's. ![GitHub stars](https://img.shields.io/github/stars/fraylabs/possible?style=flat-square)
PR body: Adds Possible, an MIT CLI. `possible capture codex <rollout.jsonl>` turns a finished Codex session into a recipe draft locally (nothing uploaded); the creator reviews it in the terminal before export. `possible search` / `possible fetch` find and print other people's recipes. Disclosure: this PR was opened by Fray's AI agents on behalf of Possible, the project's maintainers.
Tests: does a Codex-specific list send installs?

### g03 · PR · ai-for-developers/awesome-ai-coding-tools ("CLI Tools")
Entry: - **[Possible](https://possible.sh/?utm_source=github&utm_campaign=g03-ai-coding-tools)** – Search AI-made results with the recipe behind them, and turn your own Claude Code or Codex session into a recipe.
Tests: does a general AI coding-tools list send visits that become installs?

### g04 · Discussions · fraylabs/possible "Show and tell" (pinned)
Title: Recorded recipes: three agent sessions you can remake
Body: Three recipes on Possible are now recorded from real Claude Code sessions with `possible capture`, not reconstructed: a falling-sand sandbox in one HTML file (3 prompts), a flow-field poster maker (2 prompts) and a slithering robot snake prototype. Also worth a look: donald’s "Upping My P(doom)" music video (kh778zkt08dmv6hyma80959s818fp9wk). Each page shows the exact prompts and tools, and has a link to the generated result. [links with utm_source=github&utm_campaign=g04-discussions]. Captured one of your own? Post it here with your outcomes.json repo and we'll take a look. Posted by Fray's AI agents on behalf of Possible.
Tests: does an open invitation produce outside publishers?
