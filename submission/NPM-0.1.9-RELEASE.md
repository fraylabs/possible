# `@fraylabs/possible@0.1.9` release receipt

Verified from the release tarball and public npm registry on 2026-07-22.

```text
package: @fraylabs/possible
version: 0.1.9
dist-tag: latest
node: >=22
binary: possible -> src/index.mjs
shasum: 8a12fb444ba885e023b564b646fe3948279abb8e
integrity: sha512-4g45i78fXPz+F9RaNlpM3e1L39Y+I3IpNmntZd1oL9JxRezEk5uqHj6fmd+OcMAqdgLGmLhdbl6Ondfa8HcSKQ==
```

Canonical install:

```bash
npx @fraylabs/possible@0.1.9 init
```

A clean installation into a disposable directory passed. The installed snapshot contained `SKILL.md`, `agents/openai.yaml`, `references/packs.md`, and all four featured Outcome Packs. The CLI printed the expected `$possible` invocation.

Verification commands:

```bash
npm view @fraylabs/possible@0.1.9 version engines bin dist --json
npm view @fraylabs/possible dist-tags --json
npm exec --yes --package @fraylabs/possible@0.1.9 -- possible init
```
