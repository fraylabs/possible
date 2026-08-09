import { readFile } from "node:fs/promises";

const config = JSON.parse(await readFile(new URL("../vercel.json", import.meta.url), "utf8"));
if (config.outputDirectory !== "apps/web/out") throw new Error("Vercel must publish apps/web/out");
if ((config.routes ?? []).some((route) => route.dest === "/index.html")) throw new Error("A SPA fallback must not replace static Next.js routes");
if (config.cleanUrls !== true || config.trailingSlash !== true) throw new Error("Static routes must use clean trailing-slash canonicals");
if ((config.redirects ?? []).length > 0) throw new Error("Retired demo and example systems must not survive as compatibility redirects");

console.log("Vercel publishes only route-specific static output.");
