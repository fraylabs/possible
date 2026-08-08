import { writeFile } from "node:fs/promises";
import { publicCatalog } from "../packages/packs/dist/index.js";
import { renderPackReference } from "./render-pack-reference.mjs";

const target = new URL("../skills/possible/references/packs.md", import.meta.url);
await writeFile(target, renderPackReference(), "utf8");
console.log(`Generated the offline discovery snapshot from ${publicCatalog.length} catalog entries.`);
