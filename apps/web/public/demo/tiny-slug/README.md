# tiny-slug

`tiny-slug` turns a string into a lowercase ASCII slug with one small ESM API and no runtime dependencies.

It requires Node.js 22 or later.

> [!NOTE]
> This repository is a local release candidate. The `tiny-slug` registry name is unverified, and no package has been published as part of this work.

## Quick start

After a release under the confirmed package name, install it with npm:

```sh
npm install tiny-slug
```

Import the named ESM export:

```js
import { slugify } from "tiny-slug";

slugify("Hello, Possible!"); // "hello-possible"
```

To try the current source without installing anything:

```sh
node examples/basic.js
```

## Behavior

The function lowercases ASCII letters, replaces each run of characters outside `a-z` and `0-9` with `-`, and removes separators from both ends.

| Input | Output |
| --- | --- |
| `"Hello, Possible!"` | `"hello-possible"` |
| `"  API___v2  "` | `"api-v2"` |
| `"München guide"` | `"m-nchen-guide"` |
| `"你好"` | `""` |

Non-ASCII text is separator material, not transliterated text. Inputs that contain no ASCII letters or digits therefore return an empty string.

See the [API reference](docs/api.md) for the complete contract and [why v1 is intentionally narrow](docs/design.md) for its tradeoffs.

## Local verification

Run the complete local verifier used by contributors and CI:

```sh
npm run verify
```

Use `npm test` when you only need the test suite. The included CI workflow is configured to run the verifier on Node.js 22, 24, and 26; this local preparation does not claim that GitHub-hosted CI has run.

You can also [install the locally packed artifact](docs/local-install.md) in a clean temporary project before any public release.

In the source repository, project workflow and policy details live in [CONTRIBUTING.md](CONTRIBUTING.md), [SECURITY.md](SECURITY.md), and [CHANGELOG.md](CHANGELOG.md).
