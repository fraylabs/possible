import castDrivenProductStoryAnimationManifest from "./manifests/cast-driven-product-story-animation.json" with { type: "json" };
import crowdfundingCampaignReadinessManifest from "./manifests/crowdfunding-campaign-readiness.json" with { type: "json" };
import crowdfundingFulfillmentOperationsManifest from "./manifests/crowdfunding-fulfillment-operations.json" with { type: "json" };
import crowdfundingFundingRunManifest from "./manifests/crowdfunding-funding-run.json" with { type: "json" };
import htmlCssAnimatedProductLaunchFilmManifest from "./manifests/html-css-animated-product-launch-film.json" with { type: "json" };
import developerAdoptionReadinessManifest from "./manifests/developer-adoption-readiness.json" with { type: "json" };
import developerProductReadinessManifest from "./manifests/developer-product-readiness.json" with { type: "json" };
import developerProjectLaunchManifest from "./manifests/developer-project-launch.json" with { type: "json" };
import firstCustomerSprintManifest from "./manifests/first-customer-sprint.json" with { type: "json" };
import functionalHardwarePrototypeManifest from "./manifests/functional-hardware-prototype.json" with { type: "json" };
import hardwareLaunchManifest from "./manifests/hardware-launch.json" with { type: "json" };
import kickstarterFulfillmentManifest from "./manifests/kickstarter-fulfillment.json" with { type: "json" };
import kickstarterFundingManifest from "./manifests/kickstarter-funding.json" with { type: "json" };
import launchContentCampaignManifest from "./manifests/launch-content-campaign.json" with { type: "json" };
import launchContentPackageManifest from "./manifests/launch-content-package.json" with { type: "json" };
import manufacturingReadinessManifest from "./manifests/manufacturing-readiness.json" with { type: "json" };
import marketingOperationsManifest from "./manifests/marketing-operations.json" with { type: "json" };
import mechanicalCadReviewManifest from "./manifests/mechanical-cad-review.json" with { type: "json" };
import openSourceReleaseManifest from "./manifests/open-source-release.json" with { type: "json" };
import originalStrudelSoundtrackManifest from "./manifests/original-strudel-soundtrack.json" with { type: "json" };
import playableWebGameManifest from "./manifests/playable-web-game.json" with { type: "json" };
import productionReadinessDecisionManifest from "./manifests/production-readiness-decision.json" with { type: "json" };
import productionWebReleaseManifest from "./manifests/production-web-release.json" with { type: "json" };
import researchProtocolReadinessManifest from "./manifests/research-protocol-readiness.json" with { type: "json" };
import robotDigitalPrototypeManifest from "./manifests/robot-digital-prototype.json" with { type: "json" };
import robotPrototypeManifest from "./manifests/robot-prototype.json" with { type: "json" };
import softwareOpportunityDiscoveryManifest from "./manifests/software-opportunity-discovery.json" with { type: "json" };
import studyReadinessManifest from "./manifests/study-readiness.json" with { type: "json" };
import webAppOperationsManifest from "./manifests/web-app-operations.json" with { type: "json" };
import webPresentationManifest from "./manifests/web-presentation.json" with { type: "json" };
import websiteReferenceReconstructionManifest from "./manifests/website-reference-reconstruction.json" with { type: "json" };
import workingHardwarePrototypeManifest from "./manifests/working-hardware-prototype.json" with { type: "json" };
import workingWebAppManifest from "./manifests/working-web-app.json" with { type: "json" };
import type { OutcomePack } from "./types.js";

const SAFE_SLUG = /^[a-z0-9][a-z0-9-]*$/;
const SEMVER = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/;
const PACK_KEYS = new Set([
  "schemaVersion", "packVersion", "visibility", "lifecycle", "lane", "slug", "name", "eyebrow", "promise", "summary",
  "reviewedAt", "useWhen", "notFor", "skills", "workstreams", "reviewSkills", "outputs", "guardrails", "verification",
  "expectations", "archived",
]);
const SKILL_KEYS = new Set(["id", "name", "role", "repository", "installSource", "installMode", "skill", "catalogUrl", "reviewedRevision", "reviewUrl"]);
const WORKSTREAM_KEYS = new Set(["id", "name", "skills", "owns", "brief", "dependsOn", "activation"]);
const EXPECTATION_KEYS = new Set(["id", "statement", "level", "failureModes", "requiredEvidence"]);
const ARCHIVED_KEYS = new Set(["archivedAt", "reason", "replacementSlugs"]);

const asRecord = (value: unknown, context: string): Record<string, unknown> => {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${context} must be a JSON object`);
  }
  return value as Record<string, unknown>;
};

const requiredString = (record: Record<string, unknown>, key: string, context: string): string => {
  const value = record[key];
  if (typeof value !== "string" || value.trim().length === 0) throw new Error(`${context}.${key} must be a non-empty string`);
  return value;
};

const requiredArray = (record: Record<string, unknown>, key: string, context: string, allowEmpty = false): unknown[] => {
  const value = record[key];
  if (!Array.isArray(value) || (!allowEmpty && value.length === 0)) throw new Error(`${context}.${key} must be a ${allowEmpty ? "JSON array" : "non-empty array"}`);
  return value;
};

const uniqueIds = (values: unknown[], key: string, context: string): void => {
  const ids = values.map((value, index) => requiredString(asRecord(value, `${context}.${key}[${index}]`), "id", `${context}.${key}[${index}]`));
  if (new Set(ids).size !== ids.length) throw new Error(`${context}.${key} contains duplicate ids`);
};

/** Validate a JSON manifest before it enters the compiler or a local run. */
export function validatePackManifest(input: unknown, context = "pack"): OutcomePack {
  const pack = asRecord(input, context);
  for (const key of Object.keys(pack)) if (!PACK_KEYS.has(key)) throw new Error(`${context}.${key} is not part of the standard prompt, skills, and expectations contract`);
  if (pack.schemaVersion !== 1) throw new Error(`${context}.schemaVersion must be 1`);
  const slug = requiredString(pack, "slug", context);
  if (!SAFE_SLUG.test(slug)) throw new Error(`${context}.slug must be a lowercase hyphenated identifier`);
  const packVersion = requiredString(pack, "packVersion", context);
  if (!SEMVER.test(packVersion)) throw new Error(`${context}.packVersion must be a semantic version`);
  if (pack.visibility !== "private" && pack.visibility !== "public") throw new Error(`${context}.visibility must be private or public`);
  if (pack.lifecycle !== "draft" && pack.lifecycle !== "reviewed" && pack.lifecycle !== "archived") throw new Error(`${context}.lifecycle must be draft, reviewed, or archived`);
  if (pack.lifecycle === "reviewed" && typeof pack.reviewedAt !== "string") throw new Error(`${context}.reviewedAt is required for reviewed packs`);
  if (pack.lifecycle === "archived" && pack.archived === undefined) throw new Error(`${context}.archived metadata is required for archived packs`);
  if (pack.lifecycle !== "archived" && pack.archived !== undefined) throw new Error(`${context}.archived is only valid for archived packs`);
  for (const key of ["name", "eyebrow", "promise", "summary"]) requiredString(pack, key, context);
  const draft = pack.lifecycle === "draft";
  for (const key of ["useWhen", "notFor", "skills", "workstreams", "reviewSkills", "outputs", "guardrails", "verification"]) requiredArray(pack, key, context, draft);
  const skills = pack.skills as unknown[];
  uniqueIds(skills, "skills", context);
  const skillIds = new Set(skills.map((value, index) => requiredString(asRecord(value, `${context}.skills[${index}]`), "id", `${context}.skills[${index}]`)));
  for (const [index, value] of skills.entries()) {
    const skill = asRecord(value, `${context}.skills[${index}]`);
    for (const key of Object.keys(skill)) if (!SKILL_KEYS.has(key)) throw new Error(`${context}.skills[${index}].${key} is not a supported skill field`);
    for (const key of ["name", "role", "repository", "skill", "reviewedRevision", "reviewUrl"]) requiredString(skill, key, `${context}.skills[${index}]`);
    if (skill.installMode !== undefined && skill.installMode !== "selective" && skill.installMode !== "full-depth") {
      throw new Error(`${context}.skills[${index}].installMode must be selective or full-depth`);
    }
  }
  const workstreams = pack.workstreams as unknown[];
  uniqueIds(workstreams, "workstreams", context);
  for (const [index, value] of workstreams.entries()) {
    const workstream = asRecord(value, `${context}.workstreams[${index}]`);
    for (const key of Object.keys(workstream)) if (!WORKSTREAM_KEYS.has(key)) throw new Error(`${context}.workstreams[${index}].${key} is not a supported workstream field`);
    for (const key of ["name", "brief", "skills", "owns"]) {
      if (key === "skills" || key === "owns") requiredArray(workstream, key, `${context}.workstreams[${index}]`);
      else requiredString(workstream, key, `${context}.workstreams[${index}]`);
    }
    for (const skill of workstream.skills as unknown[]) if (typeof skill !== "string" || !skillIds.has(skill)) throw new Error(`${context}.workstreams[${index}] references an unknown skill`);
  }
  if (!draft && pack.expectations === undefined) throw new Error(`${context}.expectations is required for reviewed and archived packs`);
  if (pack.expectations !== undefined) {
    const expectations = requiredArray(pack, "expectations", context, draft);
    uniqueIds(expectations, "expectations", context);
    for (const [index, value] of expectations.entries()) {
      const expectation = asRecord(value, `${context}.expectations[${index}]`);
      for (const key of Object.keys(expectation)) if (!EXPECTATION_KEYS.has(key)) throw new Error(`${context}.expectations[${index}].${key} is not a supported checklist field`);
      requiredString(expectation, "statement", `${context}.expectations[${index}]`);
      requiredArray(expectation, "failureModes", `${context}.expectations[${index}]`);
      requiredArray(expectation, "requiredEvidence", `${context}.expectations[${index}]`);
      if (expectation.level !== undefined && expectation.level !== "required" && expectation.level !== "preferred") {
        throw new Error(`${context}.expectations[${index}].level must be required or preferred`);
      }
    }
  }
  if (pack.archived !== undefined) {
    const archived = asRecord(pack.archived, `${context}.archived`);
    for (const key of Object.keys(archived)) if (!ARCHIVED_KEYS.has(key)) throw new Error(`${context}.archived.${key} is not a supported archive field`);
    requiredString(archived, "archivedAt", `${context}.archived`);
    requiredString(archived, "reason", `${context}.archived`);
    requiredArray(archived, "replacementSlugs", `${context}.archived`, true);
  }
  return pack as unknown as OutcomePack;
}

// Keep this order aligned with the public catalog. Presentation numbers are derived separately in catalog.ts.
const rawPublicManifests: unknown[] = [
  hardwareLaunchManifest,
  openSourceReleaseManifest,
  playableWebGameManifest,
  webAppOperationsManifest,
  workingWebAppManifest,
  productionWebReleaseManifest,
  marketingOperationsManifest,
  kickstarterFundingManifest,
  kickstarterFulfillmentManifest,
  robotPrototypeManifest,
  webPresentationManifest,
  developerProjectLaunchManifest,
  softwareOpportunityDiscoveryManifest,
  firstCustomerSprintManifest,
  workingHardwarePrototypeManifest,
  launchContentCampaignManifest,
  manufacturingReadinessManifest,
  studyReadinessManifest,
  mechanicalCadReviewManifest,
  functionalHardwarePrototypeManifest,
  launchContentPackageManifest,
  crowdfundingCampaignReadinessManifest,
  developerAdoptionReadinessManifest,
  robotDigitalPrototypeManifest,
  productionReadinessDecisionManifest,
  researchProtocolReadinessManifest,
  crowdfundingFundingRunManifest,
  crowdfundingFulfillmentOperationsManifest,
  developerProductReadinessManifest,
  htmlCssAnimatedProductLaunchFilmManifest,
  originalStrudelSoundtrackManifest,
  websiteReferenceReconstructionManifest,
  castDrivenProductStoryAnimationManifest,
];

export const publicOutcomePacks = rawPublicManifests.map((manifest, index) => validatePackManifest(manifest, `publicPacks[${index}]`));
