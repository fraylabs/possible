# Possible web

- `/` — searchable, paginated Outcome directory
- `/outcomes/view/?id=<uuid>` — source-owned result preview, exact prompt, provenance, files, Products, and Skills
- `/publish` — source-owned publishing from a public repository or domain
- `/saved` — private account bookmarks when GitHub authentication is enabled
- `/docs` — use, publishing, and format reference

The site reads Outcomes from the public Convex directory. Product and Skill attributions filter that directory; Possible does not host separate catalogs or profile pages for them. It imports `@possible/catalog` only for contract types. Publisher media remains at the publisher’s exact source revision. GitHub sign-in is optional and limited to likes and private bookmarks; publishing remains account-free.

Set `AUTH_GITHUB_ID` and `AUTH_GITHUB_SECRET` in the Convex deployment, then build the website with `NEXT_PUBLIC_GITHUB_AUTH_ENABLED=true`. Without all three, the public directory remains usable and account controls stay hidden.
