# Supabase

Possible uses hosted Supabase for public accounts, Products, Skills, gallery
sources, and Outcomes. An account owns its Outcomes. Products and Skills are
many-to-many references to what an Outcome used; they do not own the Outcome.
Development does not require Docker or a local Supabase stack.

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

The private `/dashboard` route lets the first authenticated maintainer claim the
administrator slot, manage account Outcomes, create any number of companies and
Products, inspect linked Skills, and connect one public gallery URL per Product.
The public navigation links to the dashboard, while its management data remains
authenticated. The legacy `/publish` route redirects there.

`/fray-labs` is the first public account page. It reads account-attributed
Outcomes, their Product links, and their Skill links from Supabase, with the
bundled catalog as a temporary static fallback for exported builds.

Use `$gallery-import` on a connected public URL. The skill produces a local
`gallery-import.json`; upload that file beside the source in `/dashboard` to create
or refresh private Outcome drafts. Imports cannot publish. Source fields remain
separate from editorial overrides, and an Outcome cannot be published without a
title, exact prompt, and result media URL.

Sync the bundled Fray Labs Outcomes into the hosted account idempotently:

```bash
npm run account-outcomes:sync
```

Imported gallery rows remain source-attributed even when Fray Labs manages them.
Only account-authored Outcomes appear on the Fray Labs public profile.

Successful prompt copies are recorded without prompt text, account identity, or
browser metadata. A random local visitor token limits one counted copy per
Outcome per UTC day. Raw events are private; the public application can only
record a copy and read the rolling seven-day Product and Skill ranking.
