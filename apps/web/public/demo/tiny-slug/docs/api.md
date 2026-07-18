# API reference

`tiny-slug` exposes one named ESM function. There is no default export.

## `slugify(value)`

Convert a string to a lowercase ASCII slug.

```js
import { slugify } from "tiny-slug";

const result = slugify("Release Notes: July 2026");
// "release-notes-july-2026"
```

### Parameters

| Name | Type | Description |
| --- | --- | --- |
| `value` | `string` | Text to normalize. |

Passing a value that is not a string throws a `TypeError`.

The package includes a TypeScript declaration for this function; the runtime implementation remains JavaScript.

### Return value

A string containing only lowercase ASCII letters, ASCII digits, and single hyphens between non-empty segments. The result can be an empty string when the input has no ASCII letters or digits.

The observable normalization rules are:

1. Treat each run outside ASCII `A-Z`, `a-z`, and `0-9` as separator material.
2. Lowercase the remaining ASCII letters.
3. Remove a leading or trailing hyphen.

### Examples

| Call | Result |
| --- | --- |
| `slugify("Hello, Possible!")` | `"hello-possible"` |
| `slugify("already-slugged")` | `"already-slugged"` |
| `slugify("  one___two  ")` | `"one-two"` |
| `slugify("version 2")` | `"version-2"` |
| `slugify("München")` | `"m-nchen"` |
| `slugify("Kelvin")` | `"elvin"` |
| `slugify("你好")` | `""` |
| `slugify(42)` | throws `TypeError` |

## Module compatibility

The supported interface is ESM on Node.js 22 or later:

```js
import { slugify } from "tiny-slug";
```

CommonJS `require()`, a default export, browser bundles, and CDN loading are not part of the v1 contract.
