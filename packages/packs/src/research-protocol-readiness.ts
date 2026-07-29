import type { OutcomePack } from "./types.js";
import { studyReadinessPack } from "./study-readiness.js";

const skills = studyReadinessPack.skills;

export const researchProtocolReadinessPack: OutcomePack = {
  schemaVersion: 1,
  catalogNumber: 26,
  lane: "create",
  slug: "research-protocol-readiness",
  name: "Research Protocol Readiness",
  eyebrow: "26 / EXPERIMENTAL PACK",
  promise: "Turn one research question into a falsifiable protocol ready for the qualified review it actually needs.",
  summary: "A locked question, evidence map, protocol and analysis plan, only applicable ethics or data modules, and an honest ready-for-qualified-review, repair-required, or no-go receipt.",
  useWhen: ["A defined question needs a reproducible protocol before data collection.", "A bench, computational, observational, or participant study needs its assumptions and analysis challenged."],
  notFor: ["Executing a study or recruiting participants.", "Automatically treating every study as a clinical or regulated human-subject investigation.", "Making efficacy, safety, diagnostic, or regulatory claims."],
  reviewedAt: "2026-07-29",
  skills,
  workstreams: [
    { id: "question", name: "Question and evidence map", skills: ["analytics", "product-marketing"], owns: ["research-protocol/question/"], brief: "Lock the question, prior evidence, hypotheses, variables, endpoints, exclusions, and claim boundary." },
    { id: "protocol", name: "Protocol and analysis", skills: ["analytics", "documentation-writer", "customer-research"], owns: ["research-protocol/protocol/", "research-protocol/modules/"], dependsOn: ["question"], brief: "Create the reproducible protocol and analysis plan plus only applicable participant, data, regulatory, or operational modules." },
    { id: "review", name: "Qualified-path review", skills: ["analytics", "security-review", "documentation-writer"], owns: ["research-protocol/review/", "research-protocol/decision.json"], dependsOn: ["protocol"], brief: "Challenge bias, feasibility, consent, privacy, analysis flexibility, and the exact qualified review still required." },
  ],
  reviewSkills: ["analytics", "security-review", "documentation-writer"],
  outputs: ["Locked research question and evidence map", "Reproducible protocol", "Prespecified analysis plan", "Applicable ethics and data materials", "Qualified-review readiness receipt"],
  guardrails: ["Do not recruit, consent, intervene, collect data, access records, or register a study without separate approval and applicable qualified authorization.", "Do not invent ethics, legal, clinical, statistical, or regulatory approval.", "Do not add participant or health-data ceremony to a bench or computational protocol without activation evidence.", "Minimize sensitive data and preserve withdrawal, deletion, access, retention, and incident boundaries when applicable."],
  verification: ["Trace the research question and design choices to evidence.", "Challenge confounding, bias, missingness, multiplicity, power, and analysis flexibility as applicable.", "Dry-run the protocol with synthetic or non-sensitive fixtures where legitimate.", "State the exact qualified review required before execution and every claim the protocol cannot establish."],
  criticalProofs: [
    { id: "question-falsifiable", claim: "The research question, hypothesis, variables, and endpoint are falsifiable.", failureModes: ["circular endpoint", "undefined variable", "post hoc success"], requiredEvidence: ["question specification"] },
    { id: "protocol-reproducible", claim: "The protocol can be followed without unstated material decisions.", failureModes: ["ambiguous procedure", "missing inclusion rule"], requiredEvidence: ["protocol dry run"] },
    { id: "analysis-prespecified", claim: "The analysis plan defines outcomes, exclusions, missingness, uncertainty, and reporting.", failureModes: ["researcher degrees of freedom", "missing denominator"], requiredEvidence: ["analysis plan", "independent challenge"] },
    { id: "human-proof", moduleId: "human-participants", claim: "Participant recruitment, consent, burden, withdrawal, and adverse-event boundaries are explicit.", failureModes: ["coercion", "unclear consent", "missing withdrawal"], requiredEvidence: ["participant materials", "qualified review pathway"] },
    { id: "health-data-proof", moduleId: "health-data", claim: "Sensitive health-data collection and handling are minimized and controlled.", failureModes: ["excess collection", "reidentification", "missing deletion"], requiredEvidence: ["data-flow review", "privacy controls"] },
    { id: "vulnerable-proof", moduleId: "vulnerable-populations", claim: "Additional protections for the named vulnerable population are explicit.", failureModes: ["inappropriate consent", "undue burden"], requiredEvidence: ["population-specific review pathway"] },
    { id: "regulated-proof", moduleId: "regulated-product", claim: "Applicable regulated-product and claim boundaries are mapped for qualified review.", failureModes: ["wrong classification", "unapproved efficacy claim"], requiredEvidence: ["qualified regulatory pathway"] },
    { id: "multisite-proof", moduleId: "multisite", claim: "Site consistency, delegation, versioning, and data reconciliation are controlled.", failureModes: ["protocol drift", "site-specific bias"], requiredEvidence: ["site operations plan"] },
    { id: "remote-proof", moduleId: "remote-collection", claim: "Remote identity, environment, support, and failure handling are bounded.", failureModes: ["uncontrolled environment", "identity ambiguity"], requiredEvidence: ["remote dry run"] },
    { id: "specimen-proof", moduleId: "biological-specimens", claim: "Specimen collection, custody, storage, disposal, and biosafety paths are explicit.", failureModes: ["custody loss", "unsafe handling"], requiredEvidence: ["specimen flow review"] },
  ],
  modularOutcome: {
    kind: "modular-outcome", gateName: "Research protocol readiness", action: "Prepare and challenge",
    contractPath: "research-protocol/question/contract.json", moduleDecisionPath: "research-protocol/question/modules.json", artifactRoot: "research-protocol/", decisionReceiptPath: "research-protocol/decision.json", minimumActiveModules: 0,
    modules: [
      { id: "human-participants", activationWhen: "Living people are recruited, observed, surveyed, tested, or intervened upon.", work: ["prepare recruitment, consent, burden, withdrawal, and event materials"], checks: ["qualified pathway and comprehension review"], requiredProofIds: ["human-proof"] },
      { id: "health-data", activationWhen: "Health, biometric, diagnostic, treatment, or similarly sensitive data are used.", work: ["minimize and map collection, access, retention, export, and deletion"], checks: ["privacy and reidentification challenge"], requiredProofIds: ["health-data-proof"] },
      { id: "vulnerable-populations", activationWhen: "The population has reduced autonomy or additional vulnerability.", work: ["define additional consent, assent, burden, and safeguard paths"], checks: ["population-specific qualified review"], requiredProofIds: ["vulnerable-proof"] },
      { id: "regulated-product", activationWhen: "The protocol involves a regulated product, indication, diagnostic, or efficacy claim.", work: ["map classification, claim, reporting, and authorization boundaries"], checks: ["qualified regulatory review"], requiredProofIds: ["regulated-proof"] },
      { id: "multisite", activationWhen: "More than one site, investigator, or operational unit executes the protocol.", work: ["define delegation, training, versioning, and reconciliation"], checks: ["cross-site dry run"], requiredProofIds: ["multisite-proof"] },
      { id: "remote-collection", activationWhen: "Material procedures or measurements occur outside a controlled study site.", work: ["define identity, environment, support, failure, and device boundaries"], checks: ["remote dry run and dropout challenge"], requiredProofIds: ["remote-proof"] },
      { id: "biological-specimens", activationWhen: "Biological specimens are collected, stored, transported, analyzed, or disposed.", work: ["define custody, labeling, storage, biosafety, and disposal"], checks: ["specimen-flow and qualified-safety review"], requiredProofIds: ["specimen-proof"] },
    ],
    decisions: ["ready-for-qualified-review", "repair-required", "no-go"],
    steps: ["Lock one falsifiable question and the claims the study could and could not support.", "Write the minimum reproducible protocol and prespecified analysis plan.", "Activate ethics, privacy, regulatory, and operational modules only from the actual design.", "Use independent challenge to identify the exact qualified approval still required before execution."],
    completionBoundary: "Ready-for-qualified-review means the package is coherent enough for the applicable expert or authority to review; it does not approve or execute the study.",
  },
};
