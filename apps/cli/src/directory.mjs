import { createHash, randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";

const DEFAULT_ENDPOINT = "https://reminiscent-lark-333.eu-west-1.convex.site/api/outcomes";

const directoryEndpoint = () => process.env.POSSIBLE_DIRECTORY_ENDPOINT?.trim() || DEFAULT_ENDPOINT;

async function requestDirectory(parameters, fetchImplementation = fetch) {
  const url = new URL(directoryEndpoint());
  for (const [name, value] of Object.entries(parameters)) url.searchParams.set(name, value);
  const response = await fetchImplementation(url, { headers: { accept: "application/json" } });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || `Possible directory returned HTTP ${response.status}`);
  return body;
}

function installationPath(environment = process.env) {
  const home = environment.POSSIBLE_HOME ? resolve(environment.POSSIBLE_HOME) : join(homedir(), ".possible");
  return join(home, "installation.json");
}

async function installationToken(environment = process.env) {
  const path = installationPath(environment);
  try {
    const stored = JSON.parse(await readFile(path, "utf8"));
    if (stored?.schemaVersion === 1 && typeof stored.id === "string") return stored.id;
  } catch (error) {
    if (error?.code !== "ENOENT" && !(error instanceof SyntaxError)) return undefined;
  }
  const id = randomUUID();
  try {
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, `${JSON.stringify({ schemaVersion: 1, id }, null, 2)}\n`, { flag: "wx" });
    return id;
  } catch (error) {
    if (error?.code === "EEXIST") return installationToken(environment);
    return undefined;
  }
}

async function recordUse(outcomeId, { fetchImplementation = fetch, environment = process.env } = {}) {
  if (environment.CI || environment.POSSIBLE_TELEMETRY === "0") return;
  const token = await installationToken(environment);
  if (!token) return;
  const endpoint = new URL(directoryEndpoint());
  endpoint.pathname = `${endpoint.pathname.replace(/\/$/, "")}/use`;
  endpoint.search = "";
  try {
    await fetchImplementation(endpoint, {
      method: "POST",
      headers: { "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify({
        outcomeId,
        visitorHash: createHash("sha256").update(token).digest("hex"),
        source: "cli",
        ci: false,
      }),
    });
  } catch {
    // Usage reporting never blocks access to a published prompt.
  }
}

export async function searchOutcomes(query, options = {}) {
  const normalized = String(query ?? "").trim();
  if (!normalized) throw new Error("Search requires an ordinary-language query");
  const body = await requestDirectory({ q: normalized, limit: "5" }, options.fetchImplementation);
  return Array.isArray(body.outcomes) ? body.outcomes : [];
}

export async function fetchOutcome(id, options = {}) {
  const normalized = String(id ?? "").trim();
  if (!normalized) throw new Error("Fetch requires an Outcome ID from search results");
  const body = await requestDirectory({ id: normalized }, options.fetchImplementation);
  if (!body.outcome || typeof body.outcome.prompt !== "string") throw new Error("Possible returned an invalid Outcome");
  await recordUse(body.outcome.id, options);
  return body.outcome;
}

export function formatSearchResults(outcomes) {
  if (!outcomes.length) return "No matching Outcomes found.\n";
  return `${outcomes.map((outcome, index) => [
    `${index + 1}. ${outcome.title}`,
    `   ${outcome.summary}`,
    ...(outcome.primary_attribution ? [`   Primary: ${outcome.primary_attribution.kind === "product" ? outcome.primary_attribution.id : `${outcome.primary_attribution.repository}/${outcome.primary_attribution.directory}`}`] : []),
    `   ID: ${outcome.id}`,
    `   Source: ${outcome.source_locator}`,
  ].join("\n")).join("\n\n")}\n`;
}
