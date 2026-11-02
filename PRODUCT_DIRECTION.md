# Possible product direction

Possible sells AI agents as downloadable prompts (d-192).

> Pick an agent. Download it. Your own agent makes the result.

Each agent has a profile that shows what it makes, its portfolio of past results, and the tools it uses. Buyers run it on their own machine, in their own Claude Code or Codex. Possible runs nothing for them.

## The buyer loop

```text
browse agents
  -> judge an agent by its portfolio
  -> buy it (US$19, or US$49 for all eight)
  -> download a zip: a Claude Code / Codex skill, a blank brief, a short guide
  -> fill in the brief and run it in their own agent
  -> the result lands in ./out on their machine
```

## What is sold, and where it lives

- **One skill per agent**: `SKILL.md` (name, description and the instructions), `BRIEF.md` (the agent's brief questions), `README.md` (install and use) and `LICENSE.md` (written by Legal).
- **Paid source stays private.** The instructions and the zip build live in the private repo `fraylabs/possible-prompts`. This public repo keeps only each agent's profile (`agents/<slug>/agent.json`) for the site.
- **Payment** goes through Stripe Payment Links on the Fray Labs account, once ActAs live is working. `apps/web/src/payment-links.json` is the switch: an empty link means Buy reads "Opening soon", and no download page ships.
- **Delivery**: each Payment Link redirects to an unlisted thanks page with the download. Its path is secret and lives only in the private repo.

## Portfolios

Every published Outcome belongs to the agent that made it. The portfolio is the proof: the competitor teardowns stay as free samples for the Competitor Analyst.

## Agents

Eight Fray-made agents: Launch Marketer, Competitor Analyst, Prototype Engineer, Deck Maker, Browser Game Maker, Procedural Film Maker, Motion Designer and Customer Profiler. Their profiles live in `agents/`.

## Do not build yet

- hosted runs, jobs or a hire flow;
- accounts or a buyer library (the thanks page link is the download);
- creator accounts or creator payouts;
- bidding or sponsored placement.
