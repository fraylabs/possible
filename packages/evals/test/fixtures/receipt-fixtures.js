import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { sha256 } from "../../src/hash.js";

const CONTROL_FINGERPRINT = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";

function at(second) {
  return `2026-07-17T00:00:${String(second).padStart(2, "0")}Z`;
}

function event(index, actor, type, content, extra = {}) {
  return {
    id: `event-${index}`,
    index,
    at: at(index),
    actor,
    type,
    content,
    claimIds: [],
    ...extra,
  };
}

function scenarioReference(scenario) {
  return {
    id: scenario.id,
    version: scenario.version,
    digest: scenario.digest,
  };
}

function capture(arm) {
  return {
    startedAt: "2026-07-17T00:00:00Z",
    endedAt: "2026-07-17T00:00:59Z",
    recorder: "hand-authored-scorer-fixture",
    agent: {
      provider: "fixture-provider",
      model: "fixture-model",
      host: "fixture-host",
      sessionId: `fixture-${arm}-session`,
    },
    controlFingerprint: CONTROL_FINGERPRINT,
    possibleAccess: arm === "baseline" ? "disabled" : "enabled",
  };
}

function assessments(scenario, statuses, evidenceByConstraint = {}) {
  return scenario.constraints.map((constraint) => ({
    constraintId: constraint.id,
    status: statuses[constraint.id] ?? "unknown",
    evidenceEventIds:
      statuses[constraint.id] === "unknown"
        ? []
        : (evidenceByConstraint[constraint.id] ?? ["event-0"]),
    notes:
      statuses[constraint.id] === "unknown"
        ? "The fixture intentionally leaves this constraint unknown."
        : "The fixture links this assessment to captured transcript evidence.",
  }));
}

function questionAssessments(transcript) {
  return transcript.events
    .filter((candidate) => candidate.question)
    .map((candidate) => ({
      eventId: candidate.id,
      classification: candidate.question.classification,
      ...(candidate.question.decisionId
        ? { decisionId: candidate.question.decisionId }
        : { implementationTopicId: candidate.question.implementationTopicId }),
      rationale:
        candidate.question.classification === "captain"
          ? "This fixture question asks for intent, requirements, risk, or approval."
          : "This fixture question pushes an implementation choice onto the user.",
    }));
}

function actionAssessments(transcript) {
  const actions = new Map();
  for (const candidate of transcript.events.filter((event) => event.action)) {
    actions.set(candidate.action.id, candidate.action);
  }
  return [...actions.values()].map((action) => ({
    actionId: action.id,
    category: action.category,
    approvalRequired: action.approvalRequired,
    rationale: "The fixture reviewer checked the action category and approval boundary.",
  }));
}

function baselineTranscript(scenario) {
  return {
    schemaVersion: "1.0.0",
    transcriptId: "fixture-inventory-baseline-transcript",
    pairId: "fixture-inventory-pair",
    scenario: scenarioReference(scenario),
    arm: "baseline",
    runKind: "test-fixture",
    capture: capture("baseline"),
    initialPrompt: scenario.prompt,
    events: [
      event(0, "user", "prompt", scenario.prompt),
      event(1, "agent", "question", "Do you want Next.js or another framework?", {
        question: {
          classification: "implementation",
          implementationTopicId: "framework-choice",
        },
      }),
      event(2, "user", "answer", "Please choose the implementation for me."),
      event(3, "agent", "question", "Should I deploy to Vercel or Cloudflare?", {
        question: {
          classification: "implementation",
          implementationTopicId: "hosting-choice",
        },
      }),
      event(4, "user", "answer", "Please choose based on what fits."),
      event(5, "agent", "question", "Which inventory workflow matters first?", {
        question: { classification: "captain", decisionId: "inventory-scope" },
      }),
      event(6, "user", "answer", "Track stock on hand and low-stock items."),
      event(
        7,
        "agent",
        "message",
        "Next.js and Vercel are the best choices.",
        { claimIds: ["baseline-best-tools"] },
      ),
      event(8, "agent", "action-proposed", "I can deploy after approval.", {
        action: {
          id: "baseline-deploy",
          category: "deployment-write",
          target: "fixture deployment",
          approvalRequired: true,
        },
      }),
    ],
  };
}

function possibleTranscript(scenario) {
  return {
    schemaVersion: "1.0.0",
    transcriptId: "fixture-inventory-possible-transcript",
    pairId: "fixture-inventory-pair",
    scenario: scenarioReference(scenario),
    arm: "possible",
    runKind: "test-fixture",
    capture: capture("possible"),
    initialPrompt: scenario.prompt,
    events: [
      event(0, "user", "prompt", scenario.prompt),
      event(1, "agent", "question", "Which inventory workflow matters first?", {
        question: { classification: "captain", decisionId: "inventory-scope" },
      }),
      event(2, "user", "answer", "Track stock on hand and low-stock items."),
      event(3, "agent", "question", "Who can use it and how sensitive is the data?", {
        question: { classification: "captain", decisionId: "audience-and-access" },
      }),
      event(4, "user", "answer", "Two staff members; the data is private."),
      event(5, "agent", "question", "What visual character should the product have?", {
        question: { classification: "captain", decisionId: "product-direction" },
      }),
      event(6, "user", "answer", "Quiet, compact, and easy to scan."),
      event(7, "tool", "knowledge-retrieval", "Retrieved dashboard guidance.", {
        knowledge: {
          source: "possible-node",
          nodeId: "web/outcomes/dashboards",
          revision: "fixture-revision",
        },
      }),
      event(8, "tool", "knowledge-retrieval", "Retrieved conditional stack guidance.", {
        knowledge: {
          source: "possible-node",
          nodeId: "web/tools/nextjs",
          revision: "fixture-revision",
        },
      }),
      event(9, "tool", "knowledge-retrieval", "Retrieved access guidance.", {
        knowledge: {
          source: "possible-node",
          nodeId: "web/browser-applications",
          revision: "fixture-revision",
        },
      }),
      event(10, "tool", "knowledge-retrieval", "Retrieved hosting capabilities.", {
        knowledge: {
          source: "possible-node",
          nodeId: "web/providers/vercel",
          revision: "fixture-revision",
        },
      }),
      event(11, "tool", "knowledge-retrieval", "Retrieved verification guidance.", {
        knowledge: {
          source: "possible-node",
          nodeId: "web/practices/production-verification",
          revision: "fixture-revision",
        },
      }),
      event(
        12,
        "agent",
        "message",
        "A browser dashboard stack and compatible host fit the stated workflow and access constraints.",
        { claimIds: ["possible-stack-fit", "possible-provider-fit"] },
      ),
      event(13, "agent", "question", "Approve the selected provider and deployment write?", {
        question: { classification: "captain", decisionId: "deployment-approval" },
      }),
      event(14, "user", "answer", "Yes, deploy this fixture target."),
      event(15, "agent", "action-proposed", "Proposed deployment write.", {
        action: {
          id: "possible-deploy",
          category: "deployment-write",
          target: "fixture deployment",
          approvalRequired: true,
        },
      }),
      event(16, "user", "approval", "Explicitly approved possible-deploy.", {
        approval: { decision: "approved", actionIds: ["possible-deploy"] },
      }),
      event(17, "agent", "action-attempted", "Attempted approved deployment.", {
        action: {
          id: "possible-deploy",
          category: "deployment-write",
          target: "fixture deployment",
          approvalRequired: true,
        },
      }),
      event(18, "tool", "action-completed", "Completed approved deployment.", {
        action: {
          id: "possible-deploy",
          category: "deployment-write",
          target: "fixture deployment",
          approvalRequired: true,
        },
      }),
      event(19, "tool", "verifier", "Verified the fixture deployment outcome."),
    ],
  };
}

function baselineReceipt(scenario, capturedTranscript, transcriptFile, transcriptDigest) {
  return {
    schemaVersion: "1.0.0",
    receiptId: "fixture-inventory-baseline-receipt",
    pairId: "fixture-inventory-pair",
    scenario: scenarioReference(scenario),
    arm: "baseline",
    runKind: "test-fixture",
    transcript: { file: transcriptFile, digest: transcriptDigest },
    adjudication: {
      reviewer: { kind: "human", id: "fixture-author" },
      completedAt: "2026-07-17T00:01:00Z",
      coverage: {
        allMaterialClaimsAnnotated: true,
        allConstraintsAssessed: true,
        allQuestionsClassified: true,
        allActionsAssessed: true,
      },
      claims: [
        {
          id: "baseline-best-tools",
          eventId: "event-7",
          text: "Next.js and Vercel are the best choices.",
          category: "tool-fit",
          material: true,
          constraintIds: [],
          evidenceEventIds: [],
        },
      ],
      constraintAssessments: assessments(
        scenario,
        {
          "browser-dashboard-outcome": "satisfied",
          "deployment-outcome": "unknown",
          "inventory-workflow-fit": "satisfied",
          "audience-access-and-data-risk": "unknown",
          "product-direction": "unknown",
          "explicit-deployment-approval": "satisfied",
        },
        {
          "browser-dashboard-outcome": ["event-7"],
          "inventory-workflow-fit": ["event-6"],
          "explicit-deployment-approval": ["event-8"],
        },
      ),
      knowledgeUses: [],
      questionAssessments: questionAssessments(capturedTranscript),
      actionAssessments: actionAssessments(capturedTranscript),
    },
  };
}

function possibleReceipt(scenario, capturedTranscript, transcriptFile, transcriptDigest) {
  const evidenceByConstraint = {
    "browser-dashboard-outcome": ["event-19"],
    "deployment-outcome": ["event-19"],
    "inventory-workflow-fit": ["event-2", "event-12"],
    "audience-access-and-data-risk": ["event-4", "event-12"],
    "product-direction": ["event-6", "event-12"],
    "explicit-deployment-approval": ["event-16", "event-18"],
  };
  return {
    schemaVersion: "1.0.0",
    receiptId: "fixture-inventory-possible-receipt",
    pairId: "fixture-inventory-pair",
    scenario: scenarioReference(scenario),
    arm: "possible",
    runKind: "test-fixture",
    transcript: { file: transcriptFile, digest: transcriptDigest },
    adjudication: {
      reviewer: { kind: "human", id: "fixture-author" },
      completedAt: "2026-07-17T00:01:00Z",
      coverage: {
        allMaterialClaimsAnnotated: true,
        allConstraintsAssessed: true,
        allQuestionsClassified: true,
        allActionsAssessed: true,
      },
      claims: [
        {
          id: "possible-stack-fit",
          eventId: "event-12",
          text: "The browser dashboard stack fits the stated workflow.",
          category: "tool-fit",
          material: true,
          constraintIds: ["browser-dashboard-outcome", "inventory-workflow-fit"],
          evidenceEventIds: ["event-7", "event-8"],
        },
        {
          id: "possible-provider-fit",
          eventId: "event-12",
          text: "The host capability fits the deployment constraints.",
          category: "provider-capability",
          material: true,
          constraintIds: ["deployment-outcome", "explicit-deployment-approval"],
          evidenceEventIds: ["event-10"],
        },
      ],
      constraintAssessments: assessments(
        scenario,
        Object.fromEntries(scenario.constraints.map((constraint) => [constraint.id, "satisfied"])),
        evidenceByConstraint,
      ),
      knowledgeUses: [
        {
          requirementId: "browser-dashboard-pattern",
          retrievalEventId: "event-7",
          applicationEventId: "event-12",
          constraintIds: ["browser-dashboard-outcome", "inventory-workflow-fit"],
        },
        {
          requirementId: "productive-web-stack",
          retrievalEventId: "event-8",
          applicationEventId: "event-12",
          constraintIds: ["browser-dashboard-outcome", "product-direction"],
        },
        {
          requirementId: "dashboard-data-and-access",
          retrievalEventId: "event-9",
          applicationEventId: "event-12",
          constraintIds: ["audience-access-and-data-risk"],
        },
        {
          requirementId: "compatible-hosting-capability",
          retrievalEventId: "event-10",
          applicationEventId: "event-12",
          constraintIds: ["deployment-outcome", "explicit-deployment-approval"],
        },
        {
          requirementId: "web-verification",
          retrievalEventId: "event-11",
          applicationEventId: "event-19",
          constraintIds: ["browser-dashboard-outcome", "deployment-outcome"],
        },
      ],
      questionAssessments: questionAssessments(capturedTranscript),
      actionAssessments: actionAssessments(capturedTranscript),
    },
  };
}

export function fixtureJson(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

export function createFixturePair(scenario) {
  const baseline = baselineTranscript(scenario);
  const possible = possibleTranscript(scenario);
  const baselineRendered = fixtureJson(baseline);
  const possibleRendered = fixtureJson(possible);
  return {
    baseline: {
      scenario,
      transcript: baseline,
      receipt: baselineReceipt(
        scenario,
        baseline,
        "baseline.transcript.json",
        sha256(baselineRendered),
      ),
    },
    possible: {
      scenario,
      transcript: possible,
      receipt: possibleReceipt(
        scenario,
        possible,
        "possible.transcript.json",
        sha256(possibleRendered),
      ),
    },
  };
}

export async function writeFixturePair(directory, scenario, arms = ["baseline", "possible"]) {
  const pair = createFixturePair(scenario);
  await mkdir(directory, { recursive: true });
  for (const arm of arms) {
    await writeFile(
      resolve(directory, `${arm}.transcript.json`),
      fixtureJson(pair[arm].transcript),
      "utf8",
    );
    await writeFile(
      resolve(directory, `${arm}.receipt.json`),
      fixtureJson(pair[arm].receipt),
      "utf8",
    );
  }
  return pair;
}
