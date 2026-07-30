import type { OutcomePack } from "./types.js";
import { robotPrototypePack } from "./robot-prototype.js";

const skills = robotPrototypePack.skills.filter(({ id }) =>
  ["robotics-design-patterns", "robotics-testing", "mujoco-robotics", "cad", "cad-viewer"].includes(id),
);

export const robotDigitalPrototypePack: OutcomePack = {
  schemaVersion: 1,
  catalogNumber: 24,
  lane: "create",
  slug: "robot-digital-prototype",
  name: "Robot Digital Prototype",
  eyebrow: "24 / EXPERIMENTAL PACK",
  promise: "Prove one robot behavior in a deterministic digital prototype and expose the sim-to-real gap.",
  summary: "A bounded behavior contract, the minimum active robot modules, deterministic scenario evidence, falsification, and an honest digital-only receipt.",
  useWhen: ["A robot concept needs one behavior demonstrated before fabrication or commissioning.", "Simulation can retire a named mechanical, control, planning, or interface uncertainty."],
  notFor: ["Fabrication-ready hardware or physical commissioning.", "A passive object or simple mechanism that only needs Mechanical CAD Review.", "A requirement to model every robot subsystem regardless of the behavior being tested."],
  reviewedAt: "2026-07-29",
  skills,
  workstreams: [
    { id: "contract", name: "Behavior and environment contract", skills: ["robotics-design-patterns"], owns: ["robot-digital/contract/"], brief: "Define one observable behavior, environment, success threshold, failing scenarios, assumptions, and digital boundary." },
    { id: "prototype", name: "Minimum digital prototype", skills: ["mujoco-robotics", "cad"], owns: ["robot-digital/model/", "robot-digital/scenarios/"], dependsOn: ["contract"], brief: "Build only the geometry, dynamics, controller, interfaces, and scenarios needed by the behavior and active modules." },
    { id: "challenge", name: "Deterministic challenge", skills: ["robotics-testing", "cad-viewer"], owns: ["robot-digital/evidence/", "robot-digital/decision.json"], dependsOn: ["prototype"], brief: "Repeat nominal and failing scenarios, inspect the model, quantify uncertainty, and publish the sim-to-real gap." },
  ],
  reviewSkills: ["robotics-testing", "cad-viewer"],
  outputs: ["Behavior contract", "Executable digital prototype", "Deterministic scenario suite", "Sim-to-real gap report", "Digital prototype decision receipt"],
  guardrails: ["Do not claim physical safety, durability, manufacturability, calibration, or real-world performance from simulation.", "Do not add subsystems merely to resemble a complete robot.", "Do not command physical equipment or deploy robot software without separate approval.", "Preserve units, frames, solver settings, seeds, and asset provenance."],
  verification: ["Replay nominal and intentionally failing scenarios from a clean environment.", "Challenge the behavior threshold across named perturbations.", "Inspect active-module interfaces and report numerical or modeling instability.", "List every assumption that requires physical evidence."],
  expectations: [
    { id: "behavior-reproduced", statement: "The digital prototype reproducibly performs one contracted behavior.", failureModes: ["nondeterminism", "threshold miss", "hidden manual intervention"], requiredEvidence: ["scenario logs", "seeded replay"] },
    { id: "failure-detected", statement: "The scenario suite detects at least one intentionally failing condition.", failureModes: ["non-falsifiable success", "silent failure"], requiredEvidence: ["negative scenario log"] },
    { id: "sim-gap-explicit", statement: "The receipt states what simulation cannot establish.", failureModes: ["physical claims from simulation", "missing assumptions"], requiredEvidence: ["sim-to-real gap report"] },
    { id: "mechanical-cad-proof", moduleId: "mechanical-cad", statement: "Active geometry and interfaces support the simulated behavior.", failureModes: ["collision mismatch", "invalid joint geometry"], requiredEvidence: ["CAD inspection", "kinematic check"] },
    { id: "locomotion-proof", moduleId: "mobile-locomotion", statement: "The locomotion model meets the behavior threshold under named terrain conditions.", failureModes: ["slip divergence", "unstable contact"], requiredEvidence: ["terrain scenario logs"] },
    { id: "manipulation-proof", moduleId: "manipulation", statement: "The manipulation model reaches and controls the named task.", failureModes: ["unreachable pose", "unstable grasp"], requiredEvidence: ["task replay", "workspace check"] },
    { id: "planning-proof", moduleId: "planning-semantics", statement: "Planning state and failure semantics are explicit and exercised.", failureModes: ["undefined transition", "unhandled no-path"], requiredEvidence: ["state trace", "negative plan"] },
    { id: "ros2-proof", moduleId: "ros2-interface", statement: "The selected ROS 2 interface is coherent and testable.", failureModes: ["frame mismatch", "topic or service contract drift"], requiredEvidence: ["interface test"] },
    { id: "perception-proof", moduleId: "perception", statement: "The selected perception model is tested against named uncertainty.", failureModes: ["perfect-state leakage", "unmodeled noise"], requiredEvidence: ["sensor perturbation test"] },
    { id: "learned-control-proof", moduleId: "learned-control", statement: "The selected learned controller is reproducible and bounded.", failureModes: ["seed sensitivity", "training-test leakage"], requiredEvidence: ["evaluation runs", "model provenance"] },
  ],
  modularOutcome: {
    kind: "modular-outcome", gateName: "Robot digital prototype", action: "Build and challenge",
    contractPath: "robot-digital/contract/behavior.json", moduleDecisionPath: "robot-digital/contract/modules.json", artifactRoot: "robot-digital/", decisionReceiptPath: "robot-digital/decision.json", minimumActiveModules: 1,
    modules: [
      { id: "mechanical-cad", activationWhen: "Geometry, joints, collision, or physical interfaces materially determine the behavior.", work: ["create only behavior-relevant geometry and joints"], checks: ["inspect collisions, limits, units, and interfaces"], requiredExpectationIds: ["mechanical-cad-proof"] },
      { id: "mobile-locomotion", activationWhen: "The behavior requires a mobile base or legged motion.", work: ["model contacts and locomotion control"], checks: ["run terrain and disturbance cases"], requiredExpectationIds: ["locomotion-proof"] },
      { id: "manipulation", activationWhen: "The behavior requires reaching, grasping, or tool interaction.", work: ["model arm, end effector, and task control"], checks: ["test reachability and task failure"], requiredExpectationIds: ["manipulation-proof"] },
      { id: "planning-semantics", activationWhen: "The behavior requires sequencing, planning, or explicit recovery states.", work: ["define states, transitions, and failure semantics"], checks: ["exercise no-path and recovery cases"], requiredExpectationIds: ["planning-proof"] },
      { id: "ros2-interface", activationWhen: "ROS 2 interoperability is an explicit requirement.", work: ["define the minimum message, frame, and lifecycle surface"], checks: ["run interface and frame tests"], requiredExpectationIds: ["ros2-proof"] },
      { id: "perception", activationWhen: "The behavior depends on estimated rather than ground-truth state.", work: ["model the minimum sensor and estimator"], checks: ["inject realistic noise and dropout"], requiredExpectationIds: ["perception-proof"] },
      { id: "learned-control", activationWhen: "A learned policy is essential to the behavior under test.", work: ["preserve training and model provenance"], checks: ["evaluate held-out seeds and perturbations"], requiredExpectationIds: ["learned-control-proof"] },
    ],
    decisions: ["digitally-proven", "repair-required", "no-go"],
    steps: ["Lock one behavior and its falsifiable threshold.", "Build the smallest executable model with fixed units, frames, solver settings, and seeds.", "Run active-module challenges plus at least one negative scenario.", "Separate digital evidence from every claim that still needs physical proof."],
    completionBoundary: "Digitally proven means the contracted behavior passes reproducibly in the declared model; it never means a physical robot is safe, buildable, or commissioned.",
  },
};
