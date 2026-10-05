# Standalone CLI releases

The CLI uses Acorn to inspect exec wrappers without evaluating session code.
The parser is bundled into the executable with its MIT license. Users install an executable with
its own Node runtime; npm 0.3.1 remains legacy and is never published by this pipeline.

`CLI binaries` runs the CLI tests before native builds on macOS arm64/x86_64 and
Linux arm64/x86_64. It pins Node **22.23.3**, including `node:sqlite`, and locks the
build-only esbuild and postject tools in this directory. The packaging wrapper
adapts the top-level ESM dispatch for CommonJS SEA and adds `--version` from the
CLI package metadata. It does not edit capture or redaction source.

Following [Node's SEA procedure](https://nodejs.org/download/release/v22.23.3/docs/api/single-executable-applications.html),
the build creates a preparation blob without snapshots or code cache, copies the
same Node binary, removes its existing macOS signature, injects the blob, then
ad-hoc signs and verifies the macOS executable. Archives contain `possible`, its
MIT license, the Acorn license, and the embedded Node distribution's license notices. Linux uses
the official glibc Node distribution (glibc 2.28+); Alpine/musl is not supported.

Every platform runs the built executable in a clean environment without Node on
PATH. Smoke checks cover version, help, create/validate, synthetic Codex capture/check,
and synthetic SQLite capture. No private transcript, creator review, or network
publication is involved in these checks.

## Releasing

1. Change `apps/cli/package.json` and its root lockfile entry to the new version.
2. Open a branch/PR. Merge after CI and all four native packaging jobs pass.
3. Push a matching version tag, for example `v0.6.2`.

The workflow publishes four `possible-v<VERSION>-<OS>-<ARCH>.tar.gz` assets and
`SHA256SUMS` at the matching GitHub release, then the tap-owned updater generates `Formula/possible.rb`
in [fraylabs/homebrew-tap](https://github.com/fraylabs/homebrew-tap) from the
published release and its checksum file. No npm publishing occurs. Manual `workflow_dispatch` and PR runs build
artifacts only; only version-tag runs publish or update the tap.

The tap owns an hourly scheduled workflow and a `workflow_dispatch` updater.
It reads Possible's public latest release and `SHA256SUMS`, and commits only
`Formula/possible.rb` with the tap's own `GITHUB_TOKEN` (`contents: write`). No
cross-repository secret is required. An agent can update the tap immediately
following a successful release:

```sh
gh workflow run update-possible.yml -R fraylabs/homebrew-tap
```

Published assets are not silently replaced: a release-job retry verifies the
existing checksum file and refuses differing artifacts. Rebuilt archives can
have different timestamps; preserve successful build artifacts for retries.
The tap updater refuses to downgrade a newer formula.

The installer is `apps/web/public/install.sh`. Serve it through the site's normal
web deploy; it is included in the static Next.js export. It resolves GitHub's
latest stable release once, or uses `POSSIBLE_VERSION`, verifies the selected
archive against `SHA256SUMS`, and atomically installs into `~/.local/bin` or
`POSSIBLE_INSTALL_DIR`. It does not use sudo or modify shell profiles.

## Local packaging

With the pinned official Node distribution on PATH:

```sh
npm ci --workspace @fraylabs/possible --include-workspace-root=false --ignore-scripts --no-audit --no-fund
npm ci --prefix scripts/sea --ignore-scripts --no-audit --no-fund
node scripts/sea/build.mjs
node scripts/sea/smoke.mjs
```

These commands install the CLI parser and packaging tools. The resulting binary needs neither
Node nor npm on the user's system.
