# Supabase

Possible uses hosted Supabase for publisher accounts, products, gallery sources,
and imported Outcomes. Development does not require Docker or a local Supabase
stack.

The maintainer development project is `possible-dev` in the `fray`
organisation, hosted in Singapore. Its project reference is
`abutwsaahahtbtlopczi`. Database passwords and service-role keys must never be
committed.

Account-level CLI authentication comes from `SUPABASE_ACCESS_TOKEN` in the
maintainer's shell profile. Project-specific values live in the ignored root
`.env.local`; the database scripts load that file automatically. Copy
`.env.example` when setting up another checkout.

Link an authorised checkout once:

```bash
supabase link --project-ref abutwsaahahtbtlopczi
```

Schema changes belong in `migrations/` and should be checked remotely before
application code depends on them:

```bash
npm run db:push
npm run db:lint
npm run db:test
```

The initial schema keeps source-owned gallery data separate from publisher
overrides, enforces publisher/product ownership boundaries, prevents incomplete
Outcomes from being published, and exposes public data through row-level
security.
