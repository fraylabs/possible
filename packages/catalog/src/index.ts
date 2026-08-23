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
export { getSkill, skillCatalog } from "./skills.js";
export type {
  CompanyId,
  CompanyRecord,
  OutcomeAuthor,
  OutcomeFiles,
  OutcomeManifest,
  OutcomeModel,
  OutcomeModelRole,
  OutcomeFile,
  OutcomeFileType,
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
  SkillRecord,
} from "./types.js";

export function skillPageUrl(skill: import("./types.js").SkillReference): string {
  const repository = skill.repository.replace(/^https:\/\/github\.com\//, "").replace(/\.git$/, "");
  return `https://skills.sh/${repository}/${skill.directory.split("/").filter(Boolean).at(-1)}`;
}
