import bytedanceCompany from "./companies/bytedance.json" with { type: "json" };
import googleDeepmindCompany from "./companies/google-deepmind.json" with { type: "json" };
import heygenCompany from "./companies/heygen.json" with { type: "json" };
import minimaxCompany from "./companies/minimax.json" with { type: "json" };
import remotionCompany from "./companies/remotion.json" with { type: "json" };
import threeJsCompany from "./companies/three-js.json" with { type: "json" };
import uzuCompany from "./companies/uzu.json" with { type: "json" };
import seedanceProduct from "./products/bytedance--seedance.json" with { type: "json" };
import mujocoProduct from "./products/google-deepmind--mujoco.json" with { type: "json" };
import hyperframesProduct from "./products/heygen--hyperframes.json" with { type: "json" };
import hailuoProduct from "./products/minimax--hailuo-ai.json" with { type: "json" };
import remotionProduct from "./products/remotion--remotion.json" with { type: "json" };
import threeJsProduct from "./products/three-js--three-js.json" with { type: "json" };
import strudelProduct from "./products/uzu--strudel.json" with { type: "json" };
import type { CompanyRecord, ProductRecord } from "./types.js";

export const rawCompanies = [
  bytedanceCompany,
  googleDeepmindCompany,
  heygenCompany,
  minimaxCompany,
  remotionCompany,
  threeJsCompany,
  uzuCompany,
] as CompanyRecord[];

export const rawProducts = [
  seedanceProduct,
  mujocoProduct,
  hyperframesProduct,
  hailuoProduct,
  remotionProduct,
  threeJsProduct,
  strudelProduct,
] as ProductRecord[];
