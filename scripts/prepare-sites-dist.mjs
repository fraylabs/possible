import { cp, mkdir, rm } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const webOutput = new URL("apps/web/out/", root);
const workerSource = new URL("apps/web/sites-worker.mjs", root);
const hostingSource = new URL(".openai/hosting.json", root);
const distribution = new URL("dist/", root);

await rm(distribution, { recursive: true, force: true });
await mkdir(new URL("client/", distribution), { recursive: true });
await mkdir(new URL("server/", distribution), { recursive: true });
await mkdir(new URL(".openai/", distribution), { recursive: true });
await cp(webOutput, new URL("client/", distribution), { recursive: true });
await cp(workerSource, new URL("server/index.js", distribution));
await cp(hostingSource, new URL(".openai/hosting.json", distribution));

// Paid downloads: the private fraylabs/possible-prompts build writes d/<token>/ (thanks page and zip) only
// for products whose link in apps/web/src/payment-links.json is set. Without this folder none ship.
const delivery = process.env.POSSIBLE_DELIVERY_DIR;
if (delivery) {
  // A delivery file with the same path as a site file fails the build instead of replacing it.
  await cp(delivery, new URL("client/", distribution), { recursive: true, force: false, errorOnExist: true });
  console.log("Added the paid download pages.");
}

console.log("Prepared the current web export for Sites.");
