import { readFile } from "node:fs/promises";

const config = JSON.parse(await readFile(new URL("../vercel.json", import.meta.url), "utf8"));
const routes = config.routes ?? [];
const filesystemIndex = routes.findIndex((route) => route.handle === "filesystem");

if (filesystemIndex === -1) throw new Error("vercel.json must preserve filesystem routing for static publications");

for (const source of ["/packs", "/packs/"]) {
  const routeIndex = routes.findIndex((route) => route.src === source && route.dest === "/index.html");
  if (routeIndex === -1) throw new Error(`${source} must resolve to the human catalog`);
  if (routeIndex > filesystemIndex) throw new Error(`${source} must resolve before static filesystem routing`);
}

console.log("Human pack catalog routes take precedence over machine-readable publications.");
