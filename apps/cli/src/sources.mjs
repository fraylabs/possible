import { assertVisibleText } from "./text-safety.mjs";
import { createHash } from "node:crypto";
import { isIP } from "node:net";
import { parseOutcomeMarkdown, validateOutcomeManifest } from "./outcome-format.mjs";
import { verifyCaptureReview } from "./capture-integrity.mjs";

const MAX_OUTCOMES = 100;
const MAX_DOCUMENT_BYTES = 1024 * 1024;
const GITHUB_SHORTHAND = /^([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)$/;

function privateHostname(value) {
  const hostname = value.toLowerCase().replace(/^\[|\]$/g, "");
  if (hostname === "localhost" || hostname.endsWith(".localhost") || hostname.endsWith(".local")) return true;
  if (isIP(hostname) === 4) {
    const [first, second] = hostname.split(".").map(Number);
    return first === 0 || first === 10 || first === 127 || first >= 224
      || (first === 100 && second >= 64 && second <= 127)
      || (first === 169 && second === 254)
      || (first === 172 && second >= 16 && second <= 31)
      || (first === 192 && second === 168)
      || (first === 198 && (second === 18 || second === 19));
  }
  if (isIP(hostname) === 6) return hostname === "::" || hostname === "::1" || /^(?:fc|fd|fe[89ab])/i.test(hostname) || /^::ffff:(?:0\.|10\.|127\.|169\.254\.|172\.(?:1[6-9]|2\d|3[01])\.|192\.168\.)/.test(hostname);
  return false;
}

function normalizedBaseUrl(value) {
  const url = new URL(value);
  if (url.protocol !== "https:") throw new Error("Publisher domains must use HTTPS");
  url.hash = "";
  url.search = "";
  url.pathname = url.pathname.replace(/\/+$/, "");
  return url;
}

export function parseOutcomeSource(value) {
  const source = String(value ?? "").trim();
  const shorthand = source.match(GITHUB_SHORTHAND);
  if (shorthand) {
    const owner = shorthand[1];
    const repository = shorthand[2].replace(/\.git$/, "");
    return { type: "github", locator: `${owner}/${repository}`, installUrl: `https://github.com/${owner}/${repository}` };
  }
  let url;
  try { url = new URL(source); } catch { throw new Error("Source must be a GitHub owner/repository or an HTTPS publisher URL"); }
  if (url.hostname.toLowerCase() === "github.com") {
    const [owner, repository] = url.pathname.replace(/^\/+|\/+$/g, "").split("/");
    if (!owner || !repository) throw new Error("GitHub sources must identify an owner and repository");
    const cleanRepository = repository.replace(/\.git$/, "");
    return { type: "github", locator: `${owner}/${cleanRepository}`, installUrl: `https://github.com/${owner}/${cleanRepository}` };
  }
  if (privateHostname(url.hostname)) throw new Error("Publisher source cannot use a local or private network address");
  const base = normalizedBaseUrl(url.toString());
  return { type: "well-known", locator: base.origin, installUrl: base.toString() };
}

async function responseText(response, context) {
  if (!response.ok) throw new Error(`${context} returned HTTP ${response.status}`);
  const declared = Number(response.headers.get("content-length") ?? 0);
  if (declared > MAX_DOCUMENT_BYTES) throw new Error(`${context} exceeds the 1 MiB document limit`);
  const text = await response.text();
  if (Buffer.byteLength(text) > MAX_DOCUMENT_BYTES) throw new Error(`${context} exceeds the 1 MiB document limit`);
  return text;
}

async function fetchJson(url, context, headers = {}) {
  const response = await fetch(url, { headers: { accept: "application/json", ...headers }, redirect: "error" });
  return JSON.parse(await responseText(response, context));
}

async function fetchText(url, context, headers = {}) {
  const response = await fetch(url, { headers: { accept: "text/markdown,text/plain;q=0.9", ...headers }, redirect: "error" });
  return responseText(response, context);
}

const digestDocuments = ({ manifestText, aboutText, promptText }) => `sha256:${createHash("sha256").update(manifestText).update("\0").update(aboutText).update("\0").update(promptText).digest("hex")}`;

function resolvedRemoteOutcome({ manifestText, aboutText, promptText, manifestUrl, aboutUrl, promptUrl, repositoryPath }) {
  const manifest = validateOutcomeManifest(JSON.parse(manifestText), `${manifestUrl}`);
  const about = parseOutcomeMarkdown(aboutText, `${aboutUrl}`);
  const prompt = promptText.trim();
  if (!prompt) throw new Error(`${promptUrl} must contain the exact execution prompt`);
  assertVisibleText(prompt);
  verifyCaptureReview(manifest, aboutText, promptText);
  return {
    slug: manifest.slug,
    title: about.title,
    summary: about.summary,
    aboutMarkdown: about.markdown,
    prompt,
    manifest,
    manifestUrl,
    aboutUrl,
    promptUrl,
    repositoryPath,
    contentHash: digestDocuments({ manifestText, aboutText, promptText }),
  };
}

// Reads HEAD from git smart HTTP; GitHub answers 401 for private or missing
// repositories, so success also establishes that the repository is public.
async function gitHeadRevision(locator) {
  const response = await fetch(`https://github.com/${locator}.git/info/refs?service=git-upload-pack`, { headers: { "user-agent": "possible-cli" }, redirect: "error" });
  if (response.status === 401 || response.status === 404) throw new Error(`${locator} is not a public GitHub repository`);
  const text = await responseText(response, `GitHub refs ${locator}`);
  const match = text.match(/([0-9a-f]{40}) HEAD\0/);
  if (!match) throw new Error(`GitHub did not return an exact revision for ${locator}`);
  return match[1];
}

async function discoverGitHub(source, options) {
  const headers = { "user-agent": "possible-cli" };
  const token = options.githubToken ?? process.env.GITHUB_TOKEN ?? process.env.GH_TOKEN;
  if (token) headers.authorization = `Bearer ${token}`;
  let revision;
  try {
    const repository = await fetchJson(`https://api.github.com/repos/${source.locator}`, `GitHub repository ${source.locator}`, headers);
    if (repository.private !== false) throw new Error(`${source.locator} is not a public GitHub repository`);
    const revisionRecord = await fetchJson(`https://api.github.com/repos/${source.locator}/commits/${encodeURIComponent(repository.default_branch)}`, `GitHub revision ${source.locator}`, headers);
    revision = String(revisionRecord.sha ?? "");
  } catch (error) {
    // Anonymous API calls share a small per-address limit on hosted servers.
    // Git's own HTTP endpoint answers for public repositories without it.
    if (!/returned HTTP (?:403|429)$/.test(error.message)) throw error;
    revision = await gitHeadRevision(source.locator);
  }
  if (!/^[0-9a-f]{40}$/.test(revision)) throw new Error(`GitHub did not return an exact revision for ${source.locator}`);
  const rawBase = `https://raw.githubusercontent.com/${source.locator}/${revision}/`;
  const indexUrl = new URL("outcomes.json", rawBase).toString();
  const index = await fetchJson(indexUrl, `${source.locator}/outcomes.json`, headers);
  if (index?.schemaVersion !== 1 || !Array.isArray(index.outcomes)) throw new Error(`${source.locator}/outcomes.json must be a Possible publisher index with schemaVersion 1`);
  if (index.outcomes.length === 0 || index.outcomes.length > MAX_OUTCOMES) throw new Error(`${source.locator}/outcomes.json must list between 1 and ${MAX_OUTCOMES} Outcomes`);
  const outcomes = [];
  for (const [indexPosition, entry] of index.outcomes.entries()) {
    if (!entry || typeof entry !== "object" || typeof entry.url !== "string") throw new Error(`${source.locator}/outcomes.json outcomes[${indexPosition}] must contain a URL`);
    const manifestUrl = new URL(entry.url, indexUrl);
    if (manifestUrl.origin !== new URL(rawBase).origin || !manifestUrl.pathname.startsWith(new URL(rawBase).pathname)) throw new Error(`${source.locator}/outcomes.json Outcome URLs must stay inside the exact repository revision`);
    const folderUrl = new URL("./", manifestUrl);
    const aboutUrl = new URL("outcome.md", folderUrl).toString();
    const promptUrl = new URL("prompt.md", folderUrl).toString();
    const [manifestText, aboutText, promptText] = await Promise.all([
      fetchText(manifestUrl.toString(), `Outcome manifest ${manifestUrl}`, headers),
      fetchText(aboutUrl, `Outcome page ${aboutUrl}`, headers),
      fetchText(promptUrl, `Outcome prompt ${promptUrl}`, headers),
    ]);
    const repositoryPath = decodeURIComponent(manifestUrl.pathname.slice(new URL(rawBase).pathname.length)).replace(/\/outcome\.json$/, "");
    const outcome = resolvedRemoteOutcome({ manifestText, aboutText, promptText, manifestUrl: manifestUrl.toString(), aboutUrl, promptUrl, repositoryPath });
    if (entry.slug !== undefined && entry.slug !== outcome.slug) throw new Error(`${source.locator}/outcomes.json slug does not match ${manifestUrl}`);
    if (outcome.slug !== repositoryPath.split("/").filter(Boolean).at(-1)) throw new Error(`${manifestUrl} slug must match its folder name`);
    outcomes.push(outcome);
  }
  if (new Set(outcomes.map(({ slug }) => slug)).size !== outcomes.length) throw new Error(`${source.locator}/outcomes.json contains duplicate Outcome slugs`);
  return { ...source, revision, publisherName: index.publisher?.name ?? source.locator.split("/")[0], outcomes };
}

async function discoverWellKnown(source) {
  const indexUrl = new URL("/.well-known/possible/outcomes.json", source.locator).toString();
  const index = await fetchJson(indexUrl, `Possible index ${indexUrl}`);
  if (index?.schemaVersion !== 1 || !Array.isArray(index.outcomes)) throw new Error(`${indexUrl} must be a Possible publisher index with schemaVersion 1`);
  if (index.outcomes.length === 0 || index.outcomes.length > MAX_OUTCOMES) throw new Error(`${indexUrl} must list between 1 and ${MAX_OUTCOMES} Outcomes`);
  const outcomes = [];
  for (const [indexPosition, entry] of index.outcomes.entries()) {
    if (!entry || typeof entry !== "object" || typeof entry.url !== "string") throw new Error(`${indexUrl} outcomes[${indexPosition}] must contain a URL`);
    const manifestUrl = new URL(entry.url, indexUrl);
    if (manifestUrl.protocol !== "https:" || manifestUrl.origin !== new URL(source.locator).origin) throw new Error(`${indexUrl} Outcome URLs must stay on the publisher origin`);
    const folderUrl = new URL("./", manifestUrl);
    const aboutUrl = new URL("outcome.md", folderUrl).toString();
    const promptUrl = new URL("prompt.md", folderUrl).toString();
    const [manifestText, aboutText, promptText] = await Promise.all([
      fetchText(manifestUrl.toString(), `Outcome manifest ${manifestUrl}`),
      fetchText(aboutUrl, `Outcome page ${aboutUrl}`),
      fetchText(promptUrl, `Outcome prompt ${promptUrl}`),
    ]);
    const outcome = resolvedRemoteOutcome({ manifestText, aboutText, promptText, manifestUrl: manifestUrl.toString(), aboutUrl, promptUrl });
    if (entry.slug !== undefined && entry.slug !== outcome.slug) throw new Error(`${indexUrl} slug does not match ${manifestUrl}`);
    outcomes.push(outcome);
  }
  if (new Set(outcomes.map(({ slug }) => slug)).size !== outcomes.length) throw new Error(`${indexUrl} contains duplicate Outcome slugs`);
  const revision = `sha256:${createHash("sha256").update(outcomes.map(({ contentHash }) => contentHash).sort().join("\n")).digest("hex")}`;
  return { ...source, revision, publisherName: index.publisher?.name ?? new URL(source.locator).hostname, outcomes };
}

export async function discoverOutcomeSource(value, options = {}) {
  const source = typeof value === "string" ? parseOutcomeSource(value) : value;
  return source.type === "github" ? discoverGitHub(source, options) : discoverWellKnown(source);
}

export function publicSnapshot(discovery) {
  return {
    schemaVersion: 1,
    source: { type: discovery.type, locator: discovery.locator, installUrl: discovery.installUrl, revision: discovery.revision },
    publisherName: discovery.publisherName,
    outcomes: discovery.outcomes.map(({ slug, title, summary, aboutMarkdown, prompt, manifest, manifestUrl, aboutUrl, promptUrl, repositoryPath, contentHash }) => ({
      slug, title, summary, aboutMarkdown, prompt, manifest, manifestUrl, aboutUrl, promptUrl, repositoryPath, contentHash,
    })),
  };
}
