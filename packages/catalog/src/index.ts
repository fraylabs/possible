export { getOutcome, outcomeCatalog } from "./catalog.js";
export { bundledOutcomes, validateOutcome } from "./outcomes.js";
export { searchOutcomes, tokenizeOutcomeSearch } from "./search.js";
export type { OutcomeSearchInput, OutcomeSearchResult } from "./search.js";
export {
  companies,
  getProduct,
  productCatalog,
  products,
  resolveProducts,
  validateCompanyId,
  validateCompanyRecord,
  validateProductId,
  validateProductRecord,
} from "./products.js";
export type {
  CompanyId,
  CompanyRecord,
  Outcome,
  OutcomeAuthor,
  OutcomeCatalogEntry,
  OutcomeExecution,
  OutcomeFile,
  OutcomeFileType,
  OutcomeSource,
  OutcomePreview,
  OutcomePreviewAudio,
  OutcomePreviewCad,
  OutcomePreviewCadDownload,
  OutcomePreviewImage,
  OutcomePreviewVideo,
  ProductCategory,
  ProductId,
  ProductRecord,
  ResolvedProduct,
  SkillReference,
} from "./types.js";

export function skillPageUrl(skill: import("./types.js").SkillReference): string {
  const repository = skill.repository.replace(/^https:\/\/github\.com\//, "").replace(/\.git$/, "");
  return `https://skills.sh/${repository}/${skill.directory.split("/").filter(Boolean).at(-1)}`;
}
