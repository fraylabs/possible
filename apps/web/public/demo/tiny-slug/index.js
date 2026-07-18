/**
 * Convert a string to a lowercase ASCII slug.
 *
 * @param {string} value
 * @returns {string}
 * @throws {TypeError} When `value` is not a string.
 */
export function slugify(value) {
  if (typeof value !== "string") {
    throw new TypeError("slugify() expects a string");
  }

  return value
    .replace(/[^A-Za-z0-9]+/g, "-")
    .toLowerCase()
    .replace(/^-|-$/g, "");
}
