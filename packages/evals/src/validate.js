import {
  ACTION_CATEGORIES,
  ACTORS,
  ARMS,
  EVENT_TYPES,
  MATERIAL_CLAIM_CATEGORIES,
  RECEIPT_SCHEMA_VERSION,
  RUBRIC_DIMENSIONS,
  RUN_KINDS,
  SCENARIO_SCHEMA_VERSION,
  TRANSCRIPT_SCHEMA_VERSION,
} from "./constants.js";
import { fail } from "./errors.js";

const ID_PATTERN = /^[a-z0-9][a-z0-9._/-]*$/;
const SEMVER_PATTERN = /^\d+\.\d+\.\d+$/;
const SHA256_PATTERN = /^[a-f0-9]{64}$/;
const TIMESTAMP_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/;

function record(value, path, required, optional = []) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    fail("SCHEMA_INVALID", `${path} must be an object`);
  }
  const allowed = new Set([...required, ...optional]);
  const unknown = Object.keys(value).filter((key) => !allowed.has(key));
  if (unknown.length > 0) {
    fail("SCHEMA_INVALID", `${path} has unknown field(s): ${unknown.join(", ")}`);
  }
  const missing = required.filter(
    (key) => !Object.prototype.hasOwnProperty.call(value, key),
  );
  if (missing.length > 0) {
    fail("SCHEMA_INVALID", `${path} is missing field(s): ${missing.join(", ")}`);
  }
  return value;
}

function string(value, path, options = {}) {
  if (typeof value !== "string" || value.length === 0) {
    fail("SCHEMA_INVALID", `${path} must be a non-empty string`);
  }
  if (options.pattern && !options.pattern.test(value)) {
    fail("SCHEMA_INVALID", `${path} has an invalid format`);
  }
  return value;
}

function boolean(value, path) {
  if (typeof value !== "boolean") {
    fail("SCHEMA_INVALID", `${path} must be a boolean`);
  }
  return value;
}

function number(value, path, options = {}) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    fail("SCHEMA_INVALID", `${path} must be a finite number`);
  }
  if (options.integer && !Number.isInteger(value)) {
    fail("SCHEMA_INVALID", `${path} must be an integer`);
  }
  if (options.min !== undefined && value < options.min) {
    fail("SCHEMA_INVALID", `${path} must be at least ${options.min}`);
  }
  if (options.max !== undefined && value > options.max) {
    fail("SCHEMA_INVALID", `${path} must be at most ${options.max}`);
  }
  return value;
}

function array(value, path, options = {}) {
  if (!Array.isArray(value)) {
    fail("SCHEMA_INVALID", `${path} must be an array`);
  }
  if (options.min !== undefined && value.length < options.min) {
    fail("SCHEMA_INVALID", `${path} must have at least ${options.min} item(s)`);
  }
  return value;
}

function enumeration(value, choices, path) {
  if (!choices.includes(value)) {
    fail("SCHEMA_INVALID", `${path} must be one of: ${choices.join(", ")}`);
  }
  return value;
}

function unique(values, path) {
  if (new Set(values).size !== values.length) {
    fail("SCHEMA_INVALID", `${path} must contain unique values`);
  }
}

function stringArray(value, path, options = {}) {
  const result = array(value, path, options);
  result.forEach((item, index) => string(item, `${path}[${index}]`));
  unique(result, path);
  return result;
}

function timestamp(value, path) {
  string(value, path, { pattern: TIMESTAMP_PATTERN });
  if (Number.isNaN(Date.parse(value))) {
    fail("SCHEMA_INVALID", `${path} must be an RFC 3339 UTC timestamp`);
  }
  return value;
}

function scenarioReference(value, path) {
  record(value, path, ["id", "version", "digest"]);
  string(value.id, `${path}.id`, { pattern: ID_PATTERN });
  string(value.version, `${path}.version`, { pattern: SEMVER_PATTERN });
  string(value.digest, `${path}.digest`, { pattern: SHA256_PATTERN });
}

export function validateScenarioManifest(manifest) {
  record(manifest, "manifest", ["schemaVersion", "setId", "status", "scenarios"]);
  if (manifest.schemaVersion !== SCENARIO_SCHEMA_VERSION) {
    fail(
      "SCHEMA_VERSION_UNSUPPORTED",
      `manifest.schemaVersion must be ${SCENARIO_SCHEMA_VERSION}`,
    );
  }
  string(manifest.setId, "manifest.setId", { pattern: ID_PATTERN });
  if (manifest.status !== "locked") {
    fail("SCENARIO_NOT_LOCKED", "manifest.status must be locked");
  }
  array(manifest.scenarios, "manifest.scenarios", { min: 1 });
  for (const [index, item] of manifest.scenarios.entries()) {
    const path = `manifest.scenarios[${index}]`;
    record(item, path, ["id", "version", "file", "sha256"]);
    string(item.id, `${path}.id`, { pattern: ID_PATTERN });
    string(item.version, `${path}.version`, { pattern: SEMVER_PATTERN });
    string(item.file, `${path}.file`, { pattern: /^[a-z0-9][a-z0-9._-]*\.json$/ });
    string(item.sha256, `${path}.sha256`, { pattern: SHA256_PATTERN });
  }
  unique(manifest.scenarios.map((item) => item.id), "manifest.scenarios ids");
  unique(manifest.scenarios.map((item) => item.file), "manifest.scenarios files");
  return manifest;
}

export function validateScenario(scenario) {
  record(scenario, "scenario", [
    "schemaVersion",
    "id",
    "version",
    "status",
    "title",
    "prompt",
    "objective",
    "constraints",
    "captainDecisions",
    "implementationTopics",
    "knowledgeRequirements",
    "safetyPolicies",
    "rubric",
  ]);
  if (scenario.schemaVersion !== SCENARIO_SCHEMA_VERSION) {
    fail(
      "SCHEMA_VERSION_UNSUPPORTED",
      `scenario.schemaVersion must be ${SCENARIO_SCHEMA_VERSION}`,
    );
  }
  string(scenario.id, "scenario.id", { pattern: ID_PATTERN });
  string(scenario.version, "scenario.version", { pattern: SEMVER_PATTERN });
  if (scenario.status !== "locked") {
    fail("SCENARIO_NOT_LOCKED", "scenario.status must be locked");
  }
  string(scenario.title, "scenario.title");
  string(scenario.prompt, "scenario.prompt");
  string(scenario.objective, "scenario.objective");

  array(scenario.constraints, "scenario.constraints", { min: 1 });
  const constraintIds = new Set();
  scenario.constraints.forEach((constraint, index) => {
    const path = `scenario.constraints[${index}]`;
    record(constraint, path, [
      "id",
      "description",
      "kind",
      "source",
      "required",
      "weight",
    ]);
    string(constraint.id, `${path}.id`, { pattern: ID_PATTERN });
    string(constraint.description, `${path}.description`);
    enumeration(
      constraint.kind,
      ["outcome", "quality", "capability", "safety"],
      `${path}.kind`,
    );
    enumeration(constraint.source, ["prompt", "captain"], `${path}.source`);
    boolean(constraint.required, `${path}.required`);
    number(constraint.weight, `${path}.weight`, { min: 1 });
    constraintIds.add(constraint.id);
  });
  if (constraintIds.size !== scenario.constraints.length) {
    fail("SCHEMA_INVALID", "scenario.constraints ids must be unique");
  }

  array(scenario.captainDecisions, "scenario.captainDecisions", { min: 1 });
  const decisionIds = new Set();
  scenario.captainDecisions.forEach((decision, index) => {
    const path = `scenario.captainDecisions[${index}]`;
    record(decision, path, [
      "id",
      "description",
      "required",
      "weight",
      "requiredBeforeActionCategories",
    ]);
    string(decision.id, `${path}.id`, { pattern: ID_PATTERN });
    string(decision.description, `${path}.description`);
    boolean(decision.required, `${path}.required`);
    number(decision.weight, `${path}.weight`, { min: 1 });
    stringArray(
      decision.requiredBeforeActionCategories,
      `${path}.requiredBeforeActionCategories`,
    ).forEach((category) =>
      enumeration(category, ACTION_CATEGORIES, `${path}.requiredBeforeActionCategories`),
    );
    decisionIds.add(decision.id);
  });
  if (decisionIds.size !== scenario.captainDecisions.length) {
    fail("SCHEMA_INVALID", "scenario.captainDecisions ids must be unique");
  }

  array(scenario.implementationTopics, "scenario.implementationTopics", { min: 1 });
  const implementationIds = new Set();
  scenario.implementationTopics.forEach((topic, index) => {
    const path = `scenario.implementationTopics[${index}]`;
    record(topic, path, ["id", "description", "examples"]);
    string(topic.id, `${path}.id`, { pattern: ID_PATTERN });
    string(topic.description, `${path}.description`);
    stringArray(topic.examples, `${path}.examples`, { min: 1 });
    implementationIds.add(topic.id);
  });
  if (implementationIds.size !== scenario.implementationTopics.length) {
    fail("SCHEMA_INVALID", "scenario.implementationTopics ids must be unique");
  }

  array(scenario.knowledgeRequirements, "scenario.knowledgeRequirements", {
    min: 1,
  });
  const knowledgeIds = new Set();
  scenario.knowledgeRequirements.forEach((requirement, index) => {
    const path = `scenario.knowledgeRequirements[${index}]`;
    record(requirement, path, [
      "id",
      "description",
      "acceptableNodeIds",
      "constraintIds",
      "weight",
    ]);
    string(requirement.id, `${path}.id`, { pattern: ID_PATTERN });
    string(requirement.description, `${path}.description`);
    stringArray(requirement.acceptableNodeIds, `${path}.acceptableNodeIds`, {
      min: 1,
    });
    stringArray(requirement.constraintIds, `${path}.constraintIds`, { min: 1 });
    requirement.constraintIds.forEach((constraintId) => {
      if (!constraintIds.has(constraintId)) {
        fail(
          "SCHEMA_INVALID",
          `${path}.constraintIds references unknown constraint ${constraintId}`,
        );
      }
    });
    number(requirement.weight, `${path}.weight`, { min: 1 });
    knowledgeIds.add(requirement.id);
  });
  if (knowledgeIds.size !== scenario.knowledgeRequirements.length) {
    fail("SCHEMA_INVALID", "scenario.knowledgeRequirements ids must be unique");
  }

  array(scenario.safetyPolicies, "scenario.safetyPolicies", { min: 1 });
  const safetyCategories = new Set();
  scenario.safetyPolicies.forEach((policy, index) => {
    const path = `scenario.safetyPolicies[${index}]`;
    record(policy, path, ["actionCategory", "approvalRequired", "description"]);
    enumeration(policy.actionCategory, ACTION_CATEGORIES, `${path}.actionCategory`);
    boolean(policy.approvalRequired, `${path}.approvalRequired`);
    string(policy.description, `${path}.description`);
    safetyCategories.add(policy.actionCategory);
  });
  if (safetyCategories.size !== scenario.safetyPolicies.length) {
    fail("SCHEMA_INVALID", "scenario.safetyPolicies categories must be unique");
  }

  record(scenario.rubric, "scenario.rubric", [
    "weights",
    "maxImplementationQuestions",
    "unsupportedClaimPenalty",
    "unsafeActionPenalty",
    "misdeclaredApprovalPenalty",
  ]);
  record(scenario.rubric.weights, "scenario.rubric.weights", RUBRIC_DIMENSIONS);
  for (const dimension of RUBRIC_DIMENSIONS) {
    number(scenario.rubric.weights[dimension], `scenario.rubric.weights.${dimension}`, {
      min: 0,
      max: 100,
    });
  }
  const weightTotal = RUBRIC_DIMENSIONS.reduce(
    (sum, dimension) => sum + scenario.rubric.weights[dimension],
    0,
  );
  if (weightTotal !== 100) {
    fail("SCHEMA_INVALID", `scenario.rubric weights must total 100, got ${weightTotal}`);
  }
  number(
    scenario.rubric.maxImplementationQuestions,
    "scenario.rubric.maxImplementationQuestions",
    { integer: true, min: 1 },
  );
  number(
    scenario.rubric.unsupportedClaimPenalty,
    "scenario.rubric.unsupportedClaimPenalty",
    { min: 0 },
  );
  number(scenario.rubric.unsafeActionPenalty, "scenario.rubric.unsafeActionPenalty", {
    min: 0,
  });
  number(
    scenario.rubric.misdeclaredApprovalPenalty,
    "scenario.rubric.misdeclaredApprovalPenalty",
    { min: 0 },
  );
  return scenario;
}

function validateQuestion(question, path, scenario) {
  record(question, path, ["classification"], ["decisionId", "implementationTopicId"]);
  enumeration(question.classification, ["captain", "implementation"], `${path}.classification`);
  if (question.classification === "captain") {
    string(question.decisionId, `${path}.decisionId`, { pattern: ID_PATTERN });
    if (question.implementationTopicId !== undefined) {
      fail("SCHEMA_INVALID", `${path}.implementationTopicId is invalid for captain questions`);
    }
    if (
      scenario &&
      !scenario.captainDecisions.some((decision) => decision.id === question.decisionId)
    ) {
      fail("SCHEMA_INVALID", `${path}.decisionId is not allowed by the scenario`);
    }
  } else {
    string(question.implementationTopicId, `${path}.implementationTopicId`, {
      pattern: ID_PATTERN,
    });
    if (question.decisionId !== undefined) {
      fail("SCHEMA_INVALID", `${path}.decisionId is invalid for implementation questions`);
    }
    if (
      scenario &&
      !scenario.implementationTopics.some(
        (topic) => topic.id === question.implementationTopicId,
      )
    ) {
      fail("SCHEMA_INVALID", `${path}.implementationTopicId is not allowed by the scenario`);
    }
  }
}

function validateKnowledge(knowledge, path) {
  record(knowledge, path, ["source"], ["nodeId", "revision", "uri"]);
  enumeration(knowledge.source, ["possible-node", "external-source"], `${path}.source`);
  if (knowledge.source === "possible-node") {
    string(knowledge.nodeId, `${path}.nodeId`, { pattern: ID_PATTERN });
    string(knowledge.revision, `${path}.revision`);
  } else {
    string(knowledge.uri, `${path}.uri`, { pattern: /^https?:\/\// });
  }
}

function validateAction(action, path) {
  record(action, path, ["id", "category", "target", "approvalRequired"]);
  string(action.id, `${path}.id`, { pattern: ID_PATTERN });
  enumeration(action.category, ACTION_CATEGORIES, `${path}.category`);
  string(action.target, `${path}.target`);
  boolean(action.approvalRequired, `${path}.approvalRequired`);
}

function validateApproval(approval, path) {
  record(approval, path, ["decision", "actionIds"]);
  enumeration(approval.decision, ["approved", "denied"], `${path}.decision`);
  stringArray(approval.actionIds, `${path}.actionIds`, { min: 1 });
}

function validateArtifact(artifact, path) {
  record(artifact, path, ["id", "uri"], ["digest"]);
  string(artifact.id, `${path}.id`, { pattern: ID_PATTERN });
  string(artifact.uri, `${path}.uri`);
  if (artifact.digest !== undefined) {
    string(artifact.digest, `${path}.digest`, { pattern: SHA256_PATTERN });
  }
}

export function validateTranscript(transcript, scenario = undefined) {
  record(transcript, "transcript", [
    "schemaVersion",
    "transcriptId",
    "pairId",
    "scenario",
    "arm",
    "runKind",
    "capture",
    "initialPrompt",
    "events",
  ]);
  if (transcript.schemaVersion !== TRANSCRIPT_SCHEMA_VERSION) {
    fail(
      "SCHEMA_VERSION_UNSUPPORTED",
      `transcript.schemaVersion must be ${TRANSCRIPT_SCHEMA_VERSION}`,
    );
  }
  string(transcript.transcriptId, "transcript.transcriptId", { pattern: ID_PATTERN });
  string(transcript.pairId, "transcript.pairId", { pattern: ID_PATTERN });
  scenarioReference(transcript.scenario, "transcript.scenario");
  enumeration(transcript.arm, ARMS, "transcript.arm");
  enumeration(transcript.runKind, RUN_KINDS, "transcript.runKind");

  record(transcript.capture, "transcript.capture", [
    "startedAt",
    "endedAt",
    "recorder",
    "agent",
    "controlFingerprint",
    "possibleAccess",
  ]);
  timestamp(transcript.capture.startedAt, "transcript.capture.startedAt");
  timestamp(transcript.capture.endedAt, "transcript.capture.endedAt");
  if (Date.parse(transcript.capture.endedAt) < Date.parse(transcript.capture.startedAt)) {
    fail("SCHEMA_INVALID", "transcript.capture.endedAt cannot precede startedAt");
  }
  string(transcript.capture.recorder, "transcript.capture.recorder");
  string(transcript.capture.controlFingerprint, "transcript.capture.controlFingerprint", {
    pattern: SHA256_PATTERN,
  });
  enumeration(
    transcript.capture.possibleAccess,
    ["disabled", "enabled"],
    "transcript.capture.possibleAccess",
  );
  if (
    (transcript.arm === "baseline" && transcript.capture.possibleAccess !== "disabled") ||
    (transcript.arm === "possible" && transcript.capture.possibleAccess !== "enabled")
  ) {
    fail(
      "ARM_CONTAMINATION",
      `${transcript.arm} arm has invalid Possible access state`,
    );
  }
  record(transcript.capture.agent, "transcript.capture.agent", [
    "provider",
    "model",
    "host",
    "sessionId",
  ]);
  string(transcript.capture.agent.provider, "transcript.capture.agent.provider");
  string(transcript.capture.agent.model, "transcript.capture.agent.model");
  string(transcript.capture.agent.host, "transcript.capture.agent.host");
  string(transcript.capture.agent.sessionId, "transcript.capture.agent.sessionId");
  string(transcript.initialPrompt, "transcript.initialPrompt");

  if (scenario) {
    if (
      transcript.scenario.id !== scenario.id ||
      transcript.scenario.version !== scenario.version
    ) {
      fail("SCENARIO_MISMATCH", "transcript references the wrong scenario");
    }
    if (transcript.initialPrompt !== scenario.prompt) {
      fail("PROMPT_MISMATCH", "transcript.initialPrompt must exactly match the locked prompt");
    }
  }

  array(transcript.events, "transcript.events", { min: 1 });
  const eventIds = new Set();
  let previousEventTime = -Infinity;
  transcript.events.forEach((event, index) => {
    const path = `transcript.events[${index}]`;
    record(
      event,
      path,
      ["id", "index", "at", "actor", "type", "content", "claimIds"],
      ["question", "knowledge", "action", "approval", "artifact"],
    );
    string(event.id, `${path}.id`, { pattern: ID_PATTERN });
    number(event.index, `${path}.index`, { integer: true, min: 0 });
    if (event.index !== index) {
      fail("SCHEMA_INVALID", `${path}.index must equal ${index}`);
    }
    timestamp(event.at, `${path}.at`);
    const eventTime = Date.parse(event.at);
    if (
      eventTime < Date.parse(transcript.capture.startedAt) ||
      eventTime > Date.parse(transcript.capture.endedAt)
    ) {
      fail("SCHEMA_INVALID", `${path}.at falls outside the capture window`);
    }
    if (eventTime < previousEventTime) {
      fail("SCHEMA_INVALID", `${path}.at must not precede the prior event`);
    }
    previousEventTime = eventTime;
    enumeration(event.actor, ACTORS, `${path}.actor`);
    enumeration(event.type, EVENT_TYPES, `${path}.type`);
    const allowedActors = {
      prompt: ["user"],
      question: ["agent"],
      answer: ["user"],
      "knowledge-retrieval": ["agent", "tool"],
      "tool-result": ["tool"],
      "action-proposed": ["agent"],
      "action-attempted": ["agent", "tool"],
      "action-completed": ["agent", "tool"],
      approval: ["user"],
      artifact: ["agent", "tool"],
      verifier: ["agent", "tool"],
      message: ["user", "agent", "tool", "system"],
    }[event.type];
    if (!allowedActors.includes(event.actor)) {
      fail(
        "SCHEMA_INVALID",
        `${path}.actor ${event.actor} is invalid for ${event.type}`,
      );
    }
    string(event.content, `${path}.content`);
    stringArray(event.claimIds, `${path}.claimIds`);
    if (eventIds.has(event.id)) {
      fail("SCHEMA_INVALID", `transcript event id ${event.id} is duplicated`);
    }
    eventIds.add(event.id);

    const detailFields = ["question", "knowledge", "action", "approval", "artifact"];
    const requiredDetail = {
      question: "question",
      "knowledge-retrieval": "knowledge",
      "action-proposed": "action",
      "action-attempted": "action",
      "action-completed": "action",
      approval: "approval",
      artifact: "artifact",
    }[event.type];
    for (const field of detailFields) {
      if (field === requiredDetail) {
        if (event[field] === undefined) {
          fail("SCHEMA_INVALID", `${path}.${field} is required for ${event.type}`);
        }
      } else if (event[field] !== undefined) {
        fail("SCHEMA_INVALID", `${path}.${field} is invalid for ${event.type}`);
      }
    }
    if (event.question) validateQuestion(event.question, `${path}.question`, scenario);
    if (event.knowledge) validateKnowledge(event.knowledge, `${path}.knowledge`);
    if (event.action) validateAction(event.action, `${path}.action`);
    if (event.approval) validateApproval(event.approval, `${path}.approval`);
    if (event.artifact) validateArtifact(event.artifact, `${path}.artifact`);
  });

  const firstEvent = transcript.events[0];
  if (
    firstEvent.type !== "prompt" ||
    firstEvent.actor !== "user" ||
    firstEvent.content !== transcript.initialPrompt
  ) {
    fail("PROMPT_MISMATCH", "the first transcript event must be the exact user prompt");
  }
  const actionDefinitions = new Map();
  for (const event of transcript.events.filter((candidate) => candidate.action)) {
    const existing = actionDefinitions.get(event.action.id);
    const definition = JSON.stringify({
      category: event.action.category,
      target: event.action.target,
      approvalRequired: event.action.approvalRequired,
    });
    if (existing && existing !== definition) {
      fail(
        "SCHEMA_INVALID",
        `action ${event.action.id} changes category, target, or approval requirement`,
      );
    }
    actionDefinitions.set(event.action.id, definition);
  }
  for (const event of transcript.events.filter((candidate) => candidate.approval)) {
    for (const actionId of event.approval.actionIds) {
      if (!actionDefinitions.has(actionId)) {
        fail("SCHEMA_INVALID", `approval ${event.id} references unknown action ${actionId}`);
      }
    }
  }
  if (
    transcript.arm === "baseline" &&
    transcript.events.some((event) => event.knowledge?.source === "possible-node")
  ) {
    fail("ARM_CONTAMINATION", "baseline transcript contains Possible knowledge retrieval");
  }
  return transcript;
}

function validateClaim(claim, path, scenario) {
  record(claim, path, [
    "id",
    "eventId",
    "text",
    "category",
    "material",
    "constraintIds",
    "evidenceEventIds",
  ]);
  string(claim.id, `${path}.id`, { pattern: ID_PATTERN });
  string(claim.eventId, `${path}.eventId`, { pattern: ID_PATTERN });
  string(claim.text, `${path}.text`);
  enumeration(claim.category, MATERIAL_CLAIM_CATEGORIES, `${path}.category`);
  boolean(claim.material, `${path}.material`);
  stringArray(claim.constraintIds, `${path}.constraintIds`);
  stringArray(claim.evidenceEventIds, `${path}.evidenceEventIds`);
  if (scenario) {
    const validIds = new Set(scenario.constraints.map((constraint) => constraint.id));
    claim.constraintIds.forEach((id) => {
      if (!validIds.has(id)) {
        fail("SCHEMA_INVALID", `${path}.constraintIds references unknown constraint ${id}`);
      }
    });
  }
}

function validateConstraintAssessment(assessment, path) {
  record(assessment, path, ["constraintId", "status", "evidenceEventIds", "notes"]);
  string(assessment.constraintId, `${path}.constraintId`, { pattern: ID_PATTERN });
  enumeration(
    assessment.status,
    ["satisfied", "violated", "unknown"],
    `${path}.status`,
  );
  stringArray(assessment.evidenceEventIds, `${path}.evidenceEventIds`);
  string(assessment.notes, `${path}.notes`);
  if (assessment.status !== "unknown" && assessment.evidenceEventIds.length === 0) {
    fail("SCHEMA_INVALID", `${path}.evidenceEventIds is required for ${assessment.status}`);
  }
}

function validateKnowledgeUse(use, path) {
  record(use, path, [
    "requirementId",
    "retrievalEventId",
    "applicationEventId",
    "constraintIds",
  ]);
  string(use.requirementId, `${path}.requirementId`, { pattern: ID_PATTERN });
  string(use.retrievalEventId, `${path}.retrievalEventId`, { pattern: ID_PATTERN });
  string(use.applicationEventId, `${path}.applicationEventId`, { pattern: ID_PATTERN });
  stringArray(use.constraintIds, `${path}.constraintIds`, { min: 1 });
}

function validateQuestionAssessment(assessment, path, scenario) {
  record(
    assessment,
    path,
    ["eventId", "classification", "rationale"],
    ["decisionId", "implementationTopicId"],
  );
  string(assessment.eventId, `${path}.eventId`, { pattern: ID_PATTERN });
  string(assessment.rationale, `${path}.rationale`);
  validateQuestion(
    {
      classification: assessment.classification,
      ...(assessment.decisionId === undefined
        ? {}
        : { decisionId: assessment.decisionId }),
      ...(assessment.implementationTopicId === undefined
        ? {}
        : { implementationTopicId: assessment.implementationTopicId }),
    },
    path,
    scenario,
  );
}

function validateActionAssessment(assessment, path) {
  record(assessment, path, [
    "actionId",
    "category",
    "approvalRequired",
    "rationale",
  ]);
  string(assessment.actionId, `${path}.actionId`, { pattern: ID_PATTERN });
  enumeration(assessment.category, ACTION_CATEGORIES, `${path}.category`);
  boolean(assessment.approvalRequired, `${path}.approvalRequired`);
  string(assessment.rationale, `${path}.rationale`);
}

export function validateReceipt(receipt, scenario = undefined, transcript = undefined) {
  record(receipt, "receipt", [
    "schemaVersion",
    "receiptId",
    "pairId",
    "scenario",
    "arm",
    "runKind",
    "transcript",
    "adjudication",
  ]);
  if (receipt.schemaVersion !== RECEIPT_SCHEMA_VERSION) {
    fail(
      "SCHEMA_VERSION_UNSUPPORTED",
      `receipt.schemaVersion must be ${RECEIPT_SCHEMA_VERSION}`,
    );
  }
  string(receipt.receiptId, "receipt.receiptId", { pattern: ID_PATTERN });
  string(receipt.pairId, "receipt.pairId", { pattern: ID_PATTERN });
  scenarioReference(receipt.scenario, "receipt.scenario");
  enumeration(receipt.arm, ARMS, "receipt.arm");
  enumeration(receipt.runKind, RUN_KINDS, "receipt.runKind");
  record(receipt.transcript, "receipt.transcript", ["file", "digest"]);
  string(receipt.transcript.file, "receipt.transcript.file", {
    pattern: /^[a-z0-9][a-z0-9._-]*\.transcript\.json$/,
  });
  string(receipt.transcript.digest, "receipt.transcript.digest", {
    pattern: SHA256_PATTERN,
  });

  record(receipt.adjudication, "receipt.adjudication", [
    "reviewer",
    "completedAt",
    "coverage",
    "claims",
    "constraintAssessments",
    "knowledgeUses",
    "questionAssessments",
    "actionAssessments",
  ]);
  record(receipt.adjudication.reviewer, "receipt.adjudication.reviewer", [
    "kind",
    "id",
  ]);
  enumeration(
    receipt.adjudication.reviewer.kind,
    ["human", "independent-agent"],
    "receipt.adjudication.reviewer.kind",
  );
  string(receipt.adjudication.reviewer.id, "receipt.adjudication.reviewer.id");
  timestamp(receipt.adjudication.completedAt, "receipt.adjudication.completedAt");
  record(receipt.adjudication.coverage, "receipt.adjudication.coverage", [
    "allMaterialClaimsAnnotated",
    "allConstraintsAssessed",
    "allQuestionsClassified",
    "allActionsAssessed",
  ]);
  if (receipt.adjudication.coverage.allMaterialClaimsAnnotated !== true) {
    fail("ADJUDICATION_INCOMPLETE", "all material claims must be annotated");
  }
  if (receipt.adjudication.coverage.allConstraintsAssessed !== true) {
    fail("ADJUDICATION_INCOMPLETE", "all scenario constraints must be assessed");
  }
  if (receipt.adjudication.coverage.allQuestionsClassified !== true) {
    fail("ADJUDICATION_INCOMPLETE", "all user-facing questions must be classified");
  }
  if (receipt.adjudication.coverage.allActionsAssessed !== true) {
    fail("ADJUDICATION_INCOMPLETE", "all actions must be independently assessed");
  }

  array(receipt.adjudication.claims, "receipt.adjudication.claims");
  receipt.adjudication.claims.forEach((claim, index) =>
    validateClaim(claim, `receipt.adjudication.claims[${index}]`, scenario),
  );
  unique(
    receipt.adjudication.claims.map((claim) => claim.id),
    "receipt.adjudication.claims ids",
  );

  array(
    receipt.adjudication.constraintAssessments,
    "receipt.adjudication.constraintAssessments",
    { min: 1 },
  );
  receipt.adjudication.constraintAssessments.forEach((assessment, index) =>
    validateConstraintAssessment(
      assessment,
      `receipt.adjudication.constraintAssessments[${index}]`,
    ),
  );
  unique(
    receipt.adjudication.constraintAssessments.map(
      (assessment) => assessment.constraintId,
    ),
    "receipt.adjudication.constraintAssessments constraintIds",
  );

  array(receipt.adjudication.knowledgeUses, "receipt.adjudication.knowledgeUses");
  receipt.adjudication.knowledgeUses.forEach((use, index) =>
    validateKnowledgeUse(use, `receipt.adjudication.knowledgeUses[${index}]`),
  );

  array(
    receipt.adjudication.questionAssessments,
    "receipt.adjudication.questionAssessments",
  );
  receipt.adjudication.questionAssessments.forEach((assessment, index) =>
    validateQuestionAssessment(
      assessment,
      `receipt.adjudication.questionAssessments[${index}]`,
      scenario,
    ),
  );
  unique(
    receipt.adjudication.questionAssessments.map(
      (assessment) => assessment.eventId,
    ),
    "receipt.adjudication.questionAssessments eventIds",
  );

  array(receipt.adjudication.actionAssessments, "receipt.adjudication.actionAssessments");
  receipt.adjudication.actionAssessments.forEach((assessment, index) =>
    validateActionAssessment(
      assessment,
      `receipt.adjudication.actionAssessments[${index}]`,
    ),
  );
  unique(
    receipt.adjudication.actionAssessments.map((assessment) => assessment.actionId),
    "receipt.adjudication.actionAssessments actionIds",
  );

  if (scenario) {
    if (receipt.scenario.id !== scenario.id || receipt.scenario.version !== scenario.version) {
      fail("SCENARIO_MISMATCH", "receipt references the wrong scenario");
    }
    const assessmentIds = new Set(
      receipt.adjudication.constraintAssessments.map(
        (assessment) => assessment.constraintId,
      ),
    );
    const expectedIds = new Set(scenario.constraints.map((constraint) => constraint.id));
    if (
      assessmentIds.size !== expectedIds.size ||
      [...expectedIds].some((id) => !assessmentIds.has(id))
    ) {
      fail(
        "ADJUDICATION_INCOMPLETE",
        "receipt must assess every locked scenario constraint exactly once",
      );
    }
  }

  if (transcript) {
    if (
      receipt.pairId !== transcript.pairId ||
      receipt.arm !== transcript.arm ||
      receipt.runKind !== transcript.runKind ||
      receipt.scenario.id !== transcript.scenario.id ||
      receipt.scenario.version !== transcript.scenario.version ||
      receipt.scenario.digest !== transcript.scenario.digest
    ) {
      fail("TRANSCRIPT_MISMATCH", "receipt metadata does not match its transcript");
    }
    if (
      Date.parse(receipt.adjudication.completedAt) <
      Date.parse(transcript.capture.endedAt)
    ) {
      fail(
        "ADJUDICATION_INCOMPLETE",
        "receipt adjudication cannot complete before transcript capture ends",
      );
    }
    const eventById = new Map(transcript.events.map((event) => [event.id, event]));
    const claimById = new Map(
      receipt.adjudication.claims.map((claim) => [claim.id, claim]),
    );
    const transcriptClaimIds = transcript.events.flatMap((event) => event.claimIds);
    unique(transcriptClaimIds, "transcript claim references");
    if (
      transcriptClaimIds.length !== claimById.size ||
      transcriptClaimIds.some((id) => !claimById.has(id))
    ) {
      fail(
        "ADJUDICATION_INCOMPLETE",
        "receipt claims must exactly match transcript event claim references",
      );
    }
    for (const claim of receipt.adjudication.claims) {
      const event = eventById.get(claim.eventId);
      if (!event || !event.claimIds.includes(claim.id) || event.actor !== "agent") {
        fail("EVIDENCE_INVALID", `claim ${claim.id} is not linked to its agent event`);
      }
      claim.evidenceEventIds.forEach((id) => {
        if (!eventById.has(id)) {
          fail("EVIDENCE_INVALID", `claim ${claim.id} references unknown evidence ${id}`);
        }
      });
    }
    for (const assessment of receipt.adjudication.constraintAssessments) {
      assessment.evidenceEventIds.forEach((id) => {
        if (!eventById.has(id)) {
          fail(
            "EVIDENCE_INVALID",
            `constraint ${assessment.constraintId} references unknown evidence ${id}`,
          );
        }
      });
    }
    for (const use of receipt.adjudication.knowledgeUses) {
      const retrieval = eventById.get(use.retrievalEventId);
      const application = eventById.get(use.applicationEventId);
      if (!retrieval || retrieval.knowledge?.source !== "possible-node") {
        fail(
          "KNOWLEDGE_USE_INVALID",
          `${use.requirementId} must reference a Possible knowledge-retrieval event`,
        );
      }
      if (!application || application.index <= retrieval.index) {
        fail(
          "KNOWLEDGE_USE_INVALID",
          `${use.requirementId} must reference a later application event`,
        );
      }
      if (scenario) {
        const requirement = scenario.knowledgeRequirements.find(
          (candidate) => candidate.id === use.requirementId,
        );
        if (!requirement) {
          fail(
            "KNOWLEDGE_USE_INVALID",
            `${use.requirementId} is not a locked knowledge requirement`,
          );
        }
        const validConstraints = new Set(requirement.constraintIds);
        if (!use.constraintIds.some((id) => validConstraints.has(id))) {
          fail(
            "KNOWLEDGE_USE_INVALID",
            `${use.requirementId} is not applied to a relevant constraint`,
          );
        }
      }
    }
    const questionEvents = transcript.events.filter((event) => event.question);
    const questionAssessmentByEventId = new Map(
      receipt.adjudication.questionAssessments.map((assessment) => [
        assessment.eventId,
        assessment,
      ]),
    );
    if (
      questionEvents.length !== questionAssessmentByEventId.size ||
      questionEvents.some((event) => !questionAssessmentByEventId.has(event.id))
    ) {
      fail(
        "ADJUDICATION_INCOMPLETE",
        "question assessments must cover every question event exactly once",
      );
    }
    for (const event of questionEvents) {
      const assessment = questionAssessmentByEventId.get(event.id);
      if (
        assessment.classification !== event.question.classification ||
        assessment.decisionId !== event.question.decisionId ||
        assessment.implementationTopicId !== event.question.implementationTopicId
      ) {
        fail(
          "ADJUDICATION_MISMATCH",
          `question assessment for ${event.id} disagrees with transcript annotation`,
        );
      }
    }

    const actionById = new Map();
    for (const event of transcript.events.filter((candidate) => candidate.action)) {
      actionById.set(event.action.id, event.action);
    }
    const actionAssessmentById = new Map(
      receipt.adjudication.actionAssessments.map((assessment) => [
        assessment.actionId,
        assessment,
      ]),
    );
    if (
      actionById.size !== actionAssessmentById.size ||
      [...actionById.keys()].some((actionId) => !actionAssessmentById.has(actionId))
    ) {
      fail(
        "ADJUDICATION_INCOMPLETE",
        "action assessments must cover every action exactly once",
      );
    }
    for (const [actionId, action] of actionById) {
      const assessment = actionAssessmentById.get(actionId);
      if (
        assessment.category !== action.category ||
        assessment.approvalRequired !== action.approvalRequired
      ) {
        fail(
          "ADJUDICATION_MISMATCH",
          `action assessment for ${actionId} disagrees with transcript annotation`,
        );
      }
    }
    if (receipt.arm === "baseline" && receipt.adjudication.knowledgeUses.length > 0) {
      fail("ARM_CONTAMINATION", "baseline receipt claims Possible contributor knowledge use");
    }
  }
  return receipt;
}

export function deepFreeze(value) {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const child of Object.values(value)) deepFreeze(child);
  }
  return value;
}
