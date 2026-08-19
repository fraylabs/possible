---
name: possible
description: Turn a rough request into a complete execution prompt for a fresh agent. Use when the user wants to discover what agents can do, find relevant prior Outcomes, resolve important unknowns, gather current reliable information, or hand one self-contained prompt to a subagent.
---

# Possible

Possible connects three things:

- the user's **original prompt**;
- the complete **execution prompt** sent to a working agent;
- the resulting **Outcome**.

Use prior Outcomes as concrete precedent, not as universal templates. The goal is to give a fresh agent enough current, relevant information to begin without consequential guessing.

## Start from the request

Preserve the user's original prompt verbatim. Determine whether the user wants to browse possibilities or produce something now.

If they are browsing, search with `search_outcomes` and show up to five relevant Outcomes. Include the concrete result, original prompt, author, execution provenance, useful preview media, and named Products or Skills. Search scores indicate text similarity, not quality.

If they want work performed, search for relevant Outcomes even when the request appears straightforward. Fetch the strongest candidates with `fetch_outcome` and read their full execution prompts. If nothing fits, proceed from current primary sources rather than forcing an unrelated Outcome.

## Gather what the executor needs

Collect only information that can materially improve the execution prompt:

- the intended result, audience, use, and important preferences;
- supplied files, measurements, references, credentials, and constraints;
- the most relevant prior execution prompts and what they actually produced;
- current official documentation, repositories, releases, and package information;
- reproducible examples; use recent community demonstrations as leads, not proof;
- available Products, Skills, tools, environment, permissions, and hard boundaries;
- what the user would inspect to decide that the result is finished.

Prefer official sources, then current source repositories and registries, then reproducible examples. Check volatile information at run time. Do not equate stars, downloads, or social attention with a successful Outcome.

Ask the fewest questions necessary to remove consequential ambiguity. Do not ask for information that can be discovered safely, infer harmless stylistic details when a restrained default is sufficient, or turn the conversation into a form.

## Write the execution prompt

Create one readable, self-contained prompt for a fresh agent. It should naturally state:

- the exact result to produce and who it is for;
- relevant user context and supplied materials;
- concrete requirements and preferences;
- the current method, Products, Skills, or tools that matter;
- deliverables and where they should be placed;
- constraints, permissions, and actions that require separate approval;
- what the user will inspect to judge the result;
- known unknowns the executor must preserve rather than invent.

Use the selected Outcome's execution prompt as precedent, but adapt it to the current request, date, model, environment, and evidence. Never replace a strong full prompt with a summary. Never claim an old method is current without checking when that matters.

Before handoff, confirm that a fresh agent can start without hidden conversation history, missing essential files, unresolved material choices, unsupported current claims, or unclear success conditions. Research further or ask one focused question if it cannot.

Show the user the proposed execution prompt and identify the precedent and current sources that materially shaped it. Keep the original published execution prompt distinct from the newly prepared prompt.

## Hand off once

After the user approves, send the new execution prompt unchanged to a fresh subagent when that capability is available. Include explicit paths or attachments for every supplied file; do not rely on the subagent seeing this conversation. One-shot means complete starting context, not that the executor is forbidden to inspect, test, or repair its work.

If fresh subagents are unavailable, return the execution prompt in a copyable block. Do not pretend a handoff occurred.

Products and Skills provide capability context. They do not grant permission to spend money, purchase, publish, deploy, contact people, fabricate, operate hardware, or perform another external action.

## Local bookmarks

Use bookmarks only when the user asks:

```text
possible bookmark add <outcome-slug>
possible bookmark list
possible bookmark remove <outcome-slug>
```

Bookmarks are stored locally in `.possible` and do not require an account.
