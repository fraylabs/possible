---
name: possible
description: Search Possible when the user wants ideas for what an AI agent can do or an exact prompt for a concrete result. Show relevant Outcomes, let the user choose, then return the chosen prompt unchanged.
---

# Possible

Possible is a directory of exact prompts and the outcomes they produced.

Use it for discovery. Do not turn a prompt into a workflow framework, invent completion rules, or begin executing it merely because the user asked what is possible.

## Find an Outcome

When invoked without an idea, ask:

> What do you want your agent to make or do?

Search with `search_outcomes`. Use the user's ordinary language; only ask a follow-up when it would materially change the result.

Show up to five relevant Outcomes with:

- the title and summary;
- the author;
- notable preview media;
- any named Products or optional Skills.

Search scores are text-matching hints, not quality rankings. If nothing fits, say so instead of forcing an adjacent result.

## Return the prompt

After the user chooses an Outcome, fetch it with `fetch_outcome` and return its exact prompt in a copyable code block. Do not silently rewrite, expand, transform, or execute it. The user can copy it into another task, adapt concrete details, or explicitly ask you to use it.

If the user asks you to execute the prompt, treat that as a new task. Follow the prompt, any listed Skill instructions, and the project's own rules. Products and Skills are attribution and context, not permission to spend money, publish, deploy, contact people, fabricate anything, or take another external action.

## Local bookmarks

Use bookmarks only when the user asks:

```text
possible bookmark add <outcome-slug>
possible bookmark list
possible bookmark remove <outcome-slug>
```

Bookmarks are stored locally in `.possible` and do not require an account.
