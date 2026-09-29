# CLI 0.4.0 — recipes

CLI 0.4.0 is distributed through the existing GitHub release channel:
https://github.com/fraylabs/possible/releases/tag/v0.4.0

The package adds optional recipe validation and `fetch/use --json`, preserving
plain-prompt output and existing schema v3/v4 manifests. The public tarball SHA-1
is `d483482d587cc7347fb91ad513451b9faeaa59c7` and matches the tested candidate.
It was freshly installed from the release URL and validated all 21 publisher
Outcomes, including ten recipes. Product checks include installed-package,
legacy validation, directory snapshot, MCP and web component coverage.

The npm registry still serves 0.3.1 because existing publisher authentication
returns E401. Documentation uses the GitHub tarball directly; do not claim an
npm 0.4.0 publication or retry a publish without reconciling registry state.

# CLI 0.3.1 — public package verified

September 18, 2026: the public npm package `@fraylabs/possible@0.3.1`
was installed in a fresh temporary directory and verified against the public
`fraylabs/possible-outcomes` source at revision
`58e36ea140a79bdc7984e40c24a9e8ef0eaa0c5c`.

The registry SHA-1 is `0e609e0b648d1004e9dc4ff5952a143a470f89a3`,
matching the previously tested candidate. No npm republication is needed.

Verified using the registry-installed CLI:

- Create and validate Product and Skill Outcomes using schema v4.
- Reject a v4 Outcome without its required primary attribution.
- Continue validating schema v3 Outcomes.
- Add all 10 public Fray Outcomes and validate their public source checkout.
- Retrieve `digital-photo-frame` with `use` and match its pinned source prompt,
  accounting for the CLI's outer-whitespace normalization and output newline.

The isolated release branch passes `npm run check`, including the installed-package
regression test and static documentation validation. The matching website,
README and Skill examples use 0.3.1 and include primary attribution when creating
an Outcome. The publisher README can now use the current add/use commands.

This release excludes the separate local theme-toggle change and retained private
hardware/presentation work. It changes no backend schema or publisher manifests.
