import { rawCompanies, rawProducts } from "./generated-products.js";
import type {
  CompanyRecord,
  ProductCategory,
  ProductId,
  ProductRecord,
  ResolvedProduct,
} from "./types.js";

const SAFE_ID = /^[a-z0-9][a-z0-9-]*$/;
const PRODUCT_ID = /^([a-z0-9][a-z0-9-]*)\/([a-z0-9][a-z0-9-]*)$/;
const PRODUCT_CATEGORIES = new Set<ProductCategory>(["video", "audio", "3d", "robotics"]);

const nonEmptyString = (value: string, context: string): string => {
  if (value.trim().length === 0) throw new Error(`${context} must be a non-empty string`);
  return value;
};

const httpsUrl = (value: string, context: string): string => {
  const url = nonEmptyString(value, context);
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error(`${context} must be an HTTPS URL`);
  }
  if (parsed.protocol !== "https:" || parsed.username || parsed.password) throw new Error(`${context} must be an HTTPS URL`);
  return url;
};

export function validateCompanyId(value: string, context = "company id"): string {
  const id = nonEmptyString(value, context);
  if (!SAFE_ID.test(id)) throw new Error(`${context} must be lowercase and hyphenated`);
  return id;
}

export function validateProductId(value: string, context = "product id"): ProductId {
  const id = nonEmptyString(value, context);
  if (!PRODUCT_ID.test(id)) throw new Error(`${context} must use company/product with lowercase hyphenated identifiers`);
  // SAFETY: PRODUCT_ID proves the required company/product template-literal shape.
  return id as ProductId;
}

export function validateCompanyRecord(company: CompanyRecord, context = "company"): CompanyRecord {
  if (company.schemaVersion !== 1) throw new Error(`${context}.schemaVersion must be 1`);
  return {
    schemaVersion: 1,
    id: validateCompanyId(company.id, `${context}.id`),
    name: nonEmptyString(company.name, `${context}.name`),
    website: httpsUrl(company.website, `${context}.website`),
  };
}

export function validateProductRecord(product: ProductRecord, context = "product"): ProductRecord {
  if (product.schemaVersion !== 1) throw new Error(`${context}.schemaVersion must be 1`);
  const id = validateProductId(product.id, `${context}.id`);
  const company = validateCompanyId(product.company, `${context}.company`);
  if (!id.startsWith(`${company}/`)) throw new Error(`${context}.id must be namespaced by company ${company}`);
  if (!PRODUCT_CATEGORIES.has(product.category)) throw new Error(`${context}.category is unsupported`);
  return {
    schemaVersion: 1,
    id,
    name: nonEmptyString(product.name, `${context}.name`),
    company,
    category: product.category,
    summary: nonEmptyString(product.summary, `${context}.summary`),
    summarySourceUrl: httpsUrl(product.summarySourceUrl, `${context}.summarySourceUrl`),
    logoUrl: httpsUrl(product.logoUrl, `${context}.logoUrl`),
    website: httpsUrl(product.website, `${context}.website`),
    docsUrl: httpsUrl(product.docsUrl, `${context}.docsUrl`),
  };
}

export const companies: CompanyRecord[] = rawCompanies.map((company, index) => validateCompanyRecord(company, `companies[${index}]`));
if (new Set(companies.map(({ id }) => id)).size !== companies.length) throw new Error("Company ids must be unique");

const companyById = new Map(companies.map((company) => [company.id, company]));
export const products: ProductRecord[] = rawProducts.map((product, index) => validateProductRecord(product, `products[${index}]`));
if (new Set(products.map(({ id }) => id)).size !== products.length) throw new Error("Product ids must be unique");

export const productCatalog: ResolvedProduct[] = products.map((product) => {
  const company = companyById.get(product.company);
  if (company === undefined) throw new Error(`Product ${product.id} references missing company ${product.company}`);
  return { ...product, company };
});

const productById = new Map<string, ResolvedProduct>(productCatalog.map((product) => [product.id, product]));

export function getProduct(id: string): ResolvedProduct | undefined {
  return productById.get(id);
}

export function resolveProducts(ids: readonly ProductId[] = [], context = "products"): ResolvedProduct[] {
  return ids.map((id, index) => {
    const product = productById.get(id);
    if (product === undefined) throw new Error(`${context}[${index}] references missing product ${id}`);
    return product;
  });
}
