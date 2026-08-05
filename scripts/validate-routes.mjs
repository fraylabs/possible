import { readFile } from "node:fs/promises";

const config = JSON.parse(await readFile(new URL("../vercel.json", import.meta.url), "utf8"));
if (config.outputDirectory !== "apps/web/out") {
  throw new Error("Vercel must publish the statically rendered Next.js output from apps/web/out");
}
if ((config.routes ?? []).some((route) => route.dest === "/index.html")) {
  throw new Error("SPA fallback routing must not replace statically rendered Next.js routes");
}
if (config.cleanUrls !== true || config.trailingSlash !== true) {
  throw new Error("Vercel URLs must preserve the trailing-slash canonicals emitted by the static Next.js build");
}

const expectedRedirects = [
  ["/demo", "/examples"],
  ["/demo/still", "/examples/still?view=process"],
  ["/demo/hardware", "/examples/still?view=process"],
  ["/demo/robot-snake", "/examples/robot-snake?view=process"],
  ["/demo/fold", "/examples/fold?view=process"],
  ["/demo/game", "/examples/fold?view=process"],
  ["/demo/web-presentation", "/examples/web-presentation?view=process"],
  ["/demo/presentation", "/examples/web-presentation?view=process"],
  ["/demo/patchproof", "/examples/patchproof?view=process"],
];
const redirects = config.redirects ?? [];
if (redirects.length !== expectedRedirects.length) throw new Error("Vercel must preserve only the exact retired Demo compatibility routes");
for (const [source, destination] of expectedRedirects) {
  const redirect = redirects.find((candidate) => candidate.source === source);
  if (!redirect || redirect.destination !== destination || redirect.permanent !== true) {
    throw new Error(`Missing permanent compatibility redirect: ${source} -> ${destination}`);
  }
}
if (redirects.some((redirect) => /[*:]|path/.test(redirect.source))) {
  throw new Error("Demo compatibility redirects must remain exact so raw artifacts and /demo/game/play stay reachable");
}

console.log("Vercel publishes route-specific output with nine exact Demo compatibility redirects.");
