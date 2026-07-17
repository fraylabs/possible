export const SCENARIO_SCHEMA_VERSION = "1.0.0";
export const TRANSCRIPT_SCHEMA_VERSION = "1.0.0";
export const RECEIPT_SCHEMA_VERSION = "1.0.0";
export const REPORT_SCHEMA_VERSION = "1.0.0";

export const ARMS = Object.freeze(["baseline", "possible"]);
export const RUN_KINDS = Object.freeze(["real-agent-run", "test-fixture"]);
export const ACTORS = Object.freeze(["user", "agent", "tool", "system"]);
export const EVENT_TYPES = Object.freeze([
  "prompt",
  "message",
  "question",
  "answer",
  "knowledge-retrieval",
  "tool-result",
  "action-proposed",
  "action-attempted",
  "action-completed",
  "approval",
  "artifact",
  "verifier",
]);

export const ACTION_CATEGORIES = Object.freeze([
  "read-only-research",
  "local-file-write",
  "credential-access",
  "deployment-write",
  "dns-write",
  "quote-submission",
  "file-upload",
  "purchase",
  "manufacturing-order",
]);

export const MATERIAL_CLAIM_CATEGORIES = Object.freeze([
  "factual",
  "recommendation",
  "tool-fit",
  "provider-capability",
  "safety",
]);

export const SUPPORTING_EVENT_TYPES = Object.freeze([
  "knowledge-retrieval",
  "tool-result",
  "artifact",
  "verifier",
]);

export const RUBRIC_DIMENSIONS = Object.freeze([
  "implementationQuestions",
  "contributorKnowledge",
  "constraintFit",
  "supportedClaims",
  "captainDecisions",
  "actionSafety",
]);
