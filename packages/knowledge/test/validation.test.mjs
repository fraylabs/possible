import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { compileWiki } from "../scripts/build-wiki.mjs";

const packageDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const fixture = (name) => resolve(packageDir, "test/fixtures", name);

const validateFixture = (name) =>
  spawnSync(
    process.execPath,
    ["scripts/build-wiki.mjs", "--validate-only", "--knowledge-dir", fixture(name)],
    { cwd: packageDir, encoding: "utf8" },
  );

test("canonical Markdown corpus validates and generated data is current", () => {
  const result = spawnSync(process.execPath, ["scripts/build-wiki.mjs", "--check"], {
    cwd: packageDir,
    encoding: "utf8",
  });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Validated \d+ pages and \d+ internal links/);
});

test("valid Markdown compiles metadata, body, and deduplicated internal links", async () => {
  const corpus = await compileWiki(fixture("valid-wiki"));
  assert.equal(corpus.pages.length, 3);
  assert.deepEqual(corpus.pages.map((page) => page.slug), [
    "build-a-widget",
    "choose-materials",
    "publish-a-widget",
  ]);
  assert.deepEqual(corpus.pages[0].links, ["choose-materials", "publish-a-widget"]);
  assert.match(corpus.pages[0].body, /\[materials\]: \/wiki\/choose-materials/);
  assert.deepEqual(corpus.pages[2].sources, [
    { title: "Example publishing reference", url: "https://example.com/publishing" },
  ]);
  assert.deepEqual(corpus.pages[0].aliases, ["small widget project", "widget build"]);
  assert.equal(corpus.pages[1].aliases, undefined);
  assert.deepEqual(Object.keys(corpus.pages[0]).sort(), [
    "aliases",
    "body",
    "links",
    "reviewedAt",
    "slug",
    "sources",
    "summary",
    "tags",
    "title",
  ]);
});

test("broken internal links are rejected", () => {
  const result = validateFixture("broken-link");
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /broken internal link: \/wiki\/does-not-exist/);
});

test("non-canonical internal link destinations are rejected", () => {
  const result = validateFixture("malformed-link");
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /internal link must use \/wiki\/<slug>/);
});

test("duplicate slugs are rejected", () => {
  const result = validateFixture("duplicate-slug");
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /duplicate page slug: repeated-page/);
});

test("derived fields cannot be authored in frontmatter", () => {
  const result = validateFixture("reserved-frontmatter");
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /unsupported frontmatter key: links/);
});

test("invalid review dates are rejected", () => {
  const result = validateFixture("invalid-date");
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /reviewedAt.*format "date"/s);
});

test("pages need at least one source", () => {
  const result = validateFixture("missing-sources");
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /sources.*must NOT have fewer than 1 items/s);
});

test("source URLs must use HTTPS", () => {
  const result = validateFixture("non-https-source");
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /sources\/0\/url.*must match pattern/s);
});

test("human-readable fields cannot contain only whitespace", () => {
  const result = validateFixture("whitespace-title");
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /title must contain non-whitespace text/);
});

test("guide kinds are rejected instead of creating a second ontology", () => {
  const result = validateFixture("invalid-kind");
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /unsupported frontmatter key: kind/);
});

test("route status is rejected instead of implying completeness", () => {
  const result = validateFixture("invalid-route-status");
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /unsupported frontmatter key: routeStatus/);
});

test("coverage metadata is rejected instead of encoding a route solver", () => {
  const result = validateFixture("invalid-coverage");
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /unsupported frontmatter key: coverage/);
});

test("guide aliases cannot contain only whitespace", () => {
  const result = validateFixture("whitespace-routing");
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /aliases\/0 must contain non-whitespace text/);
});
