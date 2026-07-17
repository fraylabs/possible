# Worklog

## 2026-07-17 — Activation

- Created the standalone Possible repository.
- Activated the MVP goal.
- Established two supported knowledge branches and approval boundaries.

## 2026-07-17 — Parallel MVP build

- Built one validated graph with 48 nodes and 134 typed edges across Web and
  manufacturing.
- Added four read-only MCP operations, stdio and Streamable HTTP transports, an
  Agent Skill, and an MCP-backed command-line query helper.
- Built the responsive constellation explorer from the same browser-safe graph
  projection.
- Locked two evaluation scenarios, schemas, negative fixtures, and a
  deterministic baseline-versus-Possible scorer.
- Root `npm run check` passed: 8 knowledge tests, 6 MCP integration tests, 14
  website tests, 18 evaluation tests, all builds, graph validation, skill
  validation, and the then-empty evaluation report.
- Direct calls through the actual stdio MCP path succeeded for
  `search_knowledge`, `read_node`, `expand_node`, and `find_capabilities`.

## 2026-07-17 — Controlled evaluation

- Ran two fresh-context pairs under a shared provider/model/host fingerprint:
  an inventory dashboard and a custom motor bracket.
- Disabled Possible for each baseline and allowed only the real Possible MCP
  path for each treatment.
- Discarded and replaced one treatment run after it used external web research.
- Preserved the four valid visible transcripts verbatim in
  `evals/receipts/2026-07-17-controlled-runs.source.md` for independent
  adjudication.
- Local HTTP smoke testing returned the Vite app successfully. In-app visual QA
  remains pending because the approved browser surface rejected the localhost
  URL under its URL policy; no alternate browser automation was used.

## 2026-07-17 — Honest evaluation iteration

- Revision 1 scored Possible higher overall on both scenarios (`+17.80` for the
  dashboard and `+19.75` for the motor bracket), but did not prove reduced
  implementation micromanagement: the dashboard treatment asked one additional
  implementation question and the bracket treatment tied its baseline.
- Kept those receipts unchanged and treated the result as a failed trust claim,
  not a marketing success.
- Tightened the Agent Skill with compact Web and custom-part captain-intake
  contracts. It now explicitly forbids asking for stack, host, CAD, format,
  material, process, or provider preferences—even when disguised as “mandatory”
  implementation questions.
- Added deterministic validator checks for that captain/implementation
  boundary; both the repository validator and the system Skill validator pass.
- Ran four fresh revision-2 sessions under a new shared fingerprint. Discarded
  one dashboard baseline after an asymmetric parent status prompt contaminated
  the pair, then replaced it with a fresh session.
- Preserved the four valid revision-2 runs and actual MCP command-trace evidence
  in `evals/receipts/2026-07-17-controlled-runs-v2.source.md`; independent
  adjudication is complete.
- Revision 2 scored `41.22 → 81.00` (`+39.78`) for the dashboard, reducing
  implementation questions `3 → 0`, and `51.09 → 71.09` (`+20.00`) for the
  motor bracket, where both arms asked zero implementation questions.
- The deterministic report contains all four revision-1/revision-2 pairs, has
  no pending scenario, and regenerates byte-for-byte with SHA-256
  `84d800f3c4fe08a75df86ee3eaabb0d7c257b0ee87c790b563eac6249c3ff22b`.
- The revision-2 adjudicator ran the full root verifier successfully and marked
  its independent goal complete.

## 2026-07-17 — Independent acceptance audit

- A fresh-context reviewer independently reran the child and Fray-root
  verifiers, exercised all four stdio MCP paths, recomputed graph and evaluation
  receipts, checked claim alignment, and recorded a local-pass verdict in
  `REVIEW.md`.
- The audit identified two durability/precision gaps: the real-graph website
  integration test was outside the primary verifier, and the 61-reference / 43-
  URL result wording did not say those counts cover recommendation provenance.
- Wired the 2/2 real-graph integration test into `npm run check`, clarified the
  provenance scope, and reran the full verifier successfully. Rendered visual
  acceptance remains explicitly gated on an approved public preview.

## 2026-07-17 — Preview artifact readiness

- Added a deterministic manifest for the exact three-file production website
  bundle: 390,944 bytes with aggregate SHA-256
  `8b8165a9e7cdcc6999ea99e4c52457da706650ff3f50ed3d46f280688dbf6c95`.
- Added a primary-verifier step that checks every file hash, serves the artifact
  on an ephemeral loopback port, proves exact bytes, content types, and SPA
  fallback, and negatively checks missing assets and encoded path traversal.
- Disabled public production source maps and made their absence part of the
  artifact contract before any external preview handoff.
- An independent adversarial review found that initial enumeration ignored
  symbolic links while request serving followed them (`DEPLOY-001`). The
  verifier now rejects links and all non-regular artifact entries, enforces
  real-path containment, and runs permanent direct-link and linked-parent
  negative fixtures in both `preview:prepare` and the primary check.
- Tightened the remaining review findings by requiring load-bearing HTML
  `src`/`href` attributes, safe 404 bodies, and exact enforcement of every
  runtime and publication field in the deployment manifest.
- Closure review found the first link fix still trusted a linked `dist` root and
  that regex-shaped HTML could accept comments or preload-only links. Added a
  pre-build root identity check, repeated root rejection in enumeration and
  request resolution, a permanent linked-root fixture, and DOM parsing that
  requires an active module script and stylesheet.
- Added a fifth permanent POSIX fixture backed by a temporary Unix-domain socket
  so the generic nested non-regular-entry rejection is executed, rather than
  relying only on code inspection or the retained manual FIFO receipt.
- Kept the manifest publication state `not-published`; provider access, cost,
  custom DNS, production promotion, and the public visual-review step remain
  approval-gated.

## 2026-07-17 — Public production closure

- Received explicit captain approval to use the existing Cloudflare and Vercel
  access, publish `possible.sh`, and create a public Fray Labs repository.
- Audited the current tree and full local history for tracked env files,
  high-confidence credential patterns, and oversized artifacts; no publication
  blocker was found.
- Created public `fraylabs/possible` and published the exact verified tree as a
  clean initial commit, retaining the richer internal jj history locally.
- Added a deterministic Vercel build and SPA routing contract. Vercel's prebuilt
  static output matched all three reviewed file hashes exactly.
- Deployed from public commit
  `6378e10d4ca2909ce1ff4535e4399706b196ce8f`, connected the Vercel project to
  the GitHub repository, and retained the public provider fallback
  `https://possible-three.vercel.app`.
- Added only DNS-only A records for `possible.sh` and `www.possible.sh` to the
  previously empty Cloudflare zone, using Vercel's requested `76.76.21.21`
  target. Both hosts returned HTTPS 200 with valid certificates.
- Independent live fetches matched the reviewed HTML, JavaScript, and CSS
  hashes; `/knowledge/web` returned the SPA entry point with HTTP 200.
- Completed rendered acceptance at desktop `1440 × 1000`, mobile `390 × 844`,
  and tablet `834 × 1112`. Search, result selection, graph refocus, path/history,
  overview, mobile drawer, graph/detail transitions, and provenance presentation
  passed with no browser console warning or error.
- Recorded production state and remaining approval boundaries without claiming
  a hosted remote MCP service, built dashboard, CAD model, quote, purchase,
  order, or fabrication.
- A fresh-context read-only verifier reran the complete child check, Git diff
  validation, GitHub visibility/head checks, credential scan, live TLS fetches,
  and live hash comparison. It returned `PASS WITH NON-BLOCKING LIMITS` and no
  blocking finding.
- Recorded its provider-edge distinction: local negative-route guarantees remain
  valid, while Vercel's SPA catch-all returns the app shell for an unknown asset
  and rejects the tested encoded traversal with HTTP 400 without exposing files.
- Monitoring the first Git-triggered deployment caught an npm optional-platform
  lockfile failure before it could reach either custom domain. The first build
  lacked Rolldown's Linux binding; the next exposed the equivalent Lightning CSS
  gap.
- Audited every Linux x64 optional native dependency reachable from the lock and
  pinned the exact glibc packages for Rolldown `1.1.5`, Lightning CSS `1.32.0`,
  and Esbuild `0.28.1`. A clean temporary Linux/x64-resolved `npm ci` installed
  all three packages and native files with no missing glibc x64 entry.
- Public commit `f3b5bdabbffb997bc4523d30ed2b1bae08a17e78` then completed the
  Vercel Git build in 11 seconds and was promoted to every production alias.
  Post-promotion TLS, SPA, and exact live hash checks all passed with no artifact
  change or user-visible outage.

## 2026-07-18 — KISS wiki reset activated

- The captain rejected a formal capability-planning ontology in favor of a
  simpler product: a sourced Wikipedia of what can be made possible, readable
  by humans and agents.
- Replaced the standing goal with a page–link–source contract. Pages are the
  sole canonical content primitive; graph edges, backlinks, search, HTML, and
  agent responses must be derived from the same corpus.
- Kept the previous MVP result and production receipts intact as historical
  evidence rather than rewriting the original claim.
- Activated parallel bounded lanes for the wiki runtime, Web and manufacturing
  page migration, human atlas, two-tool agent interface, and skeptical review.
- The app background-thread allocator stalled and the first direct workers
  exposed a local CLI/config mismatch (`gpt-5.6-sol` on Codex `0.139.0`, then an
  unsupported `ultra`/`max` reasoning setting). Relaunched direct workers on
  the compatible `gpt-5.4` and `xhigh` combination before any lane edited files.

## 2026-07-18 — Page-only wiki implementation

- Replaced the 48-node JSON graph with 49 sourced Markdown pages: all original
  Web/manufacturing titles and unique source URLs were retained, and a sourced
  CAD Skills (text-to-cad) page was added.
- Reduced the canonical runtime to `WikiPage`, `PageSource`, and derived
  search/read/backlink helpers. Validation now rejects duplicate slugs, invalid
  dates, missing or non-HTTPS sources, reserved derived fields, malformed links,
  and links to absent pages.
- Reduced the MCP surface to exactly `search` and `read` across stdio and
  Streamable HTTP; the Agent Skill now teaches progressive retrieval and leaves
  planning/execution with the host agent.
- Rebuilt the human projection as a warm article/sidebar beside a midnight
  related-page graph. One selection action drives search, article links, graph
  nodes, browser history, and the mobile article sheet.
- Generated `/llms.txt`, `/wiki/index.json`, and 49 individual page JSON files
  from the canonical corpus. The preview verifier checks each document's
  sources, body, links, backlinks, and related pages plus exact artifact bytes.
- Browser acceptance exposed a too-tall desktop graph and overlapping mobile
  labels. Made the desktop graph viewport-stable and tightened the 390px graph;
  search, graph refocus, mobile sheet transitions, and console checks then
  passed.
- Black-box agent probes exposed three retrieval usability defects: natural
  filler words, trailing punctuation, and JSON-only helper arguments. Fixed all
  three and added a real stdio regression for the literal outcome “I want to
  make a robot arm.”
- A final fresh-context run used that exact outcome once, read `Robotic arms`,
  followed `Parametric CAD master`, cited both pages' review dates and sources,
  avoided all legacy vocabulary, and returned `ACCEPT`.
- `npm run check` passed with 49 pages, 146 links, 14 knowledge tests, 7 MCP
  tests, 10 website/real-corpus tests, 1 black-box helper test, 5 artifact
  boundary tests, all builds, and exact verification of 54 files / 801,787
  bytes / SHA-256
  `6aa2ddd85417656cb683eb3746b77d13b89401edeee7363077a6392f70fa088a`.
