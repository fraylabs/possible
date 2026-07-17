# Production deployment

Possible's website is packaged as a static Vite artifact. Build and verify the
exact production bundle with:

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

The reviewed bundle is published at [possible.sh](https://possible.sh) through
Vercel, with Cloudflare retaining authoritative DNS. `preview-artifact.json`
records the production state, URLs, provider boundary, and immutable artifact
digest. `PRODUCTION.md` records the public repository, source commit, provider
handoff, DNS shape, live byte checks, responsive browser acceptance, and
remaining limits.

`npm run preview:prepare` is deliberately local and provider-state read-only. It
rewrites generated local build outputs, but does not authenticate, change DNS,
or deploy. Future provider, DNS, production, credential-scope, or paid-plan
changes remain separately approval-gated.
