import { readFile } from "node:fs/promises";

const config = JSON.parse(await readFile(new URL("../vercel.json", import.meta.url), "utf8"));
if (config.outputDirectory !== "apps/web/out") {
  throw new Error("Vercel must publish the statically rendered Next.js output from apps/web/out");
}
if ((config.routes ?? []).some((route) => route.dest === "/index.html")) {
  throw new Error("SPA fallback routing must not replace statically rendered Next.js routes");
}

if ((config.redirects ?? []).length) throw new Error("Retired public routes must not survive as redirects");

console.log("Vercel publishes only the route-specific Next.js output.");
