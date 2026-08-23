# Possible product direction

Possible is a public directory of Outcomes: visible results paired with exact reusable prompts.

> See what agents can make. Copy the prompt. Remix it.

## The user loop

```text
find a desired result
  -> judge the visible Outcome
  -> inspect its exact prompt and requirements
  -> copy or remix it
  -> continue in the relevant agent or Product
```
The Outcome is the ranking unit because it is the thing a person can inspect and reuse. Products and Skills receive visible “Made with” attribution and downstream reputation from the Outcomes they enable.

## Source-owned publishing

Possible does not host publisher accounts or canonical Outcome files.

A publisher owns either:

- a public GitHub repository; or
- a domain with `/.well-known/possible/outcomes.json`.

Each Outcome contains required `outcome.json`, `outcome.md`, and `prompt.md` files. Possible independently reads the public source, validates it, stores an immutable snapshot, and updates the current listing. A removed Outcome becomes hidden; historical snapshots remain intact.

Domain sources are Official for that domain. GitHub Outcomes are Community unless the repository directly owns a referenced Skill. Official means source ownership, not Possible endorsement or quality.

## Discovery and reputation

Possible has one organic leaderboard: **Most copied Outcomes — All time**. Copies, ratings, and reviews support discovery but never prove universal fit. Raw visitor and reviewer identifiers remain private.

The optional `$possible` Skill searches current Outcomes, checks current primary sources, resolves consequential unknowns, and prepares one complete prompt for a fresh agent.

## Revenue path

Organic rank and Official identity cannot be purchased. If paid discovery is introduced, it is a small, clearly labelled Sponsored Outcomes surface with at most three placements.

Do not build bidding until organic repeat use exists.

## Phases

1. Prove six to ten excellent visual Outcomes, source publishing, prompt copying, reviews, and reliable search.
2. Get outside publishers to expose public repositories or domain indexes.
3. Learn from successful searches, copies, and remixes; improve retrieval.
4. Consider sponsored placement, publisher analytics, APIs, and additional leaderboard windows only when use supports them.

## Do not build yet

- Possible publisher accounts or OAuth;
- hosted authoring or canonical prompt storage;
- passive gallery scraping or bulk import queues;
- claims, handoffs, or ownership-transfer workflows;
- Product or Skill leaderboards;
- wallets, checkout, or hosted model execution;
- structured prompt compilers, expectations, workstreams, or trust ceremony.

## Immediate milestone

```text
publisher exposes a real Outcome
  -> Possible snapshots the source
  -> user discovers and judges the result
  -> user copies or remixes the exact prompt
  -> Products and Skills receive attribution
  -> usage and reviews improve discovery
```
