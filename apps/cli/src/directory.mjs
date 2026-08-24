const DEFAULT_ENDPOINT = "https://abutwsaahahtbtlopczi.supabase.co/functions/v1/outcome-directory";

const directoryEndpoint = () => process.env.POSSIBLE_DIRECTORY_ENDPOINT?.trim() || DEFAULT_ENDPOINT;

async function requestDirectory(parameters, fetchImplementation = fetch) {
  const url = new URL(directoryEndpoint());
  for (const [name, value] of Object.entries(parameters)) url.searchParams.set(name, value);
  const response = await fetchImplementation(url, { headers: { accept: "application/json" } });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || `Possible directory returned HTTP ${response.status}`);
  return body;
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
  return body.outcome;
}

export function formatSearchResults(outcomes) {
  if (!outcomes.length) return "No matching Outcomes found.\n";
  return `${outcomes.map((outcome, index) => [
    `${index + 1}. ${outcome.title}`,
    `   ${outcome.summary}`,
    `   ID: ${outcome.id}`,
    `   Source: ${outcome.source_locator}`,
  ].join("\n")).join("\n\n")}\n`;
}
