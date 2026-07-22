import { readFile, writeFile } from "node:fs/promises";
import { compilePack, outcomePacks } from "../packages/packs/dist/index.js";

const target = new URL("../skills/possible/references/packs.md", import.meta.url);
let catalog = await readFile(target, "utf8");

for (const pack of outcomePacks) {
  const marker = `Slug: \`${pack.slug}\``;
  const sectionStart = catalog.indexOf(marker);
  const sectionEnd = catalog.indexOf("\n## ", sectionStart);
  if (sectionStart === -1) throw new Error(`Missing catalog section for ${pack.slug}`);
  const end = sectionEnd === -1 ? catalog.length : sectionEnd;
  const section = catalog.slice(sectionStart, end);
  const commands = compilePack(pack).installCommands.join("\n");
  const installBlock = /(Install:\n\n```bash\n)[\s\S]*?(\n```)/;
  if (!installBlock.test(section)) throw new Error(`Missing install block for ${pack.slug}`);
  const updated = section.replace(installBlock, `$1${commands}$2`);
  catalog = `${catalog.slice(0, sectionStart)}${updated}${catalog.slice(end)}`;
}

await writeFile(target, catalog);
console.log(`Synchronized ${outcomePacks.length} pack install blocks to reviewed revisions.`);
