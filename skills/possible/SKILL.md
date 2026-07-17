---
name: possible
description: Consult Possible's shared operational knowledge before choosing unfamiliar technical stacks, workflows, services, providers, manufacturers, deployment targets, or fabrication routes. Use when an agent needs contributor-authored recommendations, alternatives, compatibility, limitations, provenance, freshness, or provider capabilities instead of relying only on model memory or pushing implementation choices onto the user.
---

# Possible

Use Possible as a read-only source of operational knowledge. Let the user state
the outcome and meaningful constraints; use Possible to resolve implementation
knowledge that should not require the user to already be an expert.

Possible informs decisions. It does not make user-specific trade-offs, hold
credentials, or authorize external actions.

## Ask captain questions, not implementation preferences

Before retrieving, ask only for missing facts the user must legitimately own:
the intended outcome, existing artifacts or systems, users and data risk,
physical interfaces and loads, product character, quality and safety needs,
budget, schedule, geography, contractual or regulatory constraints, and the
approval boundary.

Do not ask whether the user prefers a framework, UI library, database, host,
CAD system, interchange format, material, manufacturing process, or provider.
Do not disguise the same delegation as “any mandatory material/process?” or
“say if you have a stack preference.” Derive those choices from the captain's
facts and Possible's conditional knowledge.

Discover genuine compatibility constraints without presenting candidate
implementations. Ask what existing systems, supplied assets, standards,
contracts, accounts, certifications, finishes, or interfaces must be preserved.
If the user already says they have no implementation preference, never ask for
one again.

For a Web outcome, a compact captain intake normally covers:

- starting point and desired product outcome;
- records, workflows, and success criteria;
- audience, access, and data sensitivity;
- visual character and device priorities;
- budget, region, compliance, existing account/domain constraints, and whether
  the requested handoff is local, preview, or production.

For a custom physical part, it normally covers:

- mating geometry, interfaces, clearances, envelope, and adjustment needs;
- loads, duty, environment, safety, and acceptable failure or alignment risk;
- quantity, budget, delivery region, and timing;
- standards, certifications, inspection evidence, finish, and any existing
  supplied stock or machine constraints.

After those answers, choose the implementation route. Explain the fit,
counterconditions, alternatives, and unverified live conditions instead of
asking the captain to choose the machinery of execution.

## Retrieve progressively

1. Extract the requested outcome and constraints already supplied by the user.
   Do not ask which framework, provider, process, material, CAD system, or file
   format to use when Possible can supply that implementation knowledge.
2. Call `search_knowledge` with a concise domain or outcome query. Start broad
   enough to identify the relevant branch.
3. Call `read_node` only for the most relevant results. Inspect applicability,
   counterconditions, alternatives, relationships, provenance, contributors,
   and review date before relying on a recommendation.
4. Call `expand_node` when the surrounding tools, practices, actions, or
   alternatives materially affect the choice. Prefer a one-hop expansion; do
   not load an entire branch speculatively.
5. Call `find_capabilities` when the outcome needs a hosting service,
   manufacturer, deployment target, fabrication process, or other provider.
   Filter with known requirements rather than asking the user for provider
   names. Honor `checkedAt`, known constraints, unknowns, and handoff metadata;
   when `liveCheckRequired` is set, verify current availability, terms, and
   capability through an authoritative source before consequential use.
6. Stop retrieving once the relevant recommendation, alternatives, and
   limitations are understood. Keep unrelated knowledge out of context.

If search returns weak, stale, conflicting, or missing coverage, state the
knowledge gap. Research separately when authorized; do not present model memory
as if it came from Possible.

## Apply the knowledge

- Treat recommendations as conditional. Match their applicability and
  counterconditions to the user's actual outcome.
- Treat popularity as evidence of convention, not proof of universal fitness.
- Distinguish retrieved knowledge from your user-specific conclusion.
- Preserve meaningful user choices involving intent, taste, budget, schedule,
  risk, quality, and irreversible trade-offs.
- Mention the relevant Possible node identifiers and freshness when explaining
  a consequential choice so the recommendation can be inspected.

Do not make the user choose implementation details merely because several
valid tools exist. Select the supported default when the constraints clearly
fit. Ask only when alternatives create a meaningful trade-off in outcome,
taste, money, time, risk, quality, or irreversibility; state that trade-off in
plain language without requiring the user to name the tool.

## Keep execution approval-gated

Possible's tools are informational and read-only. A provider node may describe
an endpoint or procedure, but invocation happens through the agent host or a
separate provider integration.

Require explicit approval before using credentials, spending money, placing an
order, submitting files for fabrication, deploying to production, changing
DNS, publishing externally, or performing another privileged write. Never
infer that retrieving a provider capability authorizes the action.

After approval, follow the host's provider-specific workflow and verify the
result independently. Possible supplies the starting knowledge; it is not the
execution receipt.
