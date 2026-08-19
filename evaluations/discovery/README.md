# Discovery evaluation

`cases.json` contains ordinary-language searches for every published Outcome. The verifier measures whether the intended exact prompt appears near the top of the directory search.

Run `npm run discovery:evaluate`. The release gate requires at least 90% top-three retrieval and 100% top-ten retrieval. This measures text discovery only; it is not a claim that one prompt is objectively best.
