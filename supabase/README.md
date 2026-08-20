# Supabase

Possible uses hosted Supabase for company accounts, products, gallery sources,
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

The private `/publish` route lets the first authenticated maintainer claim the
administrator slot, create any number of companies and products, and connect one
public gallery URL per product. It is intentionally absent from public
navigation and search indexing.

Use `$gallery-import` on a connected public URL. The skill produces a local
`gallery-import.json`; upload that file beside the source in `/publish` to create
or refresh private Outcome drafts. Imports cannot publish. Source fields remain
separate from editorial overrides, and an Outcome cannot be published without a
title, exact prompt, and result media URL.
