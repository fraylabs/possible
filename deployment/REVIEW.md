# Final static-preview artifact-integrity closure audit

Review date: 2026-07-17
Repository: `/Users/brianlim/coding/fray/repos/possible`
Audited base: Git `10141eacb2756063cb1a88f19ac0555608bec89c`
Implementation diff SHA-256, excluding this review:
`771cb7ed8236bd19c520950e94870259b36f411fd772ff7acc36f6a8b7f0dc9a`

> This is the retained pre-publication artifact audit. Publication and rendered
> acceptance were completed later and are recorded in `PRODUCTION.md`.

## Verdict

**LOCAL ARTIFACT AND PERMANENT INVARIANT CLOSURE PASS; PUBLICATION AND
RENDERED VISUAL ACCEPTANCE ARE UNPROVED.**

The current production build is reproducible at the exact reviewed three-file
identity, and the verifier serves and checks it successfully on loopback. The
linked-parent escape, linked artifact-root false-pass, and comment/preload HTML
false positives from the stale review are closed in the live implementation and
five-test suite.

`DEPLOY-001` is now closed. The fifth permanent POSIX fixture creates a temporary
Unix-domain socket beneath `dist/assets`, waits until it is listening, and
requires `describeArtifact` to reject with the generic non-regular-entry error
from `scripts/verify-preview.mjs:49-50`. It passed without skipping in the
standalone suite, `preview:prepare`, and the full check, and its server closes in
`finally` before sandbox cleanup. `DEPLOY-002` remains closed by the parsed-HTML
negative and positive fixture.

No browser or provider was used. This audit does not prove a public deployment,
a provider runtime, or rendered visual quality.

## Commands and receipts

Environment: Node `v25.2.1`; npm `11.6.2`.

- `npm run preview:test` — exit 0; 5/5 permanent tests passed with 0 skipped.
- `npm run preview:prepare` — exit 0; root preflight, deterministic knowledge and
  Web rebuild, 5/5 preview tests with 0 skipped, and exact runtime verification
  passed. Receipt:

  ```text
  Verified production preview artifact 8b8165a9e7cdcc6999ea99e4c52457da706650ff3f50ed3d46f280688dbf6c95: 3 regular files, 390944 bytes, exact bytes and content types, SPA fallback, no links or public source maps, and safe negative routes.
  ```

- `npm run check` — exit 0; graph and Skill validation, knowledge 8/8, MCP 6/6,
  Web 14/14, real-graph Web integration 2/2, evaluation 18/18, preview 5/5 with
  0 skipped, all builds, exact preview verification, and evaluation regeneration
  passed.
- `git diff --check` — exit 0 before and after this review; no whitespace errors.

Only normal clean paths and read-only inspections were run. No extra filesystem
boundary probe was created.

## Artifact and manifest receipts

Independent `lstat`/directory enumeration found a real, non-linked
`apps/web/dist` root, one real `assets` directory, exactly three regular files,
and zero symlink or other non-regular descendants. Independent byte and SHA-256
recomputation matched the manifest exactly:

| Path | Bytes | SHA-256 |
| --- | ---: | --- |
| `assets/index-BuReXpX3.js` | 364154 | `65917305a39c4d3deb2b5cecbcf3674cd50cd6c355c57f6dc3ea9b00b06ade3c` |
| `assets/index-CuuU0_vw.css` | 26176 | `27a361aa0e32a29b4c973d736b276446f0c2bcee4dfb17a0918c4252df65eec8` |
| `index.html` | 614 | `71795cae8d77cf2b2d0783b93f023225d46351307f961d88f400a4ff19f8ba6d` |

File count is 3, total bytes are `390944`, and the canonical aggregate SHA-256
is `8b8165a9e7cdcc6999ea99e4c52457da706650ff3f50ed3d46f280688dbf6c95`.
There are no `.map` files and no `sourceMappingURL` or `sourceURL` directives;
`apps/web/vite.config.ts:14-17` also sets `sourcemap: false`.

The verifier asserts every manifest field exactly at
`scripts/verify-preview.mjs:272-307`:

- `schemaVersion: 1`
- `artifactDirectory: "apps/web/dist"`
- `buildCommand: "npm run preview:build"`
- `verificationCommand: "npm run preview:verify"`
- `runtimeContract`: `entrypoint: "index.html"`, `spaFallback: true`,
  `sourceMapsPublished: false`, `contentTypesVerified: true`,
  `symbolicLinksAllowed: false`, `artifactRootSymbolicLinkAllowed: false`,
  `missingAssetStatus: 404`, and `pathTraversalStatus: 404`
- `publication.state: "not-published"`
- `publication.allowedNextAction: "Explicit captain approval for one
  non-production provider-generated preview URL"`
- `publication.requiresSeparateApproval`: `"provider authentication or
  repository access"`, `"cost or paid-plan exposure"`, `"custom DNS"`, and
  `"production promotion"`

The complete file array, each size/hash, total bytes, and aggregate digest are
then compared with the rebuilt artifact rather than merely reported.

## Requirement-by-requirement findings

### Reproducible identity and source maps — pass

Both declared rebuild paths reproduced the same names, bytes, per-file hashes,
total, and aggregate digest. Manifest comparison is exact. The configured and
observed artifact contains no public source map or inline source-map directive.

### File boundaries — pass; `DEPLOY-001` resolved

- `assertRealArtifactDirectory` at verifier lines 22-34 rejects a linked or
  non-directory root. Enumeration invokes it before every `readdir` at lines
  36-55; routing invokes it at lines 128-133.
- The build preflight at lines 316-320 uses that same root check, and
  `package.json:18-19` places it before both preview and full Web builds. The
  clean preflight passed. The permanent linked-root test at test lines 73-86
  proves rejection through enumeration and request routing.
- Final-component `lstat` plus real-path containment at verifier lines 91-111
  rejects a regular file reached through a linked parent. The fixture at test
  lines 57-71 returns exactly `{ statusCode: 404 }`.
- A nested symbolic-link fixture at test lines 21-32 proves the explicit link
  rejection at verifier lines 43-44.
- The POSIX fixture at test lines 34-55 creates
  `dist/assets/unmanifested.sock`, waits for its Unix-domain server to listen,
  invokes `describeArtifact`, and matches the generic
  `Non-regular entries are not allowed in the preview artifact` error emitted by
  verifier lines 49-50. `finally` awaits server closure, and the sandbox cleanup
  registered at test lines 15-18 removes the temporary tree. All three test runs
  reported this fixture passed and `skipped 0`.

The fifth test therefore executes the formerly uncovered branch without
weakening the descendant-link, linked-parent, linked-root, or HTML fixtures.
`RESULT.md:43` records 5/5 on the reviewed POSIX host, and
`WORKLOG.md:104-106` records the socket fixture and its purpose.

### Active HTML references — pass; `DEPLOY-002` resolved

`activeAssetReferences` uses JSDOM at verifier lines 195-207. It accepts only
`script[src]` whose type is exactly `module` and links whose case-insensitive
`rel` token list contains `stylesheet`. The fixture at test lines 88-103 proves
that a commented script and preload-only link produce empty results while real
module-script and stylesheet nodes produce the expected paths.

Independent parsing of the built `index.html` found exactly:

```json
{"moduleScripts":["/assets/index-BuReXpX3.js"],"stylesheets":["/assets/index-CuuU0_vw.css"]}
```

Runtime verification requires those active references for every non-index JS or
CSS manifest file and fails any artifact type without a load-bearing HTML rule.

### Local serving contract — pass

The verifier binds an ephemeral TCP port only on `127.0.0.1` at lines 173-182 and
closes the server in `finally` at lines 216-269. It verifies each exact body,
size, hash, and response content type:

- HTML: `text/html; charset=utf-8`
- JavaScript: `text/javascript; charset=utf-8`
- CSS: `text/css; charset=utf-8`

`/knowledge/web` returns the exact `index.html` hash as the SPA fallback. A
missing `.js` asset and encoded parent traversal each return HTTP 404,
`text/plain; charset=utf-8`, and exactly `Not found`; no repository or fallback
HTML bytes are exposed on those negative routes. Responses also set
`cache-control: no-store`.

## Finding status

| Finding | Current status |
| --- | --- |
| `DEPLOY-001` — artifact file-boundary enforcement | **Resolved.** Descendant links, generic nested non-regular entries, linked parents, linked roots, pre-build root identity, current file types, and runtime containment all have passing permanent or exact-artifact evidence. |
| `DEPLOY-002` — inactive HTML decoys | **Resolved.** DOM parsing, a permanent comment/preload negative fixture, active-node positive fixture, and exact current-artifact parse all pass. |

## Remaining limits

- **Local:** this is a point-in-time run on the stated Node/npm environment and
  dirty source snapshot; it is not cross-platform proof or a signed archive.
  The loopback verifier is an ephemeral validation server, not a hosted preview.
- **Provider/publication:** `not-published` is repository-declared state only.
  No external URL or provider identity was queried, so this audit proves neither
  publication nor the absence of an unrelated deployment. Provider SPA rewrites,
  MIME behavior, HTTPS, compression, caching, headers, availability, and URL
  identity remain untested. Absolute `/assets/...` references require URL-root
  hosting unless the build contract changes.
- **Visual:** no browser was opened. Desktop, tablet, and mobile rendering,
  search/path/graph/detail flows, motion, links, responsiveness, accessibility in
  a rendered provider build, and visual polish remain unaccepted.

## Exact public-preview approval gate

The local integrity findings no longer block a preview-handoff request.
Publication itself remains closed because no captain approval was given. The
exact authorization required by the manifest is:

> **Explicit captain approval for one non-production provider-generated preview URL**

The approval must identify one non-production handoff for the reviewed artifact
digest. It does not authorize provider authentication or repository access,
cost or paid-plan exposure, custom DNS, or production promotion; each requires
separate explicit approval if needed.

A returned URL would prove only that publication event. Possible's completion
status must remain unchanged until the provider-generated deployment identity is
recorded and the desktop, tablet, and mobile search/path/graph/detail flows are
visually inspected and accepted.

This review neither performs nor authorizes deployment or visual acceptance.
