# `@fraylabs/possible@0.1.7` publication preflight

Status: **local tarball verified; not published**.

## Candidate

- Package: `@fraylabs/possible`
- Version: `0.1.7`
- Runtime: Node.js 22 or newer
- Tarball: `fraylabs-possible-0.1.7.tgz`
- Packed size: 12,752 bytes
- Unpacked size: 40,091 bytes
- Entries: 6
- npm shasum: `701939ec98a3473643c9083a23a619393ee002f7`
- SHA-256 of the preflight tarball: `10b6b29266574eb5fd581eee66c35781c697e3effe8de402351f763796fbfacc`
- npm integrity: `sha512-5dMw3z+4kagDov2CHJzmFAJpWVZvG+4ZenACJRMce4CjcKVKfo6eQuwZT/+1mvQfKCiU6Kw3UXbVvwDWxc+x7Q==`

## Packed files

```text
assets/possible/agents/openai.yaml
assets/possible/references/packs.md
assets/possible/SKILL.md
package.json
src/index.mjs
src/init.mjs
```

The packaged fallback reference contains all eight source-candidate packs, including Marketing Operations.

## Commands exercised

```bash
npm pack ./apps/cli --pack-destination <temporary-directory> --json
npm exec --yes --package <temporary-directory>/fraylabs-possible-0.1.7.tgz -- possible init
find .agents/skills/possible -type f -print | sort
rg -n '^## ' .agents/skills/possible/references/packs.md
shasum -a 256 <temporary-directory>/fraylabs-possible-0.1.7.tgz
```

The tarball installed successfully into a new disposable target and emitted exactly the three expected skill files. The installed agent metadata was readable, and the CLI returned the `$possible` invocation.

## Publication gate

`npm view @fraylabs/possible version` still returns `0.1.6`. Publishing `0.1.7` changes public external state and requires explicit owner approval. After publication:

1. Run `npm view @fraylabs/possible@0.1.7 version engines bin dist --json`.
2. Install the registry package—not this local tarball—into another clean disposable target.
3. Confirm the three-file snapshot and eight-pack fallback reference.
4. Update the judge install command from pinned `0.1.6` only after those checks pass.
5. Preserve that the measured `possible-r1` pilot used `0.1.6`; publishing `0.1.7` does not retroactively change the tested version.
