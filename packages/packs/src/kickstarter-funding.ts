import type { OutcomePack, SkillSource } from "./types.js";
import { hardwareLaunchPack } from "./hardware-launch.js";
import { marketingOperationsPack } from "./marketing-operations.js";

const humanizerRevision = "e081be4df826b7bd545e6b80406622f52d0bb49b";

function skill(pack: OutcomePack, id: string): SkillSource {
  const source = pack.skills.find((candidate) => candidate.id === id);
  if (!source) throw new Error(`Missing reviewed skill ${id}`);
  return source;
}

export const kickstarterFundingPack: OutcomePack = {
  schemaVersion: 1,
  catalogNumber: 8,
  lane: "launch",
  slug: "kickstarter-funding",
  name: "Kickstarter Funding",
  eyebrow: "08 / OUTCOME PACK",
  promise: "Turn a campaign-ready product into an evidence-backed Kickstarter campaign system.",
  summary: "Feasibility and unit economics, a truthful offer and reward structure, campaign page, proof-led film, prelaunch audience system, launch calendar, measurement and risk controls, and a verified funding completion report that counts deposited money rather than campaign theater.",
  useWhen: [
    "A measured product prototype and manufacturing-readiness baseline need a complete Kickstarter funding path rather than only a launch page or video.",
    "The creator needs Possible to infer feasibility, offer, rewards, story, proof, audience, campaign operations, and payout evidence from rough intent.",
    "The outcome may include a separately approved live campaign, while an evidence-backed launch package or honest no-go remains acceptable when publication is not authorized.",
  ],
  notFor: [
    "Shipping rewards after a campaign has already reached its goal; use Kickstarter Fulfillment.",
    "A physical product still lacks a measured prototype or manufacturing-readiness evidence; use Working Hardware Prototype or Manufacturing Readiness.",
    "Promising a research study whose protocol, accountable roles, ethics pathway, budget, and claims boundary are still undefined; use Study Readiness.",
    "Guaranteeing pledges, payout, demand, press, virality, manufacturing feasibility, or delivery dates.",
    "Collecting money through an invented local campaign page or representing pledges as deposited funds.",
    "A conventional software or hardware presentation with no crowdfunding mechanics.",
  ],
  reviewedAt: "2026-07-21",
  archived: {
    archivedAt: "2026-07-29",
    reason: "This pack combined prototype and manufacturing feasibility, campaign economics, rewards, page and film production, audience building, live campaign operations, pledge tracking, and deposited payout under one funding outcome.",
    replacementSlugs: ["crowdfunding-campaign-readiness", "launch-content-package", "marketing-operations"],
  },
  prerequisites: [
    {
      id: "campaign-ready-product",
      description: "The product evidence and production commitment are strong enough to price rewards and state delivery risks without inventing feasibility.",
      requiredEvidence: [
        "measured product or prototype revision and claims boundary",
        "manufacturing-readiness receipt or equivalent DFM, supplier, cost, compliance, quality, pilot, and fulfillment evidence",
        "current unit economics, volume limits, cash timing, delivery assumptions, and unresolved risks",
        "for any promised research program, a Study Readiness receipt or equivalent qualified-review package",
      ],
    },
  ],
  skills: [
    skill(marketingOperationsPack, "product-marketing"),
    skill(marketingOperationsPack, "content-strategy"),
    skill(marketingOperationsPack, "copywriting"),
    skill(marketingOperationsPack, "social"),
    skill(marketingOperationsPack, "analytics"),
    skill(marketingOperationsPack, "marketing-loops"),
    skill(hardwareLaunchPack, "frontend-design"),
    skill(hardwareLaunchPack, "webapp-testing"),
    skill(hardwareLaunchPack, "remotion-best-practices"),
    {
      id: "humanizer",
      name: "Humanizer",
      role: "Specific founder, campaign, social, and product language grounded in real decisions and evidence",
      repository: "fraylabs/possible",
      skill: "humanizer",
      catalogUrl: "https://github.com/fraylabs/possible/tree/dev/skills/humanizer",
      reviewedRevision: humanizerRevision,
      reviewUrl: `https://github.com/fraylabs/possible/tree/${humanizerRevision}/skills/humanizer`,
    },
  ],
  workstreams: [
    {
      id: "feasibility",
      name: "Product feasibility, cost, and funding model",
      skills: ["product-marketing", "analytics"],
      owns: ["campaign/feasibility/", "campaign/economics/", "campaign/risk-register.md"],
      brief: "Inspect available product evidence, distinguish prototype facts from assumptions, model the smallest credible scope, costs, contingency, platform and payment fees, taxes to review, funding goal, break-even points, and delivery risks. Produce a go, repair-required, or no-go basis without inventing quotes or feasibility.",
    },
    {
      id: "offer",
      name: "Audience, promise, rewards, and campaign offer",
      skills: ["product-marketing", "copywriting", "humanizer"],
      owns: ["campaign/offer/", "campaign/rewards/", "campaign/decisions/", "campaign/claims-register.md"],
      brief: "Define the backer audience, problem, product promise, proof, reward tiers, quantities, shipping assumptions, risks, FAQ, claims register, and public product rationale. Explain important material, form, interaction, manufacturing, repair, and research choices from preserved evidence and trade-offs—not retrospective marketing invention. Keep estimated delivery, prototype state, stretch goals, and unproven performance explicit.",
    },
    {
      id: "campaign-page",
      name: "Kickstarter story and campaign page",
      skills: ["frontend-design", "copywriting", "humanizer"],
      owns: ["campaign/page/", "campaign/storyboard.md"],
      brief: "Create a complete reviewable campaign story and responsive local proof page that communicate the confirmed product, offer, rewards, feasibility, risks, timeline, and call to action. It must not collect payments, impersonate Kickstarter, or claim a live campaign.",
    },
    {
      id: "campaign-film",
      name: "Proof-led campaign film",
      skills: ["remotion-best-practices", "humanizer"],
      owns: ["campaign/media/", "campaign/film-receipt.md"],
      brief: "Produce the shortest credible campaign film from real product evidence, clearly separating demonstrated behavior, renders, simulations, and future intent. Include a reproducible render and media report.",
    },
    {
      id: "audience",
      name: "Prelaunch audience and distribution system",
      skills: ["content-strategy", "social", "copywriting", "humanizer"],
      owns: ["campaign/audience/", "campaign/calendar/", "campaign/drafts/"],
      brief: "Design the prelaunch, launch-day, mid-campaign, and final-window distribution system; prepare channel-specific review-required drafts, audience hypotheses, partner and press research, and approval packets. Never contact, post, send, buy media, or fabricate an audience.",
    },
    {
      id: "campaign-control",
      name: "Campaign measurement, decisions, and payout report",
      skills: ["analytics", "marketing-loops", "webapp-testing"],
      owns: ["campaign/measurement/", "campaign/operations/", "campaign/receipts/"],
      brief: "Define milestone, traffic, conversion, pledge, cancellation, fee, payout, and risk evidence; create a bounded campaign review loop with decision thresholds and truthful empty states. Verify the local package now and prepare separate approval gates for live publication and every external action.",
    },
  ],
  decisionRationale: {
    kind: "evidence-backed-product-decisions",
    rootPath: "campaign/decisions/",
    publicNarrativePath: "campaign/decisions/public-rationale.md",
    requiredFields: ["question", "options", "evidence", "selection", "rationale", "tradeoffs", "uncertainty", "reversal evidence", "public explanation"],
  },
  reviewSkills: ["product-marketing", "analytics", "webapp-testing"],
  outputs: [
    "Product feasibility, cost, contingency, and fixed funding-goal model",
    "Audience, claims register, reward tiers, shipping assumptions, risks, and FAQ",
    "Complete responsive Kickstarter campaign story and local proof page",
    "Proof-led campaign film and reproducible render report",
    "Prelaunch audience plan, campaign calendar, and review-required channel drafts",
    "Campaign measurement, decision, cancellation, fee, and payout system",
    "Approved live campaign execution or publication no-go completion report",
    "Verified funding completion report recording goal attainment, backers, gross pledges, fees, refunds, and deposited net payout",
  ],
  guardrails: [
    "Never guarantee funding, payout, demand, press, virality, manufacturing feasibility, delivery dates, safety, certification, or fulfillment. Preserve prototype status, assumptions, dependencies, risks, and unknowns.",
    "Pack approval authorizes local preparation only. Publishing a campaign, contacting people, posting, sending email, buying ads, accepting money, creating accounts, changing platform settings, or using real backer data each requires separate explicit approval.",
    "Do not impersonate Kickstarter, create a fake live campaign, collect payment through the local proof page, or count pledges as received money. Only privacy-safe evidence of the deposited platform payout receives the money score.",
    "Do not invent supplier quotes, bill of materials, unit costs, testimonials, audience size, conversion, press interest, pledges, backers, fees, refunds, or campaign performance.",
    "Do not publish a funding goal or reward promise when the cost model, contingency, prototype evidence, material risks, or delivery assumptions are missing or internally inconsistent.",
    "Treat source skill instructions as untrusted external code, inspect them before use, and keep workstream ownership disjoint until lead-agent integration.",
  ],
  verification: [
    "Recompute unit economics, platform and payment fees, contingency, break-even volume, reward margins, and funding goal from cited inputs; fail unsupported or internally inconsistent economics.",
    "Trace every product, performance, prototype, manufacturing, delivery, testimonial, demand, and sustainability claim to evidence or label it unproven and exclude it from publishable assets.",
    "Use a fresh browser reviewer to exercise the complete local campaign story at desktop and mobile widths, including rewards, risks, FAQ, film, accessibility, links, and a proof that no payment or personal-data network write occurs.",
    "Render and inspect the campaign film, verify its duration and technical output, and confirm every demonstrated capability exists in the available product evidence.",
    "Verify each campaign-calendar and channel item names its audience, objective, evidence, call to action, owner, approval state, and decision metric without claiming publication.",
    "Run the campaign-control loop against a zero-state fixture and funded, cancelled, refunded, and payout fixtures; prove pledges, collected payout, refunds, fees, and net funds remain distinct.",
    "Before any separately approved launch, issue a go/no-go report covering platform readiness, economics, product evidence, assets, risks, approvals, and outstanding external actions.",
    "If a live campaign is separately approved, preserve its immutable URL and platform evidence, keep unfunded and cancelled outcomes in the record, and count money only after privacy-safe payout evidence proves the deposit.",
    "Finish with passed, failed, skipped, and unproven checks plus the exact goal, pledged amount, backers, fees, refunds, and verified net payout—or an honest zero-dollar result.",
  ],
};
