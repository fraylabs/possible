# Possible MVP Result

Status: MVP complete, publicly delivered, and visually accepted on 2026-07-17.

## Supported trust claim

An existing agent can consult the same contributor-maintained graph exposed to
humans, retrieve conditional implementation and provider knowledge through a
read-only MCP interface, and preserve privileged actions as explicit handoffs.

The current supported graph contains:

- 48 nodes and 134 typed edges across Web and custom-part manufacturing;
- 18 Web and 30 manufacturing nodes;
- topics, practices, tools, providers, and approval-gated actions;
- 61 recommendation-provenance references across 43 unique recommendation
  source URLs.

The human projection is a responsive constellation explorer with left-hand
search/path navigation, focused graph movement, and a detail panel for
applicability, counterconditions, alternatives, workflows, provider unknowns,
sources, contributors, and safe actions. The agent projection supplies exactly
four read-only MCP operations: search, exact read, bounded expansion, and
capability matching. Both projections consume the same validated graph.

## Primary verification receipt

From the repository root:

```text
npm run check
```

Passed on 2026-07-17 with:

- graph validation: 48 nodes, 134 edges, 11 contributor collections;
- Agent Skill validation;
- knowledge package: 8/8 tests;
- MCP stdio/HTTP integration: 6/6 tests;
- website behavior and accessibility checks: 14/14 tests;
- website real-graph integration checks: 2/2 tests;
- preview artifact boundary checks: 5/5 tests on the reviewed POSIX host;
- evaluation harness: 18/18 tests;
- all TypeScript and production builds;
- exact production-preview artifact verification: 3 files, 390,944 bytes, no
  public source maps,
  aggregate SHA-256
  `8b8165a9e7cdcc6999ea99e4c52457da706650ff3f50ed3d46f280688dbf6c95`;
- four real controlled pairs scored with no pending scenario.

Direct command-line calls through the real stdio MCP path also succeeded for
all four operations. The preview verifier served the production bundle on an
ephemeral loopback port and proved exact asset delivery, client-route fallback,
safe missing-asset and encoded-traversal 404 responses, real-path containment,
correct content types, parsed active asset references, and the absence of linked
artifact roots, descendant symbolic links, and public source maps.

## Production delivery receipt

The same reviewed static artifact is publicly reachable at
[possible.sh](https://possible.sh), with [www.possible.sh](https://www.possible.sh)
serving the same project. Source is public on
[github.com/fraylabs/possible](https://github.com/fraylabs/possible), and Vercel
is connected to the repository for future Git deployments.

The production build was made from public commit
`6378e10d4ca2909ce1ff4535e4399706b196ce8f`. Vercel's prebuilt static output was
byte-identical to `apps/web/dist`. Independent HTTPS fetches reproduced all
three reviewed hashes, including `index.html`; the client route
`/knowledge/web` returned HTTP 200 with the expected HTML content type. Both the
apex and `www` returned HTTPS 200 with valid certificates.

Rendered acceptance used the in-app Browser against the live custom domain:

- desktop `1440 × 1000`: search, exact result selection, graph refocus, current
  path, Back, Overview, and detail/provenance inspection passed;
- mobile `390 × 844`: graph/detail transition, knowledge drawer, search, result
  selection, and responsive detail presentation passed;
- tablet `834 × 1112`: split graph/detail presentation and responsive controls
  passed;
- the live browser reported no console warnings or errors.

Cloudflare retained authoritative DNS and received only two DNS-only A records,
for the apex and `www`, both using Vercel's requested target. No existing record,
plan, paid feature, or unrelated provider configuration was changed. The full
receipt is in `deployment/PRODUCTION.md`.

## Controlled agent evidence

The locked scenarios are:

- “Build and deploy an inventory dashboard.”
- “Design a custom motor bracket and find a suitable manufacturer.”

Each pair used fresh sessions with the same provider, inherited model, host,
fixed captain answers, and external-action prohibitions. Baselines had Possible
disabled; treatments received the real Skill and stdio MCP. An independent
fresh-context agent classified every question, material claim, constraint, and
action, then bound receipts to exact transcript and contributor-node hashes.

| Revision and scenario | Baseline | Possible | Delta | Implementation questions |
| --- | ---: | ---: | ---: | --- |
| Skill v1 — dashboard | 51.49 | 69.29 | +17.80 | 1 → 2 |
| Skill v1 — motor bracket | 42.19 | 61.94 | +19.75 | 2 → 2 |
| Skill v2 — dashboard | 41.22 | 81.00 | +39.78 | 3 → 0 |
| Skill v2 — motor bracket | 51.09 | 71.09 | +20.00 | 0 → 0 |

Revision 1 proved contributor-knowledge use but failed the sharper
micromanagement promise. Those receipts were retained. The Skill was then
tightened to forbid stack, host, CAD, format, material, process, and provider
preference questions; deterministic validation now protects that boundary.
Revision 2 reduced dashboard implementation-choice questions from three to zero
and introduced none in the bracket run, where the baseline already asked none.

Both revision-2 Possible runs achieved full contributor-knowledge coverage and
no unsafe or misdeclared external action. The dashboard treatment covered all
captain decisions with 100% question precision; the bracket treatment likewise
asked only captain-level questions.

The deterministic report is `evals/reports/latest.json`. Raw visible dialogue,
discarded-run disclosures, session metadata, Skill digest, and MCP trace
evidence remain under `evals/receipts/`.

## What the evidence does not prove

- No dashboard application, motor-bracket CAD, live quote, purchase, order, or
  fabrication was produced by the evaluation runs; they are handoff
  demonstrations. The deployed artifact is the Possible website itself.
- The public deployment proves the static human explorer, not a hosted remote
  MCP service. The MCP remains remote-ready source with tested stdio and HTTP
  transports and must be deployed separately if a shared endpoint is desired.
- The outcome constraints for a built dashboard and fitted bracket remain
  unknown because no corresponding artifacts or verifiers exist.
- Live provider price, plan, region, account, material, inspection, destination,
  and delivery suitability remain unknown and require current authoritative
  checks before consequential use.
- Supported-claim points reached zero in all four revision-2 arms under the
  conservative rubric. Possible reduced unsupported material claims by 13 in
  the dashboard pair and 15 in the bracket pair, but it did not eliminate them.
- The two golden scenarios demonstrate the MVP mechanism; they do not establish
  universal performance across accounting, art, science, or every engineering
  domain.
- Event ordering is preserved, but event timestamps are explicitly monotonic
  reconstructions around source-capture time rather than original model
  timestamps.

## Completion statement

Possible is trusted as a narrow public MVP for Web and custom-part knowledge:
the shared graph, read-only agent interface, Agent Skill, human explorer,
controlled evaluation mechanism, public source, custom-domain deployment, and
live responsive interaction paths are all verified. It is not trusted as a
universal knowledge base, a hosted autonomous agent, a production remote MCP
service, or proof that the two golden-example outcomes were physically built.
