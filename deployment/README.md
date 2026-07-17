# Preview deployment handoff

Possible's website is packaged as a static Vite artifact. Build and verify the
exact reviewed bundle with:

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

This is deployment-readiness evidence, not publication evidence. The manifest
must remain `not-published` until the captain explicitly approves one named
non-production preview handoff. Provider authentication, repository access,
cost exposure, custom DNS, and production promotion each remain outside that
approval unless separately stated.

After an approved provider returns a preview URL, record the provider-generated
deployment identity and visually inspect desktop, tablet, and mobile
search/path/graph/detail flows before changing Possible's completion status.
