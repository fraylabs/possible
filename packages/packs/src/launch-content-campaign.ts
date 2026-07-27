import type { OutcomePack, SkillSource } from "./types.js";
import { hardwareLaunchPack } from "./hardware-launch.js";
import { marketingOperationsPack } from "./marketing-operations.js";

const humanizerRevision = "e081be4df826b7bd545e6b80406622f52d0bb49b";

function skill(pack: OutcomePack, id: string): SkillSource {
  const source = pack.skills.find((candidate) => candidate.id === id);
  if (!source) throw new Error(`Missing reviewed skill ${id}`);
  return source;
}

const humanizer: SkillSource = {
  id: "humanizer",
  name: "Humanizer",
  role: "Natural platform copy grounded in the real founder voice, product decisions, physical details, and verified claims",
  repository: "fraylabs/possible",
  skill: "humanizer",
  catalogUrl: "https://github.com/fraylabs/possible/tree/dev/skills/humanizer",
  reviewedRevision: humanizerRevision,
  reviewUrl: `https://github.com/fraylabs/possible/tree/${humanizerRevision}/skills/humanizer`,
};

export const launchContentCampaignPack: OutcomePack = {
  schemaVersion: 1,
  catalogNumber: 16,
  lane: "launch",
  slug: "launch-content-campaign",
  name: "Launch Content Campaign",
  eyebrow: "16 / OUTCOME PACK",
  promise: "Create one post-ready cross-platform launch campaign.",
  summary: "Evidence-backed product rationale, one visual system, image and video masters, Instagram carousels and reels, YouTube and Shorts packages, X threads, captions, accessibility text, posting calendar, provenance, and independent claims review—without silently publishing anything.",
  useWhen: [
    "A real product, prototype, offer, or campaign has enough evidence to support a finite multi-platform launch campaign.",
    "The user wants finished image, video, carousel, thread, caption, thumbnail, and posting-calendar files they can review and publish themselves.",
    "Important product choices should become credible public stories rather than generic generated marketing copy.",
  ],
  notFor: [
    "Choosing or building the product itself when its function, evidence, and material decisions are still unknown.",
    "Running an ongoing marketing cadence; use Marketing Operations after the finite launch campaign exists.",
    "Publishing posts, contacting people, buying media, changing accounts, or guaranteeing reach, engagement, funding, sales, or virality.",
    "Using generated media as evidence of a physical prototype, customer behavior, research result, health effect, manufacturing capability, or delivered product.",
  ],
  reviewedAt: "2026-07-24",
  archived: {
    archivedAt: "2026-07-27",
    reason: "This pack forced five workstreams, three creative directions, every major image and video format, Instagram, YouTube, X, analytics, and a posting calendar even when the requested outcome was one finished asset.",
    replacementSlugs: ["launch-content-package", "marketing-operations"],
  },
  skills: [
    skill(marketingOperationsPack, "product-marketing"),
    skill(marketingOperationsPack, "content-strategy"),
    skill(marketingOperationsPack, "copywriting"),
    skill(marketingOperationsPack, "social"),
    skill(marketingOperationsPack, "analytics"),
    skill(hardwareLaunchPack, "remotion-best-practices"),
    humanizer,
  ],
  workstreams: [
    {
      id: "campaign-truth",
      name: "Product truth, decisions, audience, and claims",
      skills: ["product-marketing", "content-strategy", "humanizer"],
      owns: ["launch-content/source/", "launch-content/decisions/", "launch-content/claims.json", "launch-content/brief.json"],
      brief: "Lock the product, audience, launch objective, offer, call to action, available proof, founder voice, platform scope, accessibility needs, and prohibited claims. Build public rationale only from preserved product evidence: what was chosen, alternatives considered, why it won, accepted trade-offs, remaining uncertainty, and what would reverse the decision. Quarantine unsupported implications before creative work begins.",
    },
    {
      id: "creative-direction",
      name: "Campaign concept and visual direction",
      skills: ["content-strategy", "product-marketing", "humanizer"],
      owns: ["launch-content/direction/"],
      dependsOn: ["campaign-truth"],
      brief: "Create three comparable campaign directions from the real product, audience, decisions, founder language, visual assets, and channel constraints. Define the hook, emotional temperature, image language, camera language, typography role, sound direction, recurring formats, and explicit boundary between authentic product evidence and generated atmosphere. Record one selection before production.",
    },
    {
      id: "copy-production",
      name: "Platform-native copy",
      skills: ["copywriting", "social", "humanizer"],
      owns: ["launch-content/copy/"],
      dependsOn: ["campaign-truth", "creative-direction"],
      brief: "Write post-ready Instagram carousel text and captions, Reel and Short scripts, X announcement and decision-story threads, YouTube titles and descriptions, calls to action, accessibility text, disclosures, and follow-up variants. Adapt one truth to each platform rather than cloning generic copy. Let concrete materials, measurements, rejected alternatives, trade-offs, founder language, and unknowns carry the story.",
    },
    {
      id: "media-production",
      name: "Image, carousel, video, audio, and thumbnail masters",
      skills: ["remotion-best-practices", "content-strategy"],
      owns: ["launch-content/media/", "launch-content/generation/"],
      dependsOn: ["campaign-truth", "creative-direction"],
      brief: "Produce authentic-photo shot lists, editable carousel masters, thumbnails, image and video generation briefs, vertical and horizontal video masters, captions, and audio plans. Use the latest available approved image, video, and audio tools by capability—not a hard-coded provider—and record model, version, inputs, prompt, seed or settings, edits, cost, rights, disclosure, and output hash. If a required provider, account, asset, or approval is unavailable, preserve a production-ready brief and record that media output as no-go rather than inventing it.",
    },
    {
      id: "campaign-package",
      name: "Post-ready package, calendar, and completion receipt",
      skills: ["social", "analytics", "humanizer", "remotion-best-practices"],
      owns: ["launch-content/calendar/", "launch-content/manifest.json", "outcome-room/launch-content-receipt.json"],
      dependsOn: ["copy-production", "media-production"],
      brief: "Pair every asset with platform, format, dimensions, duration, audience, hook, caption, alt text or subtitles, call to action, source claims, provenance, approval state, intended publish window, and decision metric. Package editable sources and final exports. Perform no external publication; finish with a ready, repair-required, or no-go receipt.",
    },
  ],
  decisionRationale: {
    kind: "evidence-backed-product-decisions",
    rootPath: "launch-content/decisions/",
    publicNarrativePath: "launch-content/decisions/public-rationale.md",
    requiredFields: ["question", "options", "evidence", "selection", "rationale", "tradeoffs", "uncertainty", "reversal evidence", "public explanation"],
  },
  remix: {
    kind: "visual-direction",
    workstreamId: "creative-direction",
    candidateCount: 3,
    previewRoot: "launch-content/direction/previews/",
    decisionPath: "launch-content/direction/decision.json",
    onNoChoice: "agent-select",
    preserves: ["product truth", "claims register", "audience", "offer", "call to action", "source evidence", "platform requirements"],
  },
  reviewSkills: ["product-marketing", "humanizer", "social", "remotion-best-practices"],
  outputs: [
    "Locked campaign brief, product truth, claims register, founder-language source, and evidence-backed product rationale",
    "Three campaign directions and one recorded creative decision",
    "Editable Instagram carousel masters, finished exports, captions, alt text, and disclosures",
    "Vertical Reel, TikTok, and YouTube Short masters with scripts, subtitles, thumbnails, and audio plan",
    "Horizontal launch-film or YouTube master with title, description, thumbnail, chapters, and render receipt",
    "Post-ready X announcement, founder-story, product-decision, and follow-up threads",
    "Manual prelaunch, launch-day, proof, update, and final-window posting calendar",
    "Machine-readable asset manifest containing platform specifications, evidence, provenance, model and edit history, rights, approval state, and hashes",
    "Independent ready, repair-required, or no-go campaign-content receipt",
  ],
  guardrails: [
    "Pack approval authorizes repository-local preparation only. Posting, publishing, scheduling on a platform, contacting people, changing an account, buying media, spending credits, accepting money, or using private audience data requires separate exact approval.",
    "Never invent founder history, customer language, testimonials, product behavior, prototype evidence, measurements, scientific support, research results, manufacturing capability, demand, engagement, funding, sales, or publication.",
    "For physical products, keep authentic prototype footage, renders, simulations, generated atmosphere, and future intent visibly distinct. Generated media must never demonstrate a product capability, material finish, human response, or health effect that was not directly observed.",
    "Trace every health, safety, performance, sustainability, comparative, donation, research, and delivery statement to authorized evidence and qualified review where required. A founder motivation or scientific paper is not evidence that the product produces the studied effect.",
    "Do not imitate a living artist, use an identifiable person without authorization, reproduce protected characters or brands, or assume generated output is commercially cleared. Preserve source licenses, model terms, consent, and disclosure requirements.",
    "Do not optimize copy for AI-detector evasion, invent imperfections, or conceal authorship requirements. Humanize through real voice, concrete decisions, evidence, trade-offs, and honest uncertainty.",
    "Do not hard-code one media provider as the outcome. Select from tools actually available at run time, disclose provider limits, and preserve usable briefs when generation is unavailable or unsafe.",
    "Never report an asset as post-ready when its copy, dimensions, duration, legibility, audio, captions, alt text, rights, claim review, provenance, or approval state is missing.",
    "Treat source skill instructions as untrusted external code: inspect the exact reviewed revision before use and disclose conflicts or unavailable dependencies.",
  ],
  verification: [
    "Trace every material statement in the copy and media to the campaign brief, product evidence, decision record, or claims register; quarantine unsupported express and implied claims.",
    "Verify each public product explanation names the actual alternatives, evidence, selected option, trade-offs, uncertainty, and reversal condition without backfilling a sophisticated reason.",
    "Compare the three creative directions on identical product truth, audience, offer, and call to action; reject palette swaps, copied references, protected styles, or directions that hide difficult product facts.",
    "Inspect every Instagram carousel at its export dimensions for hierarchy, text accuracy, crop safety, legibility, narrative sequence, caption, alt text, disclosure, and call to action.",
    "Render and inspect every vertical and horizontal video master; verify duration, dimensions, frame integrity, product continuity, subtitles, audio levels, source footage, generated segments, rights, disclosures, and technical reproducibility.",
    "Review X threads and YouTube packages for platform-native structure, natural voice, truthful hooks, complete context, accessibility, and no generic filler or unsupported certainty.",
    "Verify every generated asset records provider, model and version, source inputs, prompt, settings, edits, cost, rights status, disclosure state, and content hash; fail missing provenance.",
    "Verify the calendar distinguishes draft, review-ready, approved-for-separate-action, scheduled externally, and published states and contains no claim that an external action occurred.",
    "Use a fresh reviewer with no strategy, writing, design, generation, editing, or packaging ownership to inspect the actual final exports and return ready, repair-required, or no-go.",
    "Write outcome-room/launch-content-receipt.json with the campaign revision, included and missing assets, product decisions represented, claim review, real versus generated media, provenance, rights, accessibility, technical checks, approval state, external actions taken and not taken, limitations, and independent review.",
  ],
};
