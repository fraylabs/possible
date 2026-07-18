# Local publication candidate

Possible's website is packaged as a static Vite artifact. Build and verify an
exact local publication candidate with:

```bash
npm run preview:prepare
```

The verifier compares every built file with `preview-artifact.json`, checks the
aggregate artifact digest, serves the bundle on an ephemeral loopback port, and
proves exact asset delivery, the client-route fallback, missing-asset behavior,
encoded path-traversal rejection, correct content types, and the absence of
symbolic links and public source maps. A preflight rejects a linked artifact
root before the build, and parsed HTML must contain an active module script and
stylesheet for the declared assets.

`preview-artifact.json` records the exact local candidate and explicitly marks
it `not-published`. It retains the prior production receipt separately so a new
local digest cannot be mistaken for evidence of a new deployment.
`PRODUCTION.md` is historical evidence for previously authorized publication;
it is not evidence that the current candidate is live.

`npm run preview:prepare` is deliberately local and provider-state read-only. It
rewrites generated local build outputs, but does not authenticate, change DNS,
or deploy. Publishing the exact candidate—or making any provider, DNS,
credential-scope, or paid-plan change—requires separate explicit approval.
