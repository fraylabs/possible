import { getCatalogEntry, publicCatalog } from "./catalog.js";
import { bundledOutcomePacks } from "./manifest.js";
import { bundledPackShowcases } from "./generated-showcases.js";
import type { PackStatus } from "./types.js";

export { compileInstallCommands, compilePack, compileRunPrompt, skillInstallSource, skillNameFromReference, skillPageUrl, skillSourceUrl } from "./compiler.js";
export { getCatalogEntry, getCatalogNumber, publicCatalog } from "./catalog.js";
export type { PublicCatalogEntry } from "./catalog.js";
export { getPackSearchSummary, hasSharedPackSearchBigram, matchPackSearchTerms, searchPackCatalog, tokenizePackSearch } from "./search.js";
export type { PackCatalogSearchInput, PackCatalogSearchResult } from "./search.js";
export { bundledOutcomePacks, validatePackManifest } from "./manifest.js";
export type { BundledOutcomePack } from "./manifest.js";
export { bundledPackShowcases } from "./generated-showcases.js";
export { companies, getProduct, productCatalog, products, resolveProducts, validateCompanyId, validateCompanyRecord, validateProductId, validateProductRecord } from "./products.js";
export { buildPackCatalog, createFederatedRegistryEntry, defaultPackTrust, formatPackIdentity, parsePackIdentity, validateAcceptedPackSnapshot, validateBundledPackSourceRecord, validateFederatedPackSource, validateFederatedRegistryEntry, validatePackTrustForManifest, validatePackTrustRecord } from "./registry.js";
export type { AcceptedPackEvidence, AcceptedPackSnapshot, BuildPackCatalogInput, BundledPackSourceRecord, CatalogPackOrigin, FederatedPackRegistryEntry, FederatedPackSource, PackCatalogEntry, PackIdentity, PackSourceRecord, PackTrustRecord, Sha256Digest } from "./registry.js";
export type { AgentCheckoutSupport, CompanyId, CompanyRecord, CompiledPack, OutcomePack, PackShowcase, PackShowcaseCad, PackShowcaseCadDownload, PackShowcaseImage, PackShowcaseVideo, PackStatus, PackTrustStatus, ProductAvailability, ProductCategory, ProductCommerce, ProductId, ProductRecord, ResolvedProduct, SkillReference } from "./types.js";

export const activePackCatalog = publicCatalog;
export const listedOutcomePacks = publicCatalog.filter(({ trust }) => trust.status === "listed").map(({ pack }) => pack);
export const experimentalOutcomePacks = publicCatalog.filter(({ trust }) => trust.status === "experimental").map(({ pack }) => pack);
export const verifiedOutcomePacks = publicCatalog.filter(({ trust }) => trust.status === "verified").map(({ pack }) => pack);

export function getPackShowcase(idOrSlug: string) {
  const entry = getCatalogEntry(idOrSlug);
  return entry?.origin.kind === "bundled" ? bundledPackShowcases[entry.slug] : undefined;
}

export function getPackStatus(idOrSlug: string): PackStatus | undefined {
  return getCatalogEntry(idOrSlug)?.trust.status;
}

export function getPack(idOrSlug: string) {
  return getCatalogEntry(idOrSlug)?.pack;
}

export function getActivePack(idOrSlug: string) {
  return getCatalogEntry(idOrSlug)?.pack;
}

export const bundledPackCount = bundledOutcomePacks.length;
