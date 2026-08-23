import { getProduct, getSkill, productCatalog, skillCatalog } from "@possible/catalog";
import type { ResolvedProduct, SkillRecord } from "@possible/catalog";
import cliPackage from "../../cli/package.json" with { type: "json" };

export const possibleVersion = cliPackage.version;
export const installCommand = `npx @fraylabs/possible@${possibleVersion} init`;
export const githubUrl = "https://github.com/fraylabs/possible";

export const publishedProducts = productCatalog;
export const publishedSkills = skillCatalog;
const publishedProductSlugs = publishedProducts.map((product) => product.id.split("/").at(-1));
if (new Set(publishedProductSlugs).size !== publishedProductSlugs.length) throw new Error("Published Product slugs must be unique");

export function productHref(product: ResolvedProduct) {
  return `/products/${product.id.split("/").at(-1)}`;
}

export function skillHref(skill: SkillRecord) {
  return `/skills/${skill.slug}`;
}

export function getPublishedProduct(idOrSlug: string) {
  const exact = getProduct(idOrSlug);
  if (exact) return exact;
  const matches = publishedProducts.filter((product) => product.id.split("/").at(-1) === idOrSlug);
  return matches.length === 1 ? matches[0] : undefined;
}

export function getPublishedSkill(idOrSlug: string) {
  return getSkill(idOrSlug);
}
