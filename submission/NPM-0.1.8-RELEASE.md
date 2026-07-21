# `@fraylabs/possible@0.1.8` release receipt

Verified from the public npm registry on 2026-07-21.

```text
package: @fraylabs/possible
version: 0.1.8
dist-tag: latest
node: >=22
binary: possible -> src/index.mjs
shasum: b37e601945cadfe800da92ab59bf0b059546ae36
integrity: sha512-UtyCRm9AqbHY5bOmk19Y4a9gqEJ46lf1kBvEmjM5uMZAKrt4rvMz533lHt/73YHLJb0lLKZpXyfZbyEPPupMVQ==
```

Canonical install:

```bash
npx @fraylabs/possible@0.1.8 init
```

A clean installation into a disposable directory passed. The installed snapshot contained `SKILL.md`, `agents/openai.yaml`, `references/packs.md`, and all four featured Outcome Packs. The CLI printed the expected `$possible` invocation.

Verification commands:

```bash
npm view @fraylabs/possible@0.1.8 version engines bin dist --json
npm view @fraylabs/possible dist-tags --json
npm exec --yes --package @fraylabs/possible@0.1.8 -- possible init
```
