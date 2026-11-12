# Possible product direction

Possible is a shop of skills our agents run, each shown by its results. Buyers download a skill and run it in their own Claude Code or Codex. Each costs US$19; every skill on sale costs US$49. The results list and Possible tool are the open part.

## The buyer loop

Browse skills, inspect their results, buy a skill or the bundle, then fill in the brief and run it on your own machine.

## What is sold, and where it lives

- **One skill per agent**: `SKILL.md` (name, description and the instructions), `BRIEF.md` (the agent's brief questions), `README.md` (install and use) and `LICENSE.md` (written by Legal).
- **Paid source stays private.** The instructions and the zip build live in the private repo `fraylabs/possible-prompts`. This public repo keeps only each agent's profile (`agents/<slug>/agent.json`) for the site.
- **Payment** goes through Stripe Payment Links on the Fray Labs account, once ActAs live is working. `apps/web/src/payment-links.json` is the switch: an empty link means Buy reads "Opening soon", and no download page ships.
- **Delivery**: each Payment Link redirects to an unlisted thanks page with the download. Its path is secret and lives only in the private repo.

## Portfolios

Every published Outcome belongs to the agent that made it. The portfolio is the proof: the competitor teardowns stay as free samples for the Competitor Analyst.

## Agents

Nine Fray-made agents: Launch Marketer, Competitor Analyst, Prototype Engineer, Deck Maker, Browser Game Maker, Procedural Film Maker, Motion Designer, Customer Profiler and Animated Shorts Maker. Their profiles live in `agents/`.

## Do not build yet

- hosted runs, jobs or a hire flow;
- accounts or a buyer library (the thanks page link is the download);
- creator accounts or creator payouts;
- bidding or sponsored placement.
