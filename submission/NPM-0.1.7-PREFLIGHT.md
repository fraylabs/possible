# `@fraylabs/possible@0.1.7` publication preflight

Status: **local tarball verified; not published**.

## Candidate

- Package: `@fraylabs/possible`
- Version: `0.1.7`
- Runtime: Node.js 22 or newer
- Tarball: `fraylabs-possible-0.1.7.tgz`
- Packed size: 14,800 bytes
- Unpacked size: 49,908 bytes
- Entries: 6
- npm shasum: `9ba38e77d1bea527e611255a92f6fbd60a92bd89`
- SHA-256 of the preflight tarball: `2518835751dbf64e620aab0677b639ea80aabc7a5a8ac3bd7542def54ce4ba10`
- npm integrity: `sha512-Sv2l/6BJp40OGQZMektqtL3gl8W+T+WxenpTs9XTXU0vx3Tdri3zdXHZ4gIlYsfe9uq9nFGrRcKQwWZ9qCI1+A==`

## Packed files

```text
assets/possible/agents/openai.yaml
assets/possible/references/packs.md
assets/possible/SKILL.md
package.json
src/index.mjs
src/init.mjs
```

The tarball contains the current eleven-pack fallback snapshot, including Billion-Dollar SaaS, Kickstarter Funding, and Kickstarter Fulfillment.

## Commands exercised

```bash
npm pack ./apps/cli --pack-destination <temporary-directory> --json
npm exec --yes --package <temporary-directory>/fraylabs-possible-0.1.7.tgz -- possible init
find .agents/skills/possible -type f -print | sort
rg -n '^## ' .agents/skills/possible/references/packs.md
shasum -a 256 <temporary-directory>/fraylabs-possible-0.1.7.tgz
```

The tarball installed successfully into a new disposable target and emitted exactly the three expected skill files. The installed agent metadata was readable, all eleven pack headings were present, and the CLI returned the `$possible` invocation.

## Publication gate

`npm view @fraylabs/possible version` still returns `0.1.6`. Publishing `0.1.7` changes public external state and requires explicit owner approval. After publication:

1. Run `npm view @fraylabs/possible@0.1.7 version engines bin dist --json`.
2. Install the registry package—not this local tarball—into another clean disposable target.
3. Confirm the three-file snapshot and eleven-pack fallback reference.
4. Update the judge install command from pinned `0.1.6` only after those checks pass.
5. Preserve that the measured `possible-r1` pilot used `0.1.6`; publishing `0.1.7` does not retroactively change the tested version.
