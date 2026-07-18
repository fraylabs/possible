import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  getBacklinks,
  getGuide,
  getGuideBacklinks,
  getPage,
  getRelatedGuides,
  getRelatedPages,
  loadGuides,
  loadWiki,
  searchGuides,
  searchPages,
} from "../dist/index.js";
import { wikiCorpusData } from "../dist/data.js";

const library = {
  pages: [
    {
      slug: "accessible-sites",
      title: "Accessible sites",
      summary: "Build an inclusive website with semantic HTML and keyboard support.",
      body: "Start with landmarks, headings, labels, and visible focus states.",
      tags: ["web", "accessibility"],
      aliases: ["inclusive web page", "accessible website"],
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
      body: "Link the implementation guide and record validation evidence.",
      tags: ["practice"],
      reviewedAt: "2026-07-16",
      sources: [{ title: "Documentation reference", url: "https://example.com/docs" }],
      links: ["accessible-sites"],
    },
  ],
};

test("loadGuides and loadWiki isolate callers from canonical browser data", async () => {
  const guides = await loadGuides();
  const wiki = await loadWiki();
  const canonicalLength = wikiCorpusData.pages.length;
  assert.ok(canonicalLength > 0);
  assert.deepEqual(guides, wiki);

  guides.pages.push(library.pages[0]);
  assert.equal(wikiCorpusData.pages.length, canonicalLength);
  guides.pages[0].title = "mutated by caller";
  assert.notEqual(wikiCorpusData.pages[0].title, "mutated by caller");
});

test("guide search is deterministic, weighted, alias-aware, filterable, and bounded", () => {
  const first = searchGuides(library, "accessible website");
  const second = searchGuides(library, "accessible website");
  assert.equal(first[0]?.page.slug, "accessible-sites");
  assert.deepEqual(first, second);
  assert.equal(searchGuides(library, "inclusive web page")[0]?.page.slug, "accessible-sites");
  assert.deepEqual(searchGuides(library, "accessible website", { tags: ["publishing"] }), []);
  assert.equal(searchGuides(library, "website", { tags: ["web"], limit: 1 }).length, 1);
  assert.deepEqual(searchGuides(library, "  "), []);
  assert.deepEqual(searchGuides(library, "website", { limit: 0 }), []);
});

test("conversational intent words do not become route or completeness semantics", () => {
  const results = searchGuides(library, "I want help to build an accessible website.");

  assert.equal(results[0]?.page.slug, "accessible-sites");
  assert.deepEqual(results[0]?.matchedTerms, ["accessible", "website"]);
  assert.deepEqual(Object.keys(results[0]).sort(), ["matchedTerms", "page", "score"]);
});

test("legacy searchPages is a shape-compatible alias for guide search", () => {
  assert.deepEqual(
    searchPages(library, "web hosting", { tags: ["web"] }),
    searchGuides(library, "web hosting", { tags: ["web"] }),
  );
});

test("exact reads, backlinks, and related guides derive only from authored links", () => {
  assert.equal(getGuide(library, "choose-web-hosting")?.title, "Choose web hosting");
  assert.equal(getPage(library, "choose-web-hosting"), getGuide(library, "choose-web-hosting"));
  assert.equal(getGuide(library, "missing-guide"), undefined);
  assert.deepEqual(
    getGuideBacklinks(library, "accessible-sites").map((guide) => guide.slug),
    ["document-a-project"],
  );
  assert.deepEqual(getBacklinks(library, "accessible-sites"), getGuideBacklinks(library, "accessible-sites"));
  assert.deepEqual(
    getRelatedGuides(library, "accessible-sites").map((guide) => guide.slug),
    ["choose-web-hosting", "document-a-project"],
  );
  assert.deepEqual(getRelatedPages(library, "accessible-sites"), getRelatedGuides(library, "accessible-sites"));
  assert.deepEqual(getRelatedGuides(library, "missing-guide"), []);
});

test("browser-safe declarations prefer guides and expose no planner or route contract", async () => {
  const dataSource = await readFile(new URL("../dist/data.js", import.meta.url), "utf8");
  const generatedSource = await readFile(new URL("../dist/generated-data.js", import.meta.url), "utf8");
  const declarations = await readFile(new URL("../dist/types.d.ts", import.meta.url), "utf8");
  const runtimeDeclarations = await readFile(new URL("../dist/runtime.d.ts", import.meta.url), "utf8");
  assert.doesNotMatch(dataSource + generatedSource, /node:/);
  assert.match(declarations, /interface Guide\b/);
  assert.match(declarations, /type WikiPage = Guide/);
  assert.doesNotMatch(
    declarations + runtimeDeclarations,
    /KnowledgeGraph|KnowledgeNode|Recommendation|ProviderCapability|CapabilityRequirements|SearchAssessment|SearchRouteStatus|routeStatus|WikiPageKind|WikiPageRouteStatus|assessSearchResults|isOutcomeLikeQuery/,
  );
});
