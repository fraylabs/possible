# Why v1 is intentionally narrow

`tiny-slug` is designed for JavaScript developers who need a predictable ASCII label, filename fragment, or URL-slug component without configuration or runtime dependencies. Its value is a contract that can be understood at a glance.

## ASCII output is the boundary

The output alphabet is deliberately limited to lowercase `a-z`, digits `0-9`, and hyphens between segments. Non-ASCII input acts as separator material; the package does not guess a transliteration or locale.

This choice keeps behavior deterministic and avoids pretending that one transliteration rule is correct for every language. It also means information can be lost:

- `München` becomes `m-nchen`, not `munchen`.
- A string containing only non-ASCII characters becomes an empty string.
- Different inputs can produce the same output.

Callers that need internationalized slugs should use a library designed for transliteration and locale-aware behavior.

## One function, one behavior

Version 1 has no options object. Callers cannot select another separator, preserve case, provide replacement maps, or change allowed characters. Avoiding modes keeps the API, test matrix, and maintenance burden small.

The package is ESM-only and exposes the named `slugify` export. CommonJS compatibility wrappers and a default export are outside the v1 scope.

## What a slug does not guarantee

A slug is display-oriented normalized text. It is not guaranteed to be unique, non-empty, reversible, safe as an authorization boundary, or valid under every application's path and database rules.

Applications should validate the result for their own context and add a stable identifier when uniqueness matters.
