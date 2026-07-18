# Contributing to tiny-slug

Thank you for helping keep `tiny-slug` understandable and dependable. Contributions should preserve its small, ASCII-only ESM contract unless a future release explicitly changes that scope.

## Before you begin

- Use Node.js 22 or later, as declared by `engines.node` in `package.json`.
- Use npm to run the repository scripts.
- Report suspected vulnerabilities through the private process in [SECURITY.md](SECURITY.md), not a public issue.

The project uses Node's built-in test runner and has no runtime dependencies. A build step is not required.

## Make a change

1. Create a focused branch in your fork or local clone.
2. Change the implementation, tests, or documentation needed for one concern.
3. Add or update tests in `index.test.js` when observable behavior changes.
4. Update the README, API reference, and examples when the public contract changes.
5. Run the local checks:

   ```sh
   npm run verify
   node examples/basic.js
   node examples/edge-cases.js
   ```

6. Review the packed files and install the tarball in a clean project by following [the local installation guide](docs/local-install.md) when your change affects packaging.

## Pull request checklist

- The change has one clear purpose.
- Tests cover success, boundaries, and relevant failures.
- `npm run verify` passes on a supported Node.js version.
- Public behavior and examples agree with the implementation.
- No runtime dependency was added without a documented reason.
- The change does not silently add transliteration, configuration, or CommonJS support.

Describe what changed, why it changed, and how you verified it. Link related issues when they exist. Keep unrelated formatting or refactoring out of the same pull request.

## Project scope

Version 1 deliberately provides only the named ESM function `slugify(value)`. It does not provide transliteration, a configurable separator, locale-aware case conversion, CommonJS loading, uniqueness, or URL/path security guarantees.

Proposals that expand this boundary should begin with a design discussion before implementation. A small alternative package may be a better fit than adding modes to this one.
