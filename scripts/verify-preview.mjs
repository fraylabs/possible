import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { lstat, readFile, readdir, realpath, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { JSDOM } from "jsdom";

const repositoryRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const distDirectory = join(repositoryRoot, "apps", "web", "dist");
const manifestPath = join(repositoryRoot, "deployment", "preview-artifact.json");

const contentTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".md", "text/markdown; charset=utf-8"],
  [".map", "application/json; charset=utf-8"],
  [".txt", "text/plain; charset=utf-8"],
  [".xml", "application/xml; charset=utf-8"],
]);

export async function assertRealArtifactDirectory(directory, { allowMissing = false } = {}) {
  try {
    const metadata = await lstat(directory);
    if (metadata.isSymbolicLink() || !metadata.isDirectory()) {
      throw new Error(`Artifact directories must be real directories: ${directory}`);
    }
  } catch (error) {
    if (allowMissing && error?.code === "ENOENT") {
      return;
    }
    throw error;
  }
}

export async function listFiles(directory) {
  await assertRealArtifactDirectory(directory);
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const absolutePath = join(directory, entry.name);
    if (entry.isSymbolicLink()) {
      throw new Error(`Symbolic links are not allowed in the preview artifact: ${absolutePath}`);
    } else if (entry.isDirectory()) {
      files.push(...await listFiles(absolutePath));
    } else if (entry.isFile()) {
      files.push(absolutePath);
    } else {
      throw new Error(`Non-regular entries are not allowed in the preview artifact: ${absolutePath}`);
    }
  }

  return files.sort();
}

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

export async function describeArtifact(directory = distDirectory) {
  const absoluteFiles = await listFiles(directory);
  const files = [];

  for (const absolutePath of absoluteFiles) {
    const bytes = await readFile(absolutePath);
    files.push({
      path: relative(directory, absolutePath).split(sep).join("/"),
      bytes: bytes.byteLength,
      sha256: sha256(bytes),
    });
  }

  const canonical = files
    .map((file) => `${file.path}\0${file.bytes}\0${file.sha256}\n`)
    .join("");

  return {
    files,
    totalBytes: files.reduce((total, file) => total + file.bytes, 0),
    sha256: sha256(canonical),
  };
}

function sendStatus(response, statusCode, message) {
  response.statusCode = statusCode;
  response.setHeader("content-type", "text/plain; charset=utf-8");
  response.end(message);
}

async function regularFileWithin(candidate, rootDirectory) {
  try {
    const metadata = await lstat(candidate);
    if (metadata.isSymbolicLink() || !metadata.isFile()) {
      return null;
    }

    const [realRoot, realCandidate] = await Promise.all([
      realpath(rootDirectory),
      realpath(candidate),
    ]);
    const realRootPrefix = `${realRoot}${sep}`;
    if (!realCandidate.startsWith(realRootPrefix)) {
      return null;
    }

    return realCandidate;
  } catch {
    return null;
  }
}

export async function resolveRequestTarget(rawUrl, rootDirectory = distDirectory) {
  const parsed = new URL(rawUrl, "http://127.0.0.1");
  let pathname;

  try {
    pathname = decodeURIComponent(parsed.pathname);
  } catch {
    return { statusCode: 400 };
  }

  if (pathname.includes("\0") || pathname.split("/").includes("..")) {
    return { statusCode: 404 };
  }

  const relativePath = pathname.replace(/^\/+/, "");
  const resolvedRoot = resolve(rootDirectory);
  try {
    await assertRealArtifactDirectory(resolvedRoot);
  } catch {
    return { statusCode: 404 };
  }
  const candidate = resolve(resolvedRoot, relativePath || "index.html");
  const distPrefix = `${resolvedRoot}${sep}`;

  if (candidate !== resolvedRoot && !candidate.startsWith(distPrefix)) {
    return { statusCode: 404 };
  }

  const regularCandidate = await regularFileWithin(candidate, resolvedRoot);
  if (regularCandidate) {
    return { path: regularCandidate, statusCode: 200 };
  }

  if (extname(pathname) === "") {
    const fallback = await regularFileWithin(join(resolvedRoot, "index.html"), resolvedRoot);
    return fallback ? { path: fallback, statusCode: 200 } : { statusCode: 404 };
  }

  return { statusCode: 404 };
}

function createPreviewServer(rootDirectory = distDirectory) {
  return createServer(async (request, response) => {
    const target = await resolveRequestTarget(request.url ?? "/", rootDirectory);

    if (!target.path) {
      sendStatus(response, target.statusCode, "Not found");
      return;
    }

    response.statusCode = 200;
    response.setHeader(
      "content-type",
      contentTypes.get(extname(target.path)) ?? "application/octet-stream",
    );
    response.setHeader("cache-control", "no-store");
    createReadStream(target.path).pipe(response);
  });
}

async function listen(server) {
  await new Promise((resolveListen, rejectListen) => {
    server.once("error", rejectListen);
    server.listen(0, "127.0.0.1", resolveListen);
  });

  const address = server.address();
  assert(address && typeof address === "object", "Preview server did not bind to a TCP port.");
  return `http://127.0.0.1:${address.port}`;
}

async function close(server) {
  await new Promise((resolveClose, rejectClose) => {
    server.close((error) => error ? rejectClose(error) : resolveClose());
  });
}

async function requestBytes(url) {
  const response = await fetch(url, { redirect: "error" });
  return { response, bytes: Buffer.from(await response.arrayBuffer()) };
}

export function activeAssetReferences(indexHtml) {
  const document = new JSDOM(indexHtml).window.document;
  return {
    moduleScripts: [...document.querySelectorAll("script[src]")]
      .filter((element) => element.getAttribute("type") === "module")
      .map((element) => element.getAttribute("src")),
    stylesheets: [...document.querySelectorAll("link[href]")]
      .filter((element) => (element.getAttribute("rel") ?? "")
        .split(/\s+/)
        .some((token) => token.toLowerCase() === "stylesheet"))
      .map((element) => element.getAttribute("href")),
  };
}

async function verifyNotFound(url, label) {
  const response = await requestBytes(url);
  assert.equal(response.response.status, 404, `${label} must return HTTP 404.`);
  assert.equal(response.response.headers.get("content-type"), "text/plain; charset=utf-8");
  assert.equal(response.bytes.toString("utf8"), "Not found", `${label} returned an unsafe body.`);
}

const machineReadablePublicationFile = (path) =>
  path === "llms.txt"
  || path === "robots.txt"
  || path === "sitemap.xml"
  || (path.startsWith("wiki/") && path.endsWith(".json"))
  || path === "agent/protocol.json"
  || path === "agent/search.json"
  || /^agent\/(read|related)\/[^/]+\.json$/.test(path)
  || /^proof\/receipts\/(digital-photo-frame|robotic-arm)\.md$/.test(path);

async function verifyMachineReadableWiki(baseUrl, files) {
  const paths = new Set(files.map((file) => file.path));
  assert(paths.has("llms.txt"), "The preview artifact must publish llms.txt discovery guidance.");
  assert(paths.has("wiki/index.json"), "The preview artifact must publish the wiki JSON index.");

  const discovery = await requestBytes(`${baseUrl}/llms.txt`);
  const discoveryText = discovery.bytes.toString("utf8");
  assert.match(discoveryText, /Require schemaVersion 2/);
  assert.match(discoveryText, /\/agent\/protocol\.json/);
  assert.match(discoveryText, /\/agent\/search\.json/);
  assert.doesNotMatch(discoveryText, /https:\/\/possible\.sh\/(?:agent|wiki|llms)/);
  assert.match(discoveryText, /bundled guide index/i);
  assert.doesNotMatch(discoveryText, /\b(?:public|published)\b/i);

  for (const receiptPath of [
    "proof/receipts/digital-photo-frame.md",
    "proof/receipts/robotic-arm.md",
  ]) {
    const receipt = await requestBytes(`${baseUrl}/${receiptPath}`);
    assert.equal(receipt.response.status, 200);
    assert.doesNotMatch(receipt.bytes.toString("utf8"), /\b(?:public|published)\b/i);
  }

  const robots = await requestBytes(`${baseUrl}/robots.txt`);
  assert.match(robots.bytes.toString("utf8"), /^User-agent: \*\nDisallow: \/\n$/);
  assert(!paths.has("sitemap.xml"), "A not-published candidate must not advertise production URLs in a sitemap.");
  assert.match(discoveryText, /\/agent\/read\/\{slug\}\.json/);
  assert.match(discoveryText, /\/agent\/related\/\{slug\}\.json/);
  assert.match(discoveryText, /\/wiki\/index\.json/);
  assert.match(discoveryText, /\/wiki\/\{slug\}\.json/);

  const indexResponse = await requestBytes(`${baseUrl}/wiki/index.json`);
  assert.equal(indexResponse.response.status, 200);
  const index = JSON.parse(indexResponse.bytes.toString("utf8"));
  assert.equal(index.schemaVersion, 2);
  assert.equal(index.title, "Possible field guides");
  assert(Array.isArray(index.pages), "Wiki index pages must be an array.");
  assert(index.pages.length > 0, "The bundled wiki must contain pages.");
  assert.equal(index.pageCount, index.pages.length);
  assert.equal(index.guideCount, index.pages.length);

  const slugs = index.pages.map((page) => page.slug);
  assert.equal(new Set(slugs).size, slugs.length, "Bundled wiki slugs must be unique.");
  const expectedPageFiles = slugs.map((slug) => `wiki/${slug}.json`).sort();
  const actualPageFiles = files
    .map((file) => file.path)
    .filter((path) => path.startsWith("wiki/") && path !== "wiki/index.json")
    .sort();
  assert.deepEqual(actualPageFiles, expectedPageFiles, "Every indexed page needs one JSON representation.");

  const documents = [];
  for (const listing of index.pages) {
    assert.equal(listing.humanUrl, `/wiki/${listing.slug}`);
    assert.equal(listing.jsonUrl, `/wiki/${listing.slug}.json`);
    assert(Array.isArray(listing.sources) && listing.sources.length > 0);
    assert(Array.isArray(listing.links));

    const response = await requestBytes(`${baseUrl}${listing.jsonUrl}`);
    assert.equal(response.response.status, 200);
    const document = JSON.parse(response.bytes.toString("utf8"));
    assert.equal(document.schemaVersion, 2);
    assert.equal(document.humanUrl, listing.humanUrl);
    assert.equal(document.page.slug, listing.slug);
    assert.equal(document.page.title, listing.title);
    assert.equal(document.page.summary, listing.summary);
    assert.equal(document.page.reviewedAt, listing.reviewedAt);
    assert.deepEqual(document.page.sources, listing.sources);
    assert.deepEqual(document.page.links, listing.links);
    assert.equal(typeof document.page.body, "string");
    assert(document.page.body.trim().length > 0, `${listing.slug} needs readable page prose.`);
    assert(document.page.sources.every((source) => source.url.startsWith("https://")));
    assert(document.page.links.every((slug) => slugs.includes(slug)));
    assert(Array.isArray(document.backlinks));
    assert(Array.isArray(document.relatedPages));
    documents.push(document);
  }

  for (const document of documents) {
    const expectedBacklinks = documents
      .filter((candidate) => candidate.page.links.includes(document.page.slug))
      .map((candidate) => candidate.page.slug)
      .sort();
    const publishedBacklinks = document.backlinks.map((page) => page.slug).sort();
    assert.deepEqual(publishedBacklinks, expectedBacklinks, `${document.page.slug} backlinks drifted.`);

    const expectedRelated = [...new Set([
      ...document.page.links,
      ...expectedBacklinks,
    ])].filter((slug) => slug !== document.page.slug).sort();
    const publishedRelated = document.relatedPages.map((page) => page.slug).sort();
    assert.deepEqual(publishedRelated, expectedRelated, `${document.page.slug} related pages drifted.`);
  }

  const protocolResponse = await requestBytes(`${baseUrl}/agent/protocol.json`);
  assert.equal(protocolResponse.response.status, 200);
  const protocol = JSON.parse(protocolResponse.bytes.toString("utf8"));
  assert.equal(protocol.schemaVersion, 2);
  assert.equal(protocol.protocol, "possible-static-agent");
  assert.equal(protocol.static, true);
  assert.deepEqual(Object.keys(protocol.operations), ["search", "read", "related"]);
  assert.deepEqual(protocol.operations.search.request, { query: null, body: null });
  assert.match(protocol.operations.search.notes[0], /static search index/);
  assert.equal(protocol.operations.read.path, "/agent/read/{slug}.json");
  assert.equal(protocol.operations.related.path, "/agent/related/{slug}.json");
  assert.doesNotMatch(JSON.stringify(protocol.operations), /\b(?:public|published)\b/i);

  const searchResponse = await requestBytes(`${baseUrl}/agent/search.json`);
  assert.equal(searchResponse.response.status, 200);
  const search = JSON.parse(searchResponse.bytes.toString("utf8"));
  assert.equal(search.schemaVersion, 2);
  assert.equal(search.operation, "search");
  assert.equal(search.static, true);
  assert.deepEqual(search.request, {
    method: "GET",
    path: "/agent/search.json",
    query: null,
    body: null,
  });
  assert.equal(search.corpus.pageCount, index.pageCount);
  assert.equal(search.pages.length, index.pageCount);
  assert.equal(search.search.match, "all query terms");
  assert.deepEqual(search.search.interpretation, {
    results: "relevant-field-guides",
    links: "related-reading-not-ordered-steps",
    boundary: "consumer-owns-project-decisions-and-actions",
  });

  const canonicalPages = new Map(documents.map((document) => [document.page.slug, document]));
  const searchSlugs = new Set(search.pages.map((page) => page.slug));
  assert.deepEqual([...searchSlugs].sort(), slugs.sort(), "Search index pages drifted from wiki index.");
  for (const indexedPage of search.pages) {
    const canonical = canonicalPages.get(indexedPage.slug);
    assert(canonical, `Search index contains unknown page ${indexedPage.slug}.`);
    assert.deepEqual(indexedPage.sources, canonical.page.sources);
    assert.deepEqual(indexedPage.aliases, canonical.page.aliases ?? []);
    assert.equal(indexedPage.reviewedAt, canonical.page.reviewedAt);
    assert.deepEqual(indexedPage.searchFields, {
      title: canonical.page.title,
      slug: canonical.page.slug,
      aliases: (canonical.page.aliases ?? []).join(" "),
      tags: canonical.page.tags.join(" "),
      summary: canonical.page.summary,
      body: canonical.page.body,
      sourceTitles: canonical.page.sources.map((source) => source.title).join(" "),
    });
  }

  const expectedAgentFiles = [
    "agent/protocol.json",
    "agent/search.json",
    ...slugs.flatMap((slug) => [`agent/read/${slug}.json`, `agent/related/${slug}.json`]),
  ].sort();
  const actualAgentFiles = files
    .map((file) => file.path)
    .filter((path) => path.startsWith("agent/"))
    .sort();
  assert.deepEqual(actualAgentFiles, expectedAgentFiles, "Agent publication files drifted.");

  for (const slug of slugs) {
    const canonical = canonicalPages.get(slug);
    const read = JSON.parse((await requestBytes(`${baseUrl}/agent/read/${slug}.json`)).bytes.toString("utf8"));
    assert.equal(read.schemaVersion, 2);
    assert.equal(read.operation, "read");
    assert.equal(read.humanUrl, `/wiki/${slug}`);
    assert.deepEqual(read.page, canonical.page);
    assert.deepEqual(
      read.relatedPages.map((page) => page.slug).sort(),
      canonical.relatedPages.map((page) => page.slug).sort(),
    );

    const related = JSON.parse((await requestBytes(`${baseUrl}/agent/related/${slug}.json`)).bytes.toString("utf8"));
    assert.equal(related.schemaVersion, 2);
    assert.equal(related.operation, "related");
    assert.equal(related.slug, slug);
    assert.deepEqual(related.page.slug, slug);
    assert.deepEqual(
      related.relatedPages.map((page) => page.slug).sort(),
      canonical.relatedPages.map((page) => page.slug).sort(),
    );
  }
}

async function verifyRuntime(files, rootDirectory = distDirectory) {
  const server = createPreviewServer(rootDirectory);
  const baseUrl = await listen(server);

  try {
    const entrypoint = await requestBytes(`${baseUrl}/`);
    assert.equal(entrypoint.response.status, 200);
    assert.match(entrypoint.response.headers.get("content-type") ?? "", /^text\/html/);

    const expectedIndex = files.find((file) => file.path === "index.html");
    assert(expectedIndex, "The preview artifact must contain index.html.");
    assert.equal(sha256(entrypoint.bytes), expectedIndex.sha256);

    const indexHtml = entrypoint.bytes.toString("utf8");
    const references = activeAssetReferences(indexHtml);
    for (const file of files.filter((candidate) => candidate.path !== "index.html")) {
      const expectedPath = `/${file.path}`;
      if (file.path.endsWith(".js")) {
        assert(
          references.moduleScripts.includes(expectedPath),
          `index.html has no active module script for ${file.path}.`,
        );
      } else if (file.path.endsWith(".css")) {
        assert(
          references.stylesheets.includes(expectedPath),
          `index.html has no active stylesheet for ${file.path}.`,
        );
      } else if (!machineReadablePublicationFile(file.path)) {
        assert.fail(`No load-bearing HTML reference rule exists for ${file.path}.`);
      }
    }

    for (const file of files) {
      const served = await requestBytes(`${baseUrl}/${file.path}`);
      assert.equal(served.response.status, 200, `${file.path} did not return HTTP 200.`);
      const expectedContentType = contentTypes.get(extname(file.path)) ?? "application/octet-stream";
      assert.equal(
        served.response.headers.get("content-type"),
        expectedContentType,
        `${file.path} was served with the wrong content type.`,
      );
      assert.equal(served.bytes.byteLength, file.bytes, `${file.path} byte count changed in transit.`);
      assert.equal(sha256(served.bytes), file.sha256, `${file.path} hash changed in transit.`);
    }

    await verifyMachineReadableWiki(baseUrl, files);

    const route = await requestBytes(`${baseUrl}/wiki/web`);
    assert.equal(route.response.status, 200);
    assert.equal(sha256(route.bytes), expectedIndex.sha256, "SPA fallback did not return index.html.");

    await verifyNotFound(`${baseUrl}/assets/does-not-exist.js`, "Missing asset");
    await verifyNotFound(`${baseUrl}/..%2Fpackage.json`, "Encoded path traversal");
  } finally {
    await close(server);
  }
}

export async function verifyPreview() {
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  assert.equal(manifest.schemaVersion, 1);
  assert.equal(manifest.artifactDirectory, "apps/web/dist");
  assert.equal(manifest.buildCommand, "npm run preview:build");
  assert.equal(manifest.verificationCommand, "npm run preview:verify");
  assert.deepEqual(manifest.runtimeContract, {
    entrypoint: "index.html",
    spaFallback: true,
    sourceMapsPublished: false,
    machineReadableWiki: true,
    wikiIndex: "wiki/index.json",
    pageRepresentations: "wiki/<slug>.json",
    llmsDiscovery: "llms.txt",
    contentTypesVerified: true,
    symbolicLinksAllowed: false,
    artifactRootSymbolicLinkAllowed: false,
    missingAssetStatus: 404,
    pathTraversalStatus: 404,
  });
  const { artifactSha256, historicalProductionReceipt, ...publication } = manifest.publication;
  assert.deepEqual(publication, {
    state: "not-published",
    allowedNextAction: "Explicit authorization to publish this exact candidate artifact",
    requiresSeparateApproval: [
      "provider authentication or credential-scope changes",
      "production publication or DNS changes",
      "cost or paid-plan changes",
      "quotes, purchases, orders, and fabrication",
    ],
  });
  assert.equal(artifactSha256, manifest.sha256, "Candidate digest must match the reviewed artifact.");
  assert.deepEqual(historicalProductionReceipt, {
    primaryUrl: "https://possible.sh",
    alternateUrl: "https://www.possible.sh",
    provider: "Vercel",
    dnsProvider: "Cloudflare",
    sourceRepository: "https://github.com/fraylabs/possible",
    publishedAt: "2026-07-18",
    artifactSha256: "57945bd9ed262d2cf4d411c9787394cee1d1f76282d111268adc68fe9010117f",
    verificationReceipt: "deployment/PRODUCTION.md",
  });
  const historicalReceipt = await readFile(
    resolve(repositoryRoot, historicalProductionReceipt.verificationReceipt),
    "utf8",
  );
  assert(
    historicalReceipt.includes(historicalProductionReceipt.artifactSha256),
    "The historical production digest must appear in its cited verification receipt.",
  );

  const actual = await describeArtifact();
  assert(
    actual.files.every((file) => !file.path.endsWith(".map")),
    "The public preview artifact must not publish source maps.",
  );
  assert.deepEqual(actual.files, manifest.files, "Built preview files do not match the reviewed manifest.");
  assert.equal(actual.totalBytes, manifest.totalBytes, "Preview artifact byte count changed.");
  assert.equal(actual.sha256, manifest.sha256, "Preview artifact digest changed.");
  await verifyRuntime(actual.files);

  console.log(
    `Verified local candidate artifact ${actual.sha256}: ${actual.files.length} regular files, `
    + `${actual.totalBytes} bytes, exact bytes and content types, SPA fallback, generated page JSON, `
    + "no links or public source maps, and safe negative routes.",
  );
}

export async function recordPreview() {
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  const actual = await describeArtifact();
  const next = {
    ...manifest,
    sha256: actual.sha256,
    totalBytes: actual.totalBytes,
    files: actual.files,
    publication: {
      state: "not-published",
      artifactSha256: actual.sha256,
      allowedNextAction: "Explicit authorization to publish this exact candidate artifact",
      requiresSeparateApproval: [
        "provider authentication or credential-scope changes",
        "production publication or DNS changes",
        "cost or paid-plan changes",
        "quotes, purchases, orders, and fabrication",
      ],
      historicalProductionReceipt: manifest.publication.historicalProductionReceipt,
    },
  };
  await writeFile(manifestPath, `${JSON.stringify(next, null, 2)}\n`);
  console.log(`Recorded preview artifact ${actual.sha256} with ${actual.files.length} files.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  if (process.argv[2] === "--preflight") {
    await assertRealArtifactDirectory(distDirectory, { allowMissing: true });
    console.log("Preview artifact root is absent or a real directory; build preflight passed.");
  } else if (process.argv[2] === "--record") {
    await recordPreview();
  } else {
    await verifyPreview();
  }
}
