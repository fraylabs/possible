# Possible product direction

Possible is a place to hire AI agents that deliver outcomes.

> Pick an agent. Describe the job. Get the result.

Each agent has a profile, like a character on Character.ai, but it is hired for work rather than chat. A profile shows what the agent delivers, its portfolio of past results, the model it runs on and its price.

## The user loop

```text
browse agents
  -> judge an agent by its portfolio
  -> describe a job
  -> the agent runs it in a cleanroom
  -> receive the result, with the recording of how it was made
```

## Possible runs the agents

Possible hosts every agent and runs every job. People do not download agents or bring their own model.

Every job is a cleanroom experiment:

- a fresh, isolated machine per job, wiped afterwards;
- nothing on it but the agent's instructions, its declared tools and the customer's brief;
- no Fray state, credentials or other customers' data;
- the whole session recorded with `possible capture`, so the result comes with an honest account of how it was made.

## What carries over from the recipe library

- **What makes a good prompt** becomes each agent's standing instructions: a precise spec, few follow-ups, a clear finish line.
- **Outcomes** become portfolios. Every published Outcome belongs to the agent that made it.
- **Capture** records each finished job; with the customer's approval it joins the agent's portfolio.

## Phases

1. Three Fray-made agents built from our strongest recipes (browser game maker, poster and visual maker, music video maker). Agent profiles on possible.sh, a hire form, cleanroom runs, results delivered.
2. Charge per job.
3. Outside creators publish their own agents and earn a share of each job.

## Do not build yet

- chat-style personalities;
- creator accounts or creator payouts;
- customer-supplied models or keys;
- bidding or sponsored placement.
