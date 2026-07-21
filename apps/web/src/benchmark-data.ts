export const benchmarkCards = [
  { slug: "billion-dollar-company", packSlug: "billion-dollar-saas", number: "01", label: "$1B COMPANY", title: "The “Make Me a Billion-Dollar Company” Benchmark", shortTitle: "Make me a billion-dollar company", question: "What does each workflow produce from the instruction “Make me Atlassian”?", metric: "Outputs + time", budget: "One prompt · <5 min human", status: "PREVIEW", version: "$1B-0.1" },
  { slug: "kickstarter-funding", packSlug: "kickstarter-funding", number: "02", label: "FUNDING", title: "The Kickstarter Funding Benchmark", shortTitle: "Get it funded", question: "What does each workflow produce from one request to get a rough product funded?", metric: "Outputs + time", budget: "One prompt · <5 min human", status: "PREVIEW", version: "FUNDING-0.1" },
  { slug: "kickstarter-shipped", packSlug: "kickstarter-fulfillment", number: "03", label: "SHIPPING", title: "The Kickstarter-to-Shipped Benchmark", shortTitle: "Get it shipped", question: "What does each workflow produce from one request to ship a funded campaign?", metric: "Outputs + time", budget: "One prompt · <5 min human", status: "PREVIEW", version: "SHIPPED-0.1" },
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
  entries: BenchmarkEntry[];
};

export const benchmarkComparisons: Record<BenchmarkSlug, BenchmarkComparison> = {
  "billion-dollar-company": {
    brief: "Make me Atlassian. Make no mistakes.",
    before: "A rough SaaS idea and a starter repository. No product, market, revenue, trust, or operating system exists yet.",
    entries: [
      {
        workflow: "Direct",
        invocation: "Make me Atlassian. Make no mistakes.",
        agentTime: "22 min",
        humanTime: "1 min",
        summary: "Builds the obvious software surface.",
        artifacts: ["app/", "landing-page/", "README.md"],
      },
      {
        workflow: "/goal",
        invocation: "/goal Make me Atlassian. Make no mistakes.",
        agentTime: "46 min",
        humanTime: "2 min",
        summary: "Adds a durable objective and completion structure.",
        artifacts: ["GOAL.md", "app/", "landing-page/", "tests/", "deploy/", "README.md", "RESULT.md"],
      },
      {
        workflow: "$possible",
        invocation: "$possible Make me Atlassian. Make no mistakes.",
        agentTime: "3 hr 48 min",
        humanTime: "3 min",
        summary: "Compiles the company—not only the app.",
        possible: true,
        artifacts: [
          "company/market/research.md",
          "company/market/segments.md",
          "company/thesis.md",
          "company/evidence-register.md",
          "company/product/app/",
          "company/product/core-flow.md",
          "company/onboarding/",
          "company/product-receipt.md",
          "company/brand/voice.md",
          "company/acquisition/site/",
          "company/distribution/calendar.md",
          "company/distribution/drafts/",
          "company/revenue/pricing.md",
          "company/revenue/ledger.csv",
          "company/sales/playbook.md",
          "company/customer-success/system.md",
          "company/trust/security.md",
          "company/trust/privacy.md",
          "company/reliability/runbook.md",
          "company/release/plan.md",
          "company/operations/cadence.md",
          "company/metrics/definitions.md",
          "company/receipts/first-review.md",
          "company/outcome-receipt.md",
        ],
      },
    ],
  },
  "kickstarter-funding": {
    brief: "Get my product funded on Kickstarter.",
    before: "A rough product idea. No feasibility model, campaign assets, audience system, or funding operation exists yet.",
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
