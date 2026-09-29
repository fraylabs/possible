import { createHash } from "node:crypto";

export function canonicalJson(value) {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  if (value && typeof value === "object") return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(",")}}`;
  return JSON.stringify(value);
}

export function captureReviewDigest(manifest, aboutText, promptText) {
  const copy = structuredClone(manifest);
  if (copy.recipe?.provenance) delete copy.recipe.provenance.reviewDigest;
  return createHash("sha256").update(canonicalJson(copy)).update("\0").update(aboutText.replace(/\r\n/g, "\n").trim()).update("\0").update(promptText.replace(/\r\n/g, "\n").trim()).digest("hex");
}

export function verifyCaptureReview(manifest, aboutText, promptText) {
  if (manifest.recipe?.provenance?.method !== "recorded") return;
  const expected = captureReviewDigest(manifest, aboutText, promptText);
  if (manifest.recipe.provenance.reviewDigest !== expected) throw new Error("Captured Outcome changed after privacy review. Review the exact draft again before export or publication.");
}
