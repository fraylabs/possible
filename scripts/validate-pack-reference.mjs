import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { compilePack, outcomePacks } from "../packages/packs/dist/index.js";

const catalog = await readFile(new URL("../skills/possible/references/packs.md", import.meta.url), "utf8");

for (const pack of outcomePacks) {
  const start = catalog.indexOf(`Slug: \`${pack.slug}\``);
  const next = catalog.indexOf("\n## ", start);
  const section = start === -1 ? "" : catalog.slice(start, next === -1 ? undefined : next);
  assert.ok(section, `Missing catalog section for ${pack.slug}`);
  for (const command of compilePack(pack).installCommands) {
    assert.ok(section.includes(command), `${pack.slug} must publish the compiler's pinned install command: ${command}`);
  }
}

console.log("Bundled pack reference matches every compiled pinned install command.");
