export type OutcomeSource = {
  type: "github" | "well-known";
  locator: string;
  installUrl: string;
};

export type DiscoveredOutcome = {
  slug: string;
  title: string;
  summary: string;
  aboutMarkdown: string;
  prompt: string;
  manifest: Record<string, unknown>;
  manifestUrl: string;
  aboutUrl: string;
  promptUrl: string;
  repositoryPath?: string;
  contentHash: string;
};

export type OutcomeDiscovery = OutcomeSource & {
  revision: string;
  publisherName: string;
  outcomes: DiscoveredOutcome[];
};

export type PublicOutcomeSnapshot = {
  schemaVersion: 1;
  source: OutcomeSource & { revision: string };
  publisherName: string;
  outcomes: DiscoveredOutcome[];
};

export function parseOutcomeSource(value: string): OutcomeSource;
export function discoverOutcomeSource(value: string | OutcomeSource, options?: { githubToken?: string }): Promise<OutcomeDiscovery>;
export function publicSnapshot(discovery: OutcomeDiscovery): PublicOutcomeSnapshot;
