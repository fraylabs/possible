# Production delivery and rendered acceptance

Review date: 2026-07-17

## Verdict

**PRODUCTION DELIVERY AND RENDERED ACCEPTANCE PASS.**

The reviewed Possible static artifact is publicly reachable at
[possible.sh](https://possible.sh). Its public source is
[fraylabs/possible](https://github.com/fraylabs/possible), and the production
provider is connected to that repository for future Git deployments.

## Delivery identity

- Primary URL: `https://possible.sh`
- Alternate custom URL: `https://www.possible.sh`
- Provider fallback: `https://possible-three.vercel.app`
- Public source: `https://github.com/fraylabs/possible`
- Initial prebuilt source commit: `6378e10d4ca2909ce1ff4535e4399706b196ce8f`
- Hosting: Vercel project `possible` in the existing `brainthrust` team
- Authoritative DNS: Cloudflare zone `possible.sh`
- DNS records added: DNS-only A records for the apex and `www`, both targeting
  Vercel's requested `76.76.21.21`

The Cloudflare zone contained no records before this handoff. No unrelated DNS
state was deleted or changed. No provider plan, paid feature, purchase, or cost
commitment was created.

## Exact artifact receipt

The local reviewed artifact, Vercel prebuilt output, and live HTTPS assets match:

| Path | Bytes | SHA-256 |
| --- | ---: | --- |
| `assets/index-BuReXpX3.js` | 364154 | `65917305a39c4d3deb2b5cecbcf3674cd50cd6c355c57f6dc3ea9b00b06ade3c` |
| `assets/index-CuuU0_vw.css` | 26176 | `27a361aa0e32a29b4c973d736b276446f0c2bcee4dfb17a0918c4252df65eec8` |
| `index.html` | 614 | `71795cae8d77cf2b2d0783b93f023225d46351307f961d88f400a4ff19f8ba6d` |

The canonical three-file aggregate SHA-256 remains
`8b8165a9e7cdcc6999ea99e4c52457da706650ff3f50ed3d46f280688dbf6c95`.
Both custom hosts returned HTTPS 200 with valid certificates. The client route
`/knowledge/web` returned HTTP 200 and `text/html; charset=utf-8`, proving the
provider-side SPA fallback.

## Git deployment durability

The first Git-triggered Linux build exposed npm's platform-optional lockfile
gap: the macOS-generated lock contained Darwin native binaries but omitted the
Linux x64 bindings used by Rolldown, Lightning CSS, and Esbuild. Production
remained on the already verified prebuilt deployment throughout; neither custom
domain was promoted to a failed build.

The root package now pins the exact glibc Linux x64 packages as optional
dependencies. A clean temporary `npm ci --os=linux --cpu=x64` installed all
three expected packages and native files with no remaining missing glibc x64
optional dependency. The full primary check still passed and preserved the
artifact digest.

Vercel then cloned public commit
`f3b5bdabbffb997bc4523d30ed2b1bae08a17e78`, completed its Git build in 11
seconds, marked the deployment Ready, and promoted `possible.sh`, `www`, and the
provider aliases. Post-promotion HTTPS fetches reproduced the same HTML,
JavaScript, CSS, and aggregate hashes.

## Rendered acceptance

The approved in-app Browser exercised the live custom domain:

| Viewport | Acceptance path | Result |
| --- | --- | --- |
| Desktop `1440 × 1000` | Search for Next.js, choose the exact match, refocus to Data-heavy dashboards, use Back and Overview, inspect guidance and provenance | Pass |
| Mobile `390 × 844` | Return from detail to graph, open the knowledge drawer, search for robotic arm, choose Robotic arms, inspect responsive detail | Pass |
| Tablet `834 × 1112` | Inspect the Robotic arms graph/detail split view and responsive controls | Pass |

The live browser reported zero console warnings and zero console errors. The
visual pass found no clipping, overlap, broken control, unreadable state, or
responsive-layout defect in the exercised paths.

## Independent closure audit

A separate read-only verifier returned **PASS WITH NON-BLOCKING LIMITS** after
running the full primary check, checking the public repository and remote main,
scanning the closure diff for credentials, and independently fetching both
custom hosts. It reproduced the three live file hashes and aggregate manifest
digest exactly. It found no blocking claim mismatch or approval regression.

The audit also established a provider-specific distinction: Vercel's SPA
catch-all returns the app shell with HTTP 200 for an unknown asset path, and its
edge rejects the tested encoded traversal with HTTP 400. The manifest's missing
asset and traversal 404 values are therefore guarantees of the local verifier,
not claims about Vercel's edge. No repository file was exposed by either live
negative route.

## Remaining trust boundary

This production deployment serves the human graph explorer. It does not host a
shared remote MCP endpoint; the repository contains the tested remote-ready MCP
source, stdio transport, and Streamable HTTP transport. The controlled dashboard
and motor-bracket runs remain handoff demonstrations, not built applications,
CAD, quotes, purchases, orders, or fabrication. Live provider suitability and
all consequential external actions still require current checks and explicit
approval.

## 2026-07-18 — KISS wiki production reset

The historical typed-graph receipt above remains accurate for that release. The
active production contract is now the sourced, page-only wiki described in
`GOAL.md` and `RESULT.md`.

### Delivery identity

- Public source commit:
  `ebfddd9df1c55cae5148ab26a7bbd0cd9d03a94e`
- Public branch: `fraylabs/possible` `main`; independently matched by
  `git ls-remote origin refs/heads/main`
- Vercel deployment: `dpl_7qvQGXPPR5vUSeFVHFkZycHAcb7u`
- Deployment URL: `https://possible-ni3lm8onc-brainthrust.vercel.app`
- State: production / Ready at 2026-07-18 00:44 Asia/Singapore
- Promoted aliases: `https://possible.sh`, `https://www.possible.sh`,
  `https://possible-three.vercel.app`, and the existing project aliases

### Exact live artifact receipt

At 2026-07-18 00:54 Asia/Singapore, a verifier loaded
`deployment/preview-artifact.json`, fetched every manifested path from
`https://possible.sh`, and compared status, byte count, and SHA-256:

| Check | Result |
| --- | --- |
| Manifested files | 54 of 54 exact |
| Total bytes | 801,787 exact |
| Artifact SHA-256 | `6aa2ddd85417656cb683eb3746b77d13b89401edeee7363077a6392f70fa088a` |
| Mismatches | 0 |
| `/wiki/index.json` | HTTP 200; `pageCount: 49`; 49 page records |
| `/wiki/web` | HTTP 200; `text/html; charset=utf-8` |
| `www` `/wiki/index.json` | HTTP 200; `application/json; charset=utf-8` |

Because every individual file hash matched the reviewed 54-file manifest, the
live static deployment is byte-identical to the locally accepted artifact.

### Live rendered acceptance

The approved in-app Browser exercised `possible.sh` at desktop `1440 × 1000`
and mobile `390 × 844`. It verified the default Web page, the literal outcome
search “I want to make a robot arm.”, route and graph synchronization on
`/wiki/robotic-arms`, the mobile article sheet, and graph navigation to
`/wiki/text-to-cad`. The accepted views had no horizontal overflow or observed
page-console warnings/errors. Five screenshots were retained in the ignored
Fray notification artifact directory for Telegram handoff.

All dates in this receipt use Asia/Singapore. The UTC timestamp corresponding
to the live byte check is 2026-07-17T16:54:28Z.

### Independent KISS closure audit

A final fresh-context release gate ran the full primary verifier and used the
existing Vercel token only for authenticated read-only inspection. The provider
reported deployment `dpl_7qvQGXPPR5vUSeFVHFkZycHAcb7u`, target `production`,
status `Ready`, creation time 2026-07-18 00:44:52 Asia/Singapore, and aliases
including both custom domains. The reviewer independently matched public
`main`, the literal robot-arm retrieval, and every manifested file on both
`possible.sh` and `www.possible.sh`: 54 files, 801,787 bytes, aggregate artifact
SHA-256 `6aa2ddd85417656cb683eb3746b77d13b89401edeee7363077a6392f70fa088a`,
and zero mismatches. Its verdict was `ACCEPT` with no blocking finding.

## 2026-07-18 — Two-mode human interface simplification

This release changes only the human projection and its artifact receipt. The
49-page corpus, 146 internal links, generated agent publications, and two-tool
read-only MCP contract remain unchanged.

### Delivery identity

- Public source commit:
  `3c78279fd7956624c3d2345b7ebb3e2b3180b9ee`
- Public branch: `fraylabs/possible` `main`
- Vercel deployment: `dpl_5DK9yJkZGaf1dMJ6giKwHdPwptb3`
- Deployment URL: `https://possible-fywcn5zgv-brainthrust.vercel.app`
- State: production / Ready at 2026-07-18 12:02 Asia/Singapore
- Aliases: `https://possible.sh`, `https://www.possible.sh`, and the existing
  Vercel project aliases

Authenticated Vercel metadata matched the deployment's Git SHA to the public
source commit above and its ref to `main`.

### Exact live artifact receipt

At 2026-07-18 12:04 Asia/Singapore, a read-only verifier fetched every
manifested file from both custom domains and compared status, byte count, and
SHA-256:

| Check | `possible.sh` | `www.possible.sh` |
| --- | --- | --- |
| Manifested files | 54 of 54 exact | 54 of 54 exact |
| Total bytes | 801,118 exact | 801,118 exact |
| Artifact SHA-256 | `44c578af4c389a5b2ee1730c57459dfb49afd341d6f4e47b0159511ccde48058` | same |
| Mismatches | 0 | 0 |

The clean local primary verifier independently reproduced the same 54-file
manifest, byte count, and aggregate digest.

### Live rendered acceptance

The in-app Browser exercised the production deployment at desktop
`1440 × 1000` and mobile `390 × 844`. Explore search, graph selection, stable
URLs, focused Read, Back to map, history behavior, and the literal robot-arm
outcome passed. The phone graph remained inside the viewport with zero node
collisions; entering Read from a scrolled map landed at the article start below
the sticky bar. No dialog semantics, horizontal overflow, browser warnings, or
browser errors were observed.

Ten accepted local and live images were retained under
`.agent-notifications/artifacts/possible-simple-ui-20260718-115844/` for the
Telegram media handoff.

### Independent two-mode closure audit

A fresh read-only reviewer returned `ACCEPT` after auditing the exact public
release range. It confirmed the sparse Explore and Read surfaces, deletion of
the modal sheet and dashboard metadata, preserved navigation and safety tests,
unchanged agent publication/contract paths, and the absence of every
`knowledge/**/*.md` file from the release. The reviewer intentionally did not
rerun commands; the clean primary verifier and live browser receipts above are
the execution evidence.

## 2026-07-18 — Top-level atlas correction

This release makes `/` a real atlas instead of treating the Web article as the
root. Web and Manufacturing are sibling fields, selecting either field enters
its own page neighborhood, and cross-field links remain available in article
prose without appearing as local graph children. The Possible wordmark returns
to the atlas from both Explore and Read.

The navigation fields are a web projection of the existing top-level folders
under `knowledge/pages/`; they do not add a second authored ontology. The
49-page corpus, 146 internal links, generated agent publications, and two-tool
read-only MCP contract remain unchanged.

### Delivery identity

- Public source commit:
  `f4f8caf03ce9cdebda1347d352b00f42d23b4ce5`
- Public branch: `fraylabs/possible` `main`
- Vercel deployment: `dpl_52V6eV6y28jfx52b1gGUzyxAVRbg`
- Deployment URL: `https://possible-bgf7maws8-brainthrust.vercel.app`
- State: production / Ready on 2026-07-18 Asia/Singapore
- Aliases: `https://possible.sh`, `https://www.possible.sh`, and the existing
  Vercel project aliases

### Exact live artifact receipt

A clean isolated checkout passed `npm run check` and recorded a 54-file static
artifact totaling 807,096 bytes with aggregate SHA-256
`0ef15a21ad41eb737358e7bd49536ca1ed5dffd0b16605ec8ac08d6715fa2ab5`.
Independent HTTPS reads then matched all 54 paths, byte counts, and hashes on
both `possible.sh` and `www.possible.sh`, with zero mismatches.

The web tests cover the root atlas, sibling Web and Manufacturing fields,
field-scoped related graphs, global search, stable routes, browser history,
mobile behavior, keyboard shortcuts, accessible semantics, and wordmark return
from both presentation modes. The complete repository verifier also passed the
knowledge, MCP, agent retrieval, build, negative-route, and exact-artifact
checks.
