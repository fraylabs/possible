import { readFile } from "node:fs/promises";

const config = JSON.parse(await readFile(new URL("../vercel.json", import.meta.url), "utf8"));
if (config.outputDirectory !== "apps/web/out") {
  throw new Error("Vercel must publish the statically rendered Next.js output from apps/web/out");
}
if ((config.routes ?? []).some((route) => route.dest === "/index.html")) {
  throw new Error("SPA fallback routing must not replace statically rendered Next.js routes");
}

const redirects = new Map((config.redirects ?? []).map((redirect) => [redirect.source, redirect]));
for (const [source, destination] of [
  ["/what", "/blogs/what-is-possible"],
  ["/why", "/blogs/why-possible"],
]) {
  const redirect = redirects.get(source);
  if (redirect?.destination !== destination || redirect?.permanent !== true) {
    throw new Error(`${source} must permanently redirect to ${destination}`);
  }
}

console.log("Vercel publishes route-specific Next.js output and preserves moved blog URLs.");
