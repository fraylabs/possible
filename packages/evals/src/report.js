import { REPORT_SCHEMA_VERSION } from "./constants.js";
import { scorePair } from "./score.js";

export function createEvaluationReport(dataset) {
  const pairReports = dataset.pairs.map((pair) => scorePair(pair));
  const coveredScenarioIds = new Set(
    pairReports.map((pair) => pair.scenarioId),
  );
  const pendingScenarioIds = [...dataset.locked.scenarios.keys()].filter(
    (scenarioId) => !coveredScenarioIds.has(scenarioId),
  );
  const sourceFiles = dataset.runs
    .flatMap((run) => [
      {
        kind: "receipt",
        path: run.source.receiptRelativePath,
        sha256: run.source.receiptDigest,
      },
      {
        kind: "transcript",
        path: run.source.transcriptRelativePath,
        sha256: run.source.transcriptDigest,
      },
    ])
    .sort((left, right) => left.path.localeCompare(right.path));

  return {
    schemaVersion: REPORT_SCHEMA_VERSION,
    status: pairReports.length === 0 ? "pending-real-runs" : "scored",
    scenarioSet: {
      id: dataset.locked.manifest.setId,
      manifestSha256: dataset.locked.manifestDigest,
      scenarioCount: dataset.locked.scenarios.size,
      scenarioDigests: Object.fromEntries(
        [...dataset.locked.scenarios.entries()]
          .sort(([left], [right]) => left.localeCompare(right))
          .map(([id, scenario]) => [id, scenario.digest]),
      ),
    },
    runPolicy: {
      productionRunKind: "real-agent-run",
      fixturesAreProductionEvidence: false,
      namedToolsScoreDirectly: false,
      positiveDeltaMeaning: "Possible arm improved the measured metric",
    },
    sourceFiles,
    pendingScenarioIds,
    pairs: pairReports,
  };
}
