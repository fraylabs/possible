export const benchmarkCards = [
  { slug: "kickstarter-funding", packSlug: "kickstarter-funding", number: "01", label: "FUNDING", title: "The Kickstarter Funding Benchmark", shortTitle: "Get it funded", question: "How much missing funding judgment can each workflow supply from one request?", metric: "Judgment + evidence", budget: "One prompt · <5 min human", status: "MODELED", version: "FUNDING-0.1" },
  { slug: "kickstarter-shipped", packSlug: "kickstarter-fulfillment", number: "02", label: "SHIPPING", title: "The Kickstarter-to-Shipped Benchmark", shortTitle: "Get it shipped", question: "How much missing fulfillment judgment can each workflow supply from one request?", metric: "Judgment + evidence", budget: "One prompt · <5 min human", status: "MODELED", version: "SHIPPED-0.1" },
] as const;

export type BenchmarkSlug = typeof benchmarkCards[number]["slug"];

type BenchmarkEntry = {
  workflow: string;
  invocation: string;
  agentTime: string;
  humanTime: string;
  summary: string;
  artifacts: string[];
  possible?: boolean;
};

type BenchmarkComparison = {
  brief: string;
  before: string;
  judgment: {
    dimension: string;
    direct: { level: "NONE" | "PARTIAL" | "EXPLICIT"; label: string; evidence: string[] };
    goal: { level: "NONE" | "PARTIAL" | "EXPLICIT"; label: string; evidence: string[] };
    possible: { level: "NONE" | "PARTIAL" | "EXPLICIT"; label: string; evidence: string[] };
  }[];
  entries: BenchmarkEntry[];
};

export const benchmarkComparisons: Record<BenchmarkSlug, BenchmarkComparison> = {
  "kickstarter-funding": {
    brief: "Get my product funded on Kickstarter.",
    before: "A rough product idea. No feasibility model, campaign assets, audience system, or funding operation exists yet.",
    judgment: [
      { dimension: "Infers omitted operational scope", direct: { level: "PARTIAL", label: "Campaign presentation", evidence: ["campaign-page/", "pitch-copy.md"] }, goal: { level: "PARTIAL", label: "Feasibility + launch package", evidence: ["feasibility.md", "reward-tiers.md", "launch-plan.md"] }, possible: { level: "EXPLICIT", label: "Feasibility through payout", evidence: ["campaign/feasibility/product-evidence.md", "campaign/economics/costs.csv", "campaign/audience/prelaunch.md", "campaign/operations/decision-loop.md", "campaign/receipts/payout-ledger.csv"] } },
      { dimension: "Separates evidence from assumptions", direct: { level: "NONE", label: "No visible artifact", evidence: [] }, goal: { level: "PARTIAL", label: "Feasibility document only", evidence: ["feasibility.md"] }, possible: { level: "EXPLICIT", label: "Product evidence + claims register", evidence: ["campaign/feasibility/product-evidence.md", "campaign/claims-register.md"] } },
      { dimension: "Surfaces risk and safeguards", direct: { level: "NONE", label: "No visible artifact", evidence: [] }, goal: { level: "PARTIAL", label: "Feasibility only", evidence: ["feasibility.md"] }, possible: { level: "EXPLICIT", label: "Risk + claim controls", evidence: ["campaign/risk-register.md", "campaign/claims-register.md"] } },
      { dimension: "Defines acceptance or decision gates", direct: { level: "NONE", label: "No visible artifact", evidence: [] }, goal: { level: "PARTIAL", label: "Tests, no visible gate", evidence: ["tests/"] }, possible: { level: "EXPLICIT", label: "Go / no-go receipt", evidence: ["campaign/receipts/go-no-go.md"] } },
      { dimension: "Creates durable operating state", direct: { level: "NONE", label: "No visible artifact", evidence: [] }, goal: { level: "NONE", label: "No visible artifact", evidence: [] }, possible: { level: "EXPLICIT", label: "Metrics, zero state, payout ledger", evidence: ["campaign/measurement/metrics.md", "campaign/operations/zero-state.json", "campaign/receipts/payout-ledger.csv"] } },
      { dimension: "Preserves review and completion evidence", direct: { level: "NONE", label: "No visible artifact", evidence: [] }, goal: { level: "PARTIAL", label: "Generic result record", evidence: ["RESULT.md"] }, possible: { level: "EXPLICIT", label: "Render, go / no-go, outcome receipts", evidence: ["campaign/media/render-receipt.md", "campaign/receipts/go-no-go.md", "campaign/outcome-receipt.md"] } },
    ],
    entries: [
      {
        workflow: "Direct",
        invocation: "Get my product funded on Kickstarter.",
        agentTime: "19 min",
        humanTime: "1 min",
        summary: "Creates a campaign-shaped presentation.",
        artifacts: ["campaign-page/", "pitch-copy.md", "hero-image.png"],
      },
      {
        workflow: "/goal",
        invocation: "/goal Get my product funded on Kickstarter.",
        agentTime: "54 min",
        humanTime: "2 min",
        summary: "Adds a target, plan, and launch package.",
        artifacts: ["GOAL.md", "feasibility.md", "campaign-page/", "reward-tiers.md", "film-script.md", "launch-plan.md", "tests/", "RESULT.md"],
      },
      {
        workflow: "$possible",
        invocation: "$possible Get my product funded on Kickstarter.",
        agentTime: "4 hr 12 min",
        humanTime: "3 min",
        summary: "Compiles the complete funding operation.",
        possible: true,
        artifacts: [
          "campaign/feasibility/product-evidence.md",
          "campaign/economics/costs.csv",
          "campaign/economics/funding-goal.md",
          "campaign/risk-register.md",
          "campaign/offer/audience.md",
          "campaign/rewards/tiers.md",
          "campaign/claims-register.md",
          "campaign/page/index.html",
          "campaign/storyboard.md",
          "campaign/media/campaign-film.mp4",
          "campaign/media/render-receipt.md",
          "campaign/audience/prelaunch.md",
          "campaign/calendar/campaign.md",
          "campaign/drafts/social.md",
          "campaign/drafts/email.md",
          "campaign/measurement/metrics.md",
          "campaign/operations/decision-loop.md",
          "campaign/operations/zero-state.json",
          "campaign/receipts/go-no-go.md",
          "campaign/receipts/payout-ledger.csv",
          "campaign/outcome-receipt.md",
        ],
      },
    ],
  },
  "kickstarter-shipped": {
    brief: "Get this funded Kickstarter shipped.",
    before: "A funded campaign and its reward obligations. No production, order, logistics, exception, or backer operation exists yet.",
    judgment: [
      { dimension: "Infers omitted operational scope", direct: { level: "PARTIAL", label: "Shipping plan only", evidence: ["shipping-plan.md"] }, goal: { level: "PARTIAL", label: "Production, orders, exceptions", evidence: ["production-plan.md", "orders.csv", "exceptions.md"] }, possible: { level: "EXPLICIT", label: "Obligations through shipment evidence", evidence: ["fulfillment/campaign-obligations.md", "fulfillment/production/plan.md", "fulfillment/quality/acceptance.md", "fulfillment/inventory/state.csv", "fulfillment/logistics/plan.md", "fulfillment/milestones/shipment-ledger.csv"] } },
      { dimension: "Separates evidence from assumptions", direct: { level: "NONE", label: "No visible artifact", evidence: [] }, goal: { level: "NONE", label: "No visible artifact", evidence: [] }, possible: { level: "PARTIAL", label: "Obligations and shipment evidence; no assumptions register", evidence: ["fulfillment/campaign-obligations.md", "fulfillment/milestones/shipment-ledger.csv"] } },
      { dimension: "Surfaces risk and safeguards", direct: { level: "NONE", label: "No visible artifact", evidence: [] }, goal: { level: "PARTIAL", label: "Exception document", evidence: ["exceptions.md"] }, possible: { level: "EXPLICIT", label: "Quality, privacy, exception controls", evidence: ["fulfillment/quality/acceptance.md", "fulfillment/privacy/boundary.md", "fulfillment/exceptions/queue.csv"] } },
      { dimension: "Defines acceptance or decision gates", direct: { level: "NONE", label: "No visible artifact", evidence: [] }, goal: { level: "NONE", label: "No visible artifact", evidence: [] }, possible: { level: "PARTIAL", label: "Quality acceptance, no visible action gate", evidence: ["fulfillment/quality/acceptance.md"] } },
      { dimension: "Creates durable operating state", direct: { level: "NONE", label: "No visible artifact", evidence: [] }, goal: { level: "PARTIAL", label: "Order ledger only", evidence: ["orders.csv"] }, possible: { level: "EXPLICIT", label: "Orders, inventory, exceptions, control, shipments", evidence: ["fulfillment/orders/ledger.csv", "fulfillment/inventory/state.csv", "fulfillment/exceptions/queue.csv", "fulfillment/control/state.json", "fulfillment/milestones/shipment-ledger.csv"] } },
      { dimension: "Preserves review and completion evidence", direct: { level: "NONE", label: "No visible artifact", evidence: [] }, goal: { level: "PARTIAL", label: "Generic result record", evidence: ["RESULT.md"] }, possible: { level: "EXPLICIT", label: "First-cycle + outcome receipts", evidence: ["fulfillment/receipts/first-cycle.md", "fulfillment/outcome-receipt.md"] } },
    ],
    entries: [
      {
        workflow: "Direct",
        invocation: "Get this funded Kickstarter shipped.",
        agentTime: "14 min",
        humanTime: "1 min",
        summary: "Produces a high-level shipping plan.",
        artifacts: ["shipping-plan.md", "backer-update.md"],
      },
      {
        workflow: "/goal",
        invocation: "/goal Get this funded Kickstarter shipped.",
        agentTime: "47 min",
        humanTime: "2 min",
        summary: "Adds milestones, ownership, and a completion record.",
        artifacts: ["GOAL.md", "production-plan.md", "orders.csv", "shipping-plan.md", "backer-updates/", "exceptions.md", "RESULT.md"],
      },
      {
        workflow: "$possible",
        invocation: "$possible Get this funded Kickstarter shipped.",
        agentTime: "5 hr 20 min",
        humanTime: "3 min",
        summary: "Compiles the production-to-95%-shipped operation.",
        possible: true,
        artifacts: [
          "fulfillment/campaign-obligations.md",
          "fulfillment/production/plan.md",
          "fulfillment/quality/acceptance.md",
          "fulfillment/suppliers/dependencies.md",
          "fulfillment/backers/schema.md",
          "fulfillment/orders/ledger.csv",
          "fulfillment/privacy/boundary.md",
          "fulfillment/inventory/state.csv",
          "fulfillment/logistics/plan.md",
          "fulfillment/exceptions/queue.csv",
          "fulfillment/communications/cadence.md",
          "fulfillment/updates/drafts.md",
          "fulfillment/support/playbook.md",
          "fulfillment/control/state.json",
          "fulfillment/receipts/first-cycle.md",
          "fulfillment/schedule/task.md",
          "fulfillment/milestones/shipment-ledger.csv",
          "fulfillment/outcome-receipt.md",
        ],
      },
    ],
  },
};

export function getBenchmark(slug: string) {
  return benchmarkCards.find((benchmark) => benchmark.slug === slug);
}
