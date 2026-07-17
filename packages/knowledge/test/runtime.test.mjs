import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  getBacklinks,
  getPage,
  getRelatedPages,
  loadWiki,
  searchPages,
} from "../dist/index.js";
import { wikiCorpusData } from "../dist/data.js";

const corpus = {
  pages: [
    {
      slug: "build-an-accessible-site",
      title: "Build an accessible site",
      summary: "Publish an inclusive website with semantic HTML and keyboard support.",
      body: "Start with landmarks, headings, labels, and visible focus states.",
      tags: ["web", "accessibility"],
      reviewedAt: "2026-07-18",
      sources: [{ title: "Web accessibility guidance", url: "https://example.com/a11y" }],
      links: ["choose-web-hosting"],
    },
    {
      slug: "choose-web-hosting",
      title: "Choose web hosting",
      summary: "Compare hosting constraints for a website before publishing it.",
      body: "Check deployment inputs, custom domains, observability, and rollback options.",
      tags: ["web", "publishing"],
      reviewedAt: "2026-07-17",
      sources: [{ title: "Hosting reference", url: "https://example.com/hosting" }],
      links: [],
    },
    {
      slug: "document-a-project",
      title: "Document a project",
      summary: "Write down decisions and limitations so that work can be reviewed.",
      body: "Link the implementation guide and record verification evidence.",
      tags: ["practice"],
      reviewedAt: "2026-07-16",
      sources: [{ title: "Documentation reference", url: "https://example.com/docs" }],
      links: ["build-an-accessible-site"],
    },
  ],
};

test("loadWiki isolates callers from the browser-safe canonical export", async () => {
  const first = await loadWiki();
  const canonicalLength = wikiCorpusData.pages.length;
  assert.ok(canonicalLength > 0);
  first.pages.push(corpus.pages[0]);
  assert.equal(wikiCorpusData.pages.length, canonicalLength);
  first.pages[0].title = "mutated by caller";
  assert.notEqual(wikiCorpusData.pages[0].title, "mutated by caller");
});

test("searchPages is deterministic, weighted, filterable, and bounded", () => {
  const first = searchPages(corpus, "accessible website");
  const second = searchPages(corpus, "accessible website");
  assert.equal(first[0]?.page.slug, "build-an-accessible-site");
  assert.equal(
    searchPages(corpus, "I want to make an accessible website.")[0]?.page.slug,
    "build-an-accessible-site",
  );
  assert.deepEqual(first, second);
  assert.deepEqual(searchPages(corpus, "accessible website", { tags: ["publishing"] }), []);
  assert.equal(searchPages(corpus, "website", { tags: ["web"], limit: 1 }).length, 1);
  assert.deepEqual(searchPages(corpus, "  "), []);
  assert.deepEqual(searchPages(corpus, "website", { limit: 0 }), []);
});

test("exact reads, backlinks, and related pages derive from page links", () => {
  assert.equal(getPage(corpus, "choose-web-hosting")?.title, "Choose web hosting");
  assert.equal(getPage(corpus, "missing-page"), undefined);
  assert.deepEqual(
    getBacklinks(corpus, "build-an-accessible-site").map((page) => page.slug),
    ["document-a-project"],
  );
  assert.deepEqual(
    getRelatedPages(corpus, "build-an-accessible-site").map((page) => page.slug),
    ["choose-web-hosting", "document-a-project"],
  );
  assert.deepEqual(getRelatedPages(corpus, "missing-page"), []);
});

test("browser-safe data projection contains no Node-only imports or planner contract", async () => {
  const dataSource = await readFile(new URL("../dist/data.js", import.meta.url), "utf8");
  const generatedSource = await readFile(new URL("../dist/generated-data.js", import.meta.url), "utf8");
  const declarations = await readFile(new URL("../dist/types.d.ts", import.meta.url), "utf8");
  assert.doesNotMatch(dataSource + generatedSource, /node:/);
  assert.doesNotMatch(
    declarations,
    /KnowledgeGraph|KnowledgeNode|Recommendation|ProviderCapability|CapabilityRequirements/,
  );
});
