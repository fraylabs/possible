# `@fraylabs/possible@0.1.8` publication preflight

Status: **local tarball verified; not published**.

## Candidate

- Package: `@fraylabs/possible`
- Version: `0.1.8`
- Runtime: Node.js 22 or newer
- Tarball: `fraylabs-possible-0.1.8.tgz`
- Packed size: 16,584 bytes
- Unpacked size: 56,500 bytes
- Entries: 6
- npm shasum: `b37e601945cadfe800da92ab59bf0b059546ae36`
- SHA-256 of the preflight tarball: `4a7e7717b4067623a3f1839c85b43fd4d0ada695444b1715cf454eb9eb40a74d`
- npm integrity: `sha512-UtyCRm9AqbHY5bOmk19Y4a9gqEJ46lf1kBvEmjM5uMZAKrt4rvMz533lHt/73YHLJb0lLKZpXyfZbyEPPupMVQ==`

## Packed files

```text
assets/possible/agents/openai.yaml
assets/possible/references/packs.md
assets/possible/SKILL.md
package.json
src/index.mjs
src/init.mjs
```

The tarball contains the current thirteen-pack fallback snapshot. It adds Web Presentation to the twelve Outcome Packs already available in published version `0.1.7`.

## Commands exercised

```bash
npm pack -w @fraylabs/possible --pack-destination <temporary-directory> --json
npm exec --yes --package <temporary-directory>/fraylabs-possible-0.1.8.tgz -- possible init
find .agents/skills/possible -type f -print | sort
rg -n '^## ' .agents/skills/possible/references/packs.md
shasum -a 256 <temporary-directory>/fraylabs-possible-0.1.8.tgz
```

The tarball installed successfully into a new disposable target and emitted exactly the three expected skill files. The installed agent metadata was readable, all thirteen pack headings were present, Web Presentation was present, and the CLI returned the `$possible` invocation.

## Publication gate

`npm view @fraylabs/possible version` returns `0.1.7`. Publishing `0.1.8` changes public external state and requires explicit owner approval. After publication:

1. Run `npm view @fraylabs/possible@0.1.8 version engines bin dist --json`.
2. Install the registry package—not this local tarball—into another clean disposable target.
3. Confirm the three-file snapshot and thirteen-pack fallback reference.
4. Update the judge install command only after those checks pass.
5. Preserve that the measured `possible-r1` pilot used `0.1.6`; publishing `0.1.8` does not retroactively change the tested version.
