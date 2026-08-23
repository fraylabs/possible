# Possible web

- `/` — searchable, paginated Outcome directory
- `/outcomes/view/?id=<uuid>` — source-owned result preview, exact prompt, provenance, files, Products, and Skills
- `/products/<slug>` and `/skills/<slug>` — source information and related Outcomes
- `/publish` — source-owned publishing from a public repository or domain
- `/docs` — use, publishing, and format reference

The site reads Outcomes from the public Supabase directory. It imports `@possible/catalog` only for curated Product definitions, lightweight Skill links, and contract types. Publisher media remains at the publisher’s exact source revision.
