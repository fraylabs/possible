# Install the local package artifact

Use this procedure to verify the package from a clean consumer project without publishing it or accessing the npm registry.

## Prerequisites

- Node.js 22 or later, matching `engines.node` in `package.json`
- npm
- a POSIX-compatible shell

## Pack and install

From the `tiny-slug` repository root, create two temporary directories:

```sh
pack_dir="$(mktemp -d)"
consumer_dir="$(mktemp -d)"
```

Pack the release artifact, then install that tarball into the empty consumer directory:

```sh
npm pack --pack-destination "$pack_dir"
cd "$consumer_dir"
npm init --yes
npm install --offline --ignore-scripts --no-audit --no-fund "$pack_dir"/tiny-slug-*.tgz
```

Import the public ESM API directly from the installed package:

```sh
node --input-type=module <<'JS'
import { slugify } from "tiny-slug";

console.log(slugify("Clean package install"));
JS
```

The command should print:

```text
clean-package-install
```

The two temporary directories can be deleted after inspection. This workflow performs no publication, tag, push, or other external release action.
