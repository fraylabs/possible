import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { lstat, readFile, readdir, realpath } from "node:fs/promises";
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
  [".map", "application/json; charset=utf-8"],
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
      } else {
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

    const route = await requestBytes(`${baseUrl}/knowledge/web`);
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
    contentTypesVerified: true,
    symbolicLinksAllowed: false,
    artifactRootSymbolicLinkAllowed: false,
    missingAssetStatus: 404,
    pathTraversalStatus: 404,
  });
  assert.deepEqual(manifest.publication, {
    state: "production",
    primaryUrl: "https://possible.sh",
    alternateUrl: "https://www.possible.sh",
    provider: "Vercel",
    dnsProvider: "Cloudflare",
    sourceRepository: "https://github.com/fraylabs/possible",
    publishedAt: "2026-07-17",
    artifactSha256: "8b8165a9e7cdcc6999ea99e4c52457da706650ff3f50ed3d46f280688dbf6c95",
    verificationReceipt: "deployment/PRODUCTION.md",
    remainingApprovalBoundaries: [
      "cost or paid-plan changes",
      "credential disclosure or scope expansion",
      "provider, DNS, or production changes beyond the recorded configuration",
      "quotes, purchases, orders, and fabrication",
    ],
  });

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
    `Verified production preview artifact ${actual.sha256}: ${actual.files.length} regular files, `
    + `${actual.totalBytes} bytes, exact bytes and content types, SPA fallback, no links or public `
    + "source maps, and safe negative routes.",
  );
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  if (process.argv[2] === "--preflight") {
    await assertRealArtifactDirectory(distDirectory, { allowMissing: true });
    console.log("Preview artifact root is absent or a real directory; build preflight passed.");
  } else {
    await verifyPreview();
  }
}
