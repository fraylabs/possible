import { execFile } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { promisify } from "node:util";
import { discoverLocalOutcomes } from "./outcome-format.mjs";
import { discoverOutcomeSource } from "./sources.mjs";

const execFileAsync = promisify(execFile);
const SAFE_SLUG = /^[a-z0-9][a-z0-9-]*$/;
const DEFAULT_PUBLISH_ENDPOINT = "https://reminiscent-lark-333.convex.site/api/outcomes/register";

export async function createOutcome(slug, { directory = process.cwd(), primary } = {}) {
  if (!SAFE_SLUG.test(slug ?? "")) throw new Error("Outcome slug must be lowercase and hyphenated");
  if (!primary) throw new Error("Choose one primary attribution with --product or --skill");
  const root = resolve(directory);
  const indexPath = join(root, "outcomes.json");
  let publisherIndex = {
    schemaVersion: 1,
    publisher: { name: "Replace with publisher name", url: "https://example.com" },
    outcomes: [],
  };
  try {
    publisherIndex = JSON.parse(await readFile(indexPath, "utf8"));
    if (publisherIndex.schemaVersion !== 1 || !Array.isArray(publisherIndex.outcomes)) throw new Error("outcomes.json must be a publisher index with schemaVersion 1");
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }
  const folder = join(root, "outcomes", slug);
  await mkdir(join(folder, "media"), { recursive: true });
  const manifestPath = join(folder, "outcome.json");
  const manifest = {
    schemaVersion: 4,
    slug,
    files: { about: "outcome.md", prompt: "prompt.md" },
    authoredAt: null,
    author: { name: "Replace with publisher name", url: "https://example.com" },
    models: [{ provider: "Replace with provider", model: "Replace with model", role: "execution" }],
    requirements: [],
    primary,
  };
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, { flag: "wx" });
  await writeFile(join(folder, "outcome.md"), `# Replace with Outcome name\n\nDescribe the concrete result in one clear opening paragraph.\n`, { flag: "wx" });
  await writeFile(join(folder, "prompt.md"), "Replace this line with the exact reusable execution prompt.\n", { flag: "wx" });
  const entry = { slug, url: `./outcomes/${slug}/outcome.json` };
  publisherIndex.outcomes = [...publisherIndex.outcomes.filter((outcome) => outcome?.slug !== slug), entry]
    .sort((left, right) => String(left.slug).localeCompare(String(right.slug)));
  await writeFile(indexPath, `${JSON.stringify(publisherIndex, null, 2)}\n`);
  return folder;
}

export async function validateOutcomes(directory = process.cwd()) {
  const root = resolve(directory);
  const outcomes = await discoverLocalOutcomes(root);
  const indexPath = join(root, "outcomes.json");
  let publisherIndex;
  try { publisherIndex = JSON.parse(await readFile(indexPath, "utf8")); }
  catch (error) {
    if (error?.code === "ENOENT") throw new Error("outcomes.json is required at the publisher repository root");
    throw error;
  }
  if (publisherIndex?.schemaVersion !== 1 || !Array.isArray(publisherIndex.outcomes) || publisherIndex.outcomes.length === 0) throw new Error("outcomes.json must be a non-empty publisher index with schemaVersion 1");
  if (!publisherIndex.publisher || typeof publisherIndex.publisher.name !== "string" || !publisherIndex.publisher.name.trim()) throw new Error("outcomes.json requires publisher.name");
  try {
    if (new URL(publisherIndex.publisher.url).protocol !== "https:") throw new Error();
  } catch { throw new Error("outcomes.json requires an HTTPS publisher.url"); }
  const indexed = new Map();
  for (const [position, entry] of publisherIndex.outcomes.entries()) {
    if (!entry || typeof entry.slug !== "string" || !SAFE_SLUG.test(entry.slug)) throw new Error(`outcomes.json outcomes[${position}].slug is invalid`);
    const expectedUrl = `./outcomes/${entry.slug}/outcome.json`;
    if (entry.url !== expectedUrl) throw new Error(`outcomes.json outcomes[${position}].url must be ${expectedUrl}`);
    if (indexed.has(entry.slug)) throw new Error(`outcomes.json contains duplicate slug ${entry.slug}`);
    indexed.set(entry.slug, entry);
  }
  const discovered = new Set(outcomes.map(({ slug }) => slug));
  for (const slug of indexed.keys()) if (!discovered.has(slug)) throw new Error(`outcomes.json references missing Outcome ${slug}`);
  for (const slug of discovered) if (!indexed.has(slug)) throw new Error(`outcomes.json does not list Outcome ${slug}`);
  return { count: outcomes.length, outcomes };
}

async function gitOutput(directory, args) {
  const result = await execFileAsync("git", args, { cwd: directory, encoding: "utf8" });
  return result.stdout.trim();
}

export async function inferGitHubSource(directory = process.cwd()) {
  const root = await gitOutput(directory, ["rev-parse", "--show-toplevel"]);
  const dirty = await gitOutput(root, ["status", "--porcelain"]);
  if (dirty) throw new Error("Commit the Outcome files before publishing so Possible can snapshot an exact public revision");
  const remote = await gitOutput(root, ["remote", "get-url", "origin"]);
  const match = remote.match(/github\.com[/:]([^/]+)\/([^/]+?)(?:\.git)?$/);
  if (!match) throw new Error("The repository origin must be a public GitHub repository");
  return `${match[1]}/${match[2]}`;
}

export async function addOutcomeSource(source, { directory = process.cwd(), fetchOptions } = {}) {
  const discovery = await discoverOutcomeSource(source, fetchOptions);
  const possibleDirectory = join(directory, ".possible");
  const sourcesPath = join(possibleDirectory, "sources.json");
  await mkdir(possibleDirectory, { recursive: true });
  let current = { schemaVersion: 1, sources: [] };
  try { current = JSON.parse(await readFile(sourcesPath, "utf8")); } catch (error) { if (error?.code !== "ENOENT") throw error; }
  const nextSource = { type: discovery.type, locator: discovery.locator, installUrl: discovery.installUrl, revision: discovery.revision };
  const sources = [...(Array.isArray(current.sources) ? current.sources : []).filter((entry) => !(entry.type === nextSource.type && entry.locator === nextSource.locator)), nextSource]
    .sort((left, right) => left.locator.localeCompare(right.locator));
  await writeFile(sourcesPath, `${JSON.stringify({ schemaVersion: 1, sources }, null, 2)}\n`);
  return { discovery, sourcesPath };
}

function splitUseReference(reference) {
  const separator = reference.lastIndexOf("@");
  if (separator <= 0 || separator === reference.length - 1) throw new Error("Use an Outcome as <source>@<slug>");
  return { source: reference.slice(0, separator), slug: reference.slice(separator + 1) };
}

export async function useOutcome(reference, { fetchOptions } = {}) {
  const { source, slug } = splitUseReference(reference);
  const discovery = await discoverOutcomeSource(source, fetchOptions);
  const outcome = discovery.outcomes.find((entry) => entry.slug === slug);
  if (!outcome) throw new Error(`${source} does not publish an Outcome named ${slug}`);
  return { discovery, outcome };
}

export async function publishOutcomeSource(source, { directory = process.cwd(), endpoint = process.env.POSSIBLE_PUBLISH_URL ?? DEFAULT_PUBLISH_ENDPOINT } = {}) {
  const resolvedSource = source || await inferGitHubSource(directory);
  if (!source) await validateOutcomes(directory);
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify({ source: resolvedSource }),
  });
  const body = await response.text();
  if (!response.ok) throw new Error(`Possible publishing returned HTTP ${response.status}${body ? `: ${body}` : ""}`);
  let result = {};
  try { result = body ? JSON.parse(body) : {}; } catch { result = { message: body }; }
  return { source: resolvedSource, result };
}
