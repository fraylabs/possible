import type { OutcomePack } from "./types.js";
import { manufacturingReadinessPack } from "./manufacturing-readiness.js";

const skills = manufacturingReadinessPack.skills.filter(({ id }) =>
  ["analytics", "cad", "cad-viewer", "robotics-testing", "create-technical-spike"].includes(id),
);

export const productionReadinessDecisionPack: OutcomePack = {
  schemaVersion: 1,
  catalogNumber: 25,
  lane: "release",
  slug: "production-readiness-decision",
  name: "Production Readiness Decision",
  eyebrow: "25 / EXPERIMENTAL PACK",
  promise: "Decide whether one frozen physical-product configuration can support one named production commitment.",
  summary: "A frozen configuration, commitment-specific DFM and pilot evidence, only the production modules that actually apply, and an independently challenged ready, repair-required, or no-go receipt.",
  useWhen: ["A measured prototype faces a concrete quantity, quality, cost, schedule, or delivery commitment.", "A pilot or supplier decision needs evidence tied to one frozen configuration."],
  notFor: ["Early concept exploration or first functional proof.", "Universal production planning before a production commitment exists.", "Launching, funding, or selling the product."],
  reviewedAt: "2026-07-29",
  skills,
  workstreams: [
    { id: "baseline", name: "Frozen configuration and commitment", skills: ["analytics", "cad"], owns: ["production-readiness/baseline/"], brief: "Freeze one revision and define volume, cost, quality, schedule, delivery, claims, and change-control boundaries." },
    { id: "evidence", name: "DFM and representative pilot", skills: ["cad", "robotics-testing", "create-technical-spike"], owns: ["production-readiness/evidence/"], dependsOn: ["baseline"], brief: "Produce commitment-specific DFM, process, test, yield, rework, and pilot evidence plus only active modules." },
    { id: "decision", name: "Independent production challenge", skills: ["cad-viewer", "analytics", "robotics-testing"], owns: ["production-readiness/review/", "production-readiness/decision.json"], dependsOn: ["evidence"], brief: "Challenge assumptions, normalize evidence, expose unpriced or untested risks, and decide without turning plans into proof." },
  ],
  reviewSkills: ["cad-viewer", "robotics-testing", "analytics"],
  outputs: ["Frozen configuration baseline", "Named production commitment", "Commitment-specific DFM package", "Representative pilot evidence", "Production readiness decision receipt"],
  guardrails: ["Do not infer production readiness from prototype success, documents, quotes, or simulations alone.", "Do not contact suppliers, buy parts, fabricate, certify, or commit spend without separate approval.", "Do not activate compliance, logistics, firmware, or service work when the product architecture and commitment do not require it.", "Preserve supplier confidentiality, quote assumptions, revision identity, and measurement uncertainty."],
  verification: ["Verify the frozen revision and change-control boundary.", "Recompute cost, yield, capacity, and schedule claims from preserved evidence.", "Challenge the representative pilot against the named commitment.", "Fail or require repair for every applicable unproven critical claim."],
  prerequisites: [{ id: "measured-prototype", description: "A representative functional prototype has passed its measured contract.", requiredEvidence: ["prototype receipt", "measurement evidence", "frozen revision candidate"] }],
  expectations: [
    { id: "configuration-frozen", statement: "One production candidate and its allowed changes are unambiguous.", failureModes: ["revision ambiguity", "uncontrolled substitution"], requiredEvidence: ["configuration baseline", "change-control record"] },
    { id: "commitment-bounded", statement: "The production decision is tied to a named quantity, quality, cost, schedule, and delivery boundary.", failureModes: ["generic readiness", "missing target"], requiredEvidence: ["production commitment"] },
    { id: "dfm-supported", statement: "Manufacturing processes and critical interfaces are supported by direct DFM evidence.", failureModes: ["paper-only process", "unresolved tolerance"], requiredEvidence: ["DFM review", "critical-interface evidence"] },
    { id: "pilot-representative", statement: "A representative pilot supports the named commitment and records yield, defects, rework, and limits.", failureModes: ["nonrepresentative build", "missing defect denominator"], requiredEvidence: ["pilot record", "quality data"] },
    { id: "supplier-proof", moduleId: "supplier-sourcing", statement: "Supplier feasibility and normalized economics support the commitment.", failureModes: ["incomparable quote", "unstated MOQ or lead time"], requiredEvidence: ["normalized supplier evidence"] },
    { id: "electrical-test-proof", moduleId: "electrical-production-test", statement: "Electrical production testing detects named assembly faults.", failureModes: ["untested fault", "unsafe fixture"], requiredEvidence: ["fixture test", "negative fault result"] },
    { id: "firmware-proof", moduleId: "firmware-flashing", statement: "Firmware identity, flashing, keys, and recovery are controlled.", failureModes: ["wrong image", "unrecoverable unit", "credential exposure"], requiredEvidence: ["flashing record", "recovery test"] },
    { id: "compliance-proof", moduleId: "market-compliance", statement: "Applicable market-access obligations and evidence gaps are explicit.", failureModes: ["wrong jurisdiction", "certification claim without evidence"], requiredEvidence: ["qualified compliance pathway"] },
    { id: "reliability-proof", moduleId: "reliability", statement: "Named reliability risks have representative test evidence.", failureModes: ["duration extrapolation", "missing failure analysis"], requiredEvidence: ["reliability test record"] },
    { id: "logistics-proof", moduleId: "packaging-logistics", statement: "Packaging and logistics evidence covers the named delivery commitment.", failureModes: ["damage mode omitted", "landed cost omitted"], requiredEvidence: ["packout test", "logistics model"] },
    { id: "service-proof", moduleId: "service-repair", statement: "Required service, repair, and replacement paths are feasible.", failureModes: ["sealed failure with service promise", "missing spare strategy"], requiredEvidence: ["service trial", "parts plan"] },
  ],
  modularOutcome: {
    kind: "modular-outcome", gateName: "Production readiness decision", action: "Prepare and challenge",
    contractPath: "production-readiness/baseline/commitment.json", moduleDecisionPath: "production-readiness/baseline/modules.json", artifactRoot: "production-readiness/", decisionReceiptPath: "production-readiness/decision.json", minimumActiveModules: 0,
    modules: [
      { id: "supplier-sourcing", activationWhen: "External supplier capacity, pricing, tooling, MOQ, or lead time determines the commitment.", work: ["obtain or preserve comparable supplier evidence"], checks: ["normalize assumptions, exclusions, currency, MOQ, and lead time"], requiredExpectationIds: ["supplier-proof"] },
      { id: "electrical-production-test", activationWhen: "The product contains production electronics requiring assembly fault detection.", work: ["define the minimum safe test fixture and limits"], checks: ["inject named detectable faults"], requiredExpectationIds: ["electrical-test-proof"] },
      { id: "firmware-flashing", activationWhen: "Units require firmware, configuration, credentials, or field recovery.", work: ["define image identity, flashing, secrets, and recovery"], checks: ["test wrong-image rejection and recovery"], requiredExpectationIds: ["firmware-proof"] },
      { id: "market-compliance", activationWhen: "The named market or product claims create regulatory or certification obligations.", work: ["map applicable obligations and qualified evidence"], checks: ["review jurisdiction, product classification, and claim language"], requiredExpectationIds: ["compliance-proof"] },
      { id: "reliability", activationWhen: "The commitment includes life, duty-cycle, environmental, or warranty exposure.", work: ["run bounded reliability evidence for named failure modes"], checks: ["record duration, denominator, failures, and uncertainty"], requiredExpectationIds: ["reliability-proof"] },
      { id: "packaging-logistics", activationWhen: "The commitment includes physical shipment or storage.", work: ["define packout, freight, customs, storage, and damage boundaries"], checks: ["test representative packout and recompute landed exposure"], requiredExpectationIds: ["logistics-proof"] },
      { id: "service-repair", activationWhen: "The commitment includes warranty, repair, replacement, or field service.", work: ["define and trial the minimum service path"], checks: ["measure access, time, parts, data, and disposition"], requiredExpectationIds: ["service-proof"] },
    ],
    decisions: ["ready", "repair-required", "no-go"],
    steps: ["Freeze one candidate and one production commitment before collecting evidence.", "Complete only the DFM and representative pilot work needed to test that commitment.", "Activate modules from architecture, market, and promise evidence—not generic checklists.", "Have an independent reviewer challenge denominators, representativeness, economics, and missing proof."],
    completionBoundary: "Ready applies only to the frozen configuration and named commitment; it is not authorization to spend, order, certify, sell, or scale.",
  },
};
