# Supabase

Possible uses hosted Supabase for the public source registry, immutable Outcome snapshots, aggregate copy counts, and reviews. Publishers do not have Possible accounts. Development does not require Docker or a local Supabase stack.

The maintainer development project is `possible-dev` in the `fray` organisation, hosted in Singapore. Its project reference is `abutwsaahahtbtlopczi`. Secrets must never be committed.

Account-level CLI authentication comes from `SUPABASE_ACCESS_TOKEN` in the maintainer shell profile. Project-specific public values live in the ignored root `.env.local`.

```bash
supabase link --project-ref abutwsaahahtbtlopczi
npm run db:push
npm run db:lint
npm run db:test
```

## Publishing

The `register-outcome-source` function accepts one public GitHub repository or publisher domain. It independently fetches and validates every `outcome.json`, `outcome.md`, and `prompt.md`; the client payload is never trusted as the canonical content.

The function accepts no publisher authentication. Identity follows from control of the public repository or domain. It restricts remote fetches to public GitHub raw content or same-origin HTTPS domain files, limits source and document sizes, and stores content-addressed snapshots.

Publishing needs no Possible session. Reviews use an email sign-in so one person can maintain one review per Outcome. Copy counts use a locally generated visitor token that is hashed before storage. Raw events and reviewer identifiers are private; public readers receive aggregates and review text.

Do not deploy database migrations or Edge functions implicitly. Run linked lint and migration dry-run first, then deploy only when explicitly requested.
