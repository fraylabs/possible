---
name: possible
description: Discover Outcomes and their disclosed recipes, then prepare a complete starting brief for a fresh agent. Also author and validate source-owned Outcomes for Possible.
---

# Possible

Possible connects the user’s intended result with existing **Outcomes** and their
disclosed **recipes**: prompts, models, agents, pinned skills, references, tools
and ordered steps. Simple Outcomes may contain only a prompt.

An Outcome is precedent to inspect and remix, not a rigid workflow. Preserve useful creative freedom while giving a fresh agent the context, current methods, and concrete inputs it needs.

## Discover before writing

Preserve the user's original prompt verbatim. Determine whether they want to browse possibilities, prepare a prompt, execute work, or publish completed work.

For browsing or execution, use `search_outcomes` when the Possible MCP is available. Otherwise run `npx @fraylabs/possible@0.4.0 search "<ordinary-language request>"`. Show up to five relevant Outcomes when the user is browsing. When preparing work, read the strongest candidates' prompts and disclosed recipes with `fetch_outcome` or `npx @fraylabs/possible@0.4.0 fetch <outcome-id> --json`. Search scores indicate text similarity, not quality.

Use Outcomes as concrete precedent. If none fit, use current primary sources rather than forcing an unrelated example. Prefer official documentation, current source repositories and registries, then reproducible community examples. Check volatile information at run time. Popularity is a discovery signal, not proof that an Outcome is good.

## Resolve consequential unknowns

Collect only what can materially improve execution:

- the intended result, audience, use, and strong preferences;
- supplied files, measurements, references, credentials, and constraints;
- required inputs that the executor cannot safely invent;
- relevant prior Outcomes and what they actually produced;
- current Products, Skills, tools, environment, permissions, and limits;
- what the user will inspect to decide that the result is finished.

Ask the fewest questions necessary. Discover safe facts yourself. Infer harmless aesthetic details when a restrained default is sufficient. Do not turn the conversation into a form.

## Prepare a complete starting brief

Write one readable, self-contained starting prompt for a fresh agent, accompanied
by the relevant disclosed recipe ingredients. It should naturally state:

- the exact result and who it is for;
- relevant user context and supplied materials;
- concrete requirements and preferences;
- current Products, Skills, or tools that matter;
- deliverables and where to place them;
- constraints, permissions, and separately authorized external actions;
- what the user will inspect to judge the result;
- unknowns the executor must preserve rather than invent.

Adapt prior prompts to the current request, date, model, environment, and evidence. Never substitute a summary for a strong full prompt. Never claim an old method is current without checking. Keep the published prompt distinct from the new prompt you prepare.

Before handoff, confirm that a fresh agent can start without hidden conversation history, missing essential files, consequential unresolved choices, unsupported current claims, or unclear success conditions. Research further or ask one focused question if it cannot.

Show the proposed execution prompt and name the prior Outcomes and current official sources that materially shaped it.

## Hand off once

After approval, send the execution prompt unchanged to a fresh subagent when that capability is available. Include explicit paths or attachments for every supplied file. One-shot means complete starting context; it does not forbid the executor from inspecting, testing, or repairing its work.

If fresh subagents are unavailable, return the execution prompt in a copyable block. Do not pretend a handoff occurred.

Products and Skills describe capabilities. They do not grant permission to spend money, purchase, publish, deploy, contact people, fabricate, operate hardware, or perform another external action.

## Author a completed Outcome

When the user wants to publish completed work, inspect the real result and preserve the exact prompt and provenance. Record only evidenced ingredients in the optional `recipe` field: agent/harness, exact-commit skill references, reference URLs, tools with purposes, and ordered steps. Preserve disclosed prompts and follow-ups verbatim; label reconstructed steps and leave unknowns absent. This is manual authoring, not session capture or kit installation. Create one folder:

```text
outcomes.json
outcomes/<slug>/
  outcome.json
  outcome.md
  prompt.md
  media/        optional
  artifacts/    optional
  inputs/       optional
```

`outcomes.json` is the repository-root publisher index and is created or updated by the CLI. `outcome.md` is the canonical human page: one H1 title, one clear opening summary, and useful formatted explanation. `prompt.md` is the exact reusable execution prompt. `outcome.json` contains machine metadata only: author, authored timestamp, models and agents, required inputs, one primary Product or Skill, optional secondary credits, optional recipe ingredients and ordered steps, and media or artifact references. A Skill credit retains its repository, directory and last-reviewed commit.

Do not reconstruct absent provenance as fact. Mark unknown values honestly. The primary attribution is the Product or Skill people should understand first; do not duplicate it under `secondary`. Attributions and models belong in `outcome.json`; deliverables and detailed work instructions belong in `prompt.md`; result explanation belongs in `outcome.md`.

Use the CLI to scaffold and validate:

```text
npx @fraylabs/possible@0.4.0 create <slug> --product <owner/product>
npx @fraylabs/possible@0.4.0 create <slug> --skill <owner/repository> <directory> <commit>
npx @fraylabs/possible@0.4.0 validate [directory]
```

## Publish from the owner's source

Possible does not host publisher accounts or own the canonical files. A publisher exposes Outcomes from either:

- a public GitHub repository; or
- `https://publisher.example/.well-known/possible/outcomes.json`.

The publisher index is a thin list of manifest locations. Possible snapshots the public source revision and displays it; changing the source creates a new revision rather than rewriting history.

```text
npx @fraylabs/possible@0.4.0 publish [owner/repository | https://publisher.example]
npx @fraylabs/possible@0.4.0 add <owner/repository | https://publisher.example>
npx @fraylabs/possible@0.4.0 use <source>@<slug>
```

GitHub publishing requires a clean committed revision so the snapshot is reproducible. No Possible login is required. A publisher-domain source is Official for that domain; other sources are Community unless their ownership follows directly from the public source.

## Local bookmarks

Use bookmarks only when the user asks:

```text
npx @fraylabs/possible@0.4.0 bookmark add <outcome-slug>
npx @fraylabs/possible@0.4.0 bookmark list
npx @fraylabs/possible@0.4.0 bookmark remove <outcome-slug>
```

Bookmarks are stored locally in `.possible` and do not require an account.
