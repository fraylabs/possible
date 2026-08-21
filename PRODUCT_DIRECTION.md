# Possible product direction

Possible is a continuously updated, cross-provider index of what AI can make
and how it was made.

The public promise is:

> See what AI can make. Find the prompt. Remix it.

Possible is not primarily an authoring platform. MiniMax, OpenAI, Google,
Runway, independent creators, and future providers already produce the supply.
Possible makes that scattered work searchable, comparable, attributable, and
remixable across products.

## The user loop

```text
Search for a desired result
  -> judge visual outcomes
  -> inspect the prompt and relevant inputs
  -> remix what should change
  -> continue in the product that can make it
```

The result comes first. A prompt is useful because it is connected to something
the user can inspect, not because it exists in a prompt collection.

## The indexed record

The minimum useful listing contains:

- result media or a source-hosted preview;
- the prompt, or a source excerpt when full reproduction is not permitted;
- creator or publisher;
- product, model, and model version when known;
- publication date;
- canonical source URL.

Reference inputs, settings, seeds, editing steps, and other workflow context are
optional. Include them when they materially affect whether someone can reproduce
or remix the result. Do not turn every listing into a mandatory workflow schema.

Every listing remains attached to its original source. Possible should index
public work, not quietly claim or permanently mirror it.

## Publisher-owned galleries

The long-term supply model is publisher-owned galleries connected through a
neutral Possible index.

A provider or creator has an account-owned page and may connect public sources,
correct account-owned metadata, choose which owned results are public, and link
the Products and Skills behind each result. Possible continues to own search,
categorisation, deduplication, and organic ranking. Ownership of an Outcome is
separate from Product and Skill attribution.

Publishers cannot self-award ranking, claim work they do not own, rewrite source
history, remove independent third-party work, or disguise paid placement as an
organic result.

An optional provider feed may eventually live at a conventional URL such as:

```text
https://provider.example/.well-known/possible.json
```

The feed is an accelerator, not a prerequisite. Possible must remain able to
index useful public work from providers that have not integrated with it.

## How supply scales

Possible uses three intake paths:

1. **Public discovery.** Source-specific crawlers index official galleries,
   documentation, GitHub, creator websites, YouTube, and other public sources.
2. **Submit a URL.** A person points Possible at public work; Possible extracts
   the listing instead of asking them to author a record from scratch.
3. **Publisher feeds.** Claimed providers and creators syndicate accurate,
   current records directly to Possible.

The ingestion pipeline should progressively automate:

```text
discover URL
  -> extract result, prompt, creator, product, model, date, and source
  -> understand the result across text, image, audio, video, or 3D
  -> classify likely search intents and required inputs
  -> detect duplicates and source conflicts
  -> publish confidently or send an uncertain case to review
  -> revisit the source for changes or removal
```

Automation handles coverage and normalisation. Human judgment remains focused on
featured collections, ambiguous records, and the quality bar—not approval of
every listing.

## Content handling

- Always preserve attribution and the canonical source URL.
- Display complete prompts for official examples, open repositories, explicitly
  licensed work, and author-supplied records.
- Use a useful excerpt and link for public work whose reproduction rights are
  unclear.
- Prefer source-hosted embeds or previews; do not rehost full media by default.
- Record when a source was last seen and remove or repair dead listings.
- Provide a straightforward correction, claim, and removal path.
- Clearly label official examples, community work, and Possible's own examples.

## Ranking

Scraping is not the advantage. Possible's advantage is knowing which result best
fits an intent and remains useful to remix.

Initial ranking may use:

- semantic fit to the requested result;
- visible result quality;
- prompt completeness;
- required-input availability;
- model and method freshness;
- reproducibility signals;
- source quality and duplication.

As usage grows, direct behaviour becomes more important:

- result opened;
- prompt inspected or copied;
- remix started;
- original product visited;
- successful remix returned;
- method used again.

Popularity is a supporting signal, not a substitute for relevance or quality.
Paid placement, if it ever exists, must be visibly separate from organic
ranking.

## Phased plan

### Phase 1: prove result-first discovery

- Curate roughly 100 exceptional video results across at least five providers
  and independent creators.
- Build a result-first homepage, useful search, concise detail pages, and clear
  **View prompt**, **View source**, and **Remix** actions.
- Start with video because quality is immediately judgeable and public supply is
  abundant.
- Evaluate representative messy searches and record which desired results are
  missing.
- Measure result opens, prompt inspection, source visits, remix starts, and
  repeat use.

Advance when people return to Possible to begin work, not merely to scroll once
through attractive media.

### Phase 2: automate intake

- Add a URL importer.
- Build adapters for the most productive public sources.
- Automate media understanding, tagging, prompt extraction, deduplication,
  freshness checks, and source-health monitoring.
- Keep uncertain or rights-sensitive records in review.

Advance when most useful additions can enter through extraction and lightweight
review rather than hand-authored JSON.

### Phase 3: mature publisher-maintained supply

- Add creator and provider claims when ownership must move beyond the current
  maintainer-managed accounts.
- Verify ownership through the canonical domain or connected source account.
- Publish a small, optional gallery-feed format.
- Add corrections, removals, and publisher analytics.

Advance when outside publishers can maintain accurate galleries without Possible
editing their records manually.

### Phase 4: learn from remixes

- Make prompt remixing change only the parts the user intends to change.
- Record privacy-preserving selection and remix signals.
- Let users return successful remixes as new sourced results.
- Use those signals to improve retrieval and freshness ranking.
- Expose the index through a public API and agent-facing MCP once the search
  quality is worth integrating.

Advance when remix outcomes improve discovery more reliably than editorial
judgment alone.

## Do not build yet

- A schema-heavy authoring system
- Browser accounts or browser bookmarks
- Social feeds, comments, follows, or voting
- Provider payments, wallets, or checkout
- Hosted model execution
- Pay-to-rank placement
- A broad crawler before the first curated corpus proves demand
- A prompt compiler, workflow contract, trust lifecycle, or verification theatre

## Immediate next chapter

Use the current first-party Outcomes as prototypes, not as the long-term supply
strategy. Stop expanding them from first principles. The next concrete milestone
is a curated video index assembled from exceptional, attributable public work,
beginning with official provider examples whose prompts and results are already
visible.

The first implementation should prove one complete path:

```text
MiniMax official example
  -> sourced Possible listing
  -> result-first search result
  -> exact prompt and provenance
  -> source link
  -> manual remix
```

Do not add public self-service claiming, automated crawling, or feed
infrastructure until that path is clearly more useful than visiting the
original gallery alone. The current maintainer-managed account model is enough
to establish ownership and attribution meanwhile.
