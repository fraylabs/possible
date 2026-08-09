import assert from "node:assert/strict";
import { cp, lstat, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { applyPackArtifacts, createPackFolder, removePackFolder } from "../../../scripts/lib/pack-folders.mjs";

const repositoryRoot = fileURLToPath(new URL("../../../", import.meta.url));

test("deleting one pack folder removes every source-derived record", async () => {
  const temporaryRoot = await mkdtemp(join(tmpdir(), "possible-pack-folders-"));
  try {
    await mkdir(join(temporaryRoot, "packages/packs/src"), { recursive: true });
    await mkdir(join(temporaryRoot, "evaluations/discovery"), { recursive: true });
    await mkdir(join(temporaryRoot, "registry"), { recursive: true });
    await cp(join(repositoryRoot, "packages/packs/src/packs"), join(temporaryRoot, "packages/packs/src/packs"), { recursive: true });
    await cp(join(repositoryRoot, "registry/bundled-trust.json"), join(temporaryRoot, "registry/bundled-trust.json"));
    await cp(join(repositoryRoot, "evaluations/discovery/catalog-cases.json"), join(temporaryRoot, "evaluations/discovery/catalog-cases.json"));

    const draftFolder = await createPackFolder(temporaryRoot, "temporary-outcome");
    const draft = JSON.parse(await readFile(join(draftFolder, "pack.json"), "utf8"));
    assert.equal(draft.name, "Temporary Outcome");
    assert.equal("slug" in draft, false);
    await removePackFolder(temporaryRoot, "temporary-outcome");
    await assert.rejects(() => lstat(draftFolder), /ENOENT/);

    const unsupportedAssets = join(temporaryRoot, "packages/packs/src/packs/production-logo-system/assets");
    await mkdir(unsupportedAssets);
    await assert.rejects(() => applyPackArtifacts(temporaryRoot), /assets.*not part of the pack-folder contract/i);
    await rm(unsupportedAssets, { recursive: true });

    const showcasePath = join(temporaryRoot, "packages/packs/src/packs/html-css-animated-product-launch-film/showcase.json");
    const showcaseSource = await readFile(showcasePath, "utf8");
    const showcase = JSON.parse(showcaseSource);
    showcase.images = Array.from({ length: 6 }, (_, index) => ({ src: `https://example.com/${index}.png`, alt: `Example ${index + 1}` }));
    await writeFile(showcasePath, `${JSON.stringify(showcase, null, 2)}\n`);
    await assert.rejects(() => applyPackArtifacts(temporaryRoot), /at most five images/i);
    await writeFile(showcasePath, showcaseSource);

    const unusedMedia = join(temporaryRoot, "packages/packs/src/packs/html-css-animated-product-launch-film/media/unused.png");
    await writeFile(unusedMedia, "unused");
    await assert.rejects(() => applyPackArtifacts(temporaryRoot), /leaves unreferenced media\/unused\.png/i);
    await rm(unusedMedia);

    const before = await applyPackArtifacts(temporaryRoot);
    await assert.rejects(() => removePackFolder(temporaryRoot, "working-web-app"), /still referenced by.*catalog-cases\.json case clarify-01/i);
    assert.equal((await lstat(join(temporaryRoot, "packages/packs/src/packs/working-web-app"))).isDirectory(), true);
    await removePackFolder(temporaryRoot, "production-logo-system");
    const after = await applyPackArtifacts(temporaryRoot);
    await applyPackArtifacts(temporaryRoot, { check: true });

    assert.equal(after.count, before.count - 1);
    const generatedModule = await readFile(join(temporaryRoot, "packages/packs/src/generated-manifests.ts"), "utf8");
    assert.doesNotMatch(generatedModule, /production-logo-system/);
    const snapshots = JSON.parse(await readFile(join(temporaryRoot, "packages/packs/src/bundled-snapshots.json"), "utf8"));
    const trust = JSON.parse(await readFile(join(temporaryRoot, "packages/packs/src/bundled-trust.json"), "utf8"));
    const trustSource = JSON.parse(await readFile(join(temporaryRoot, "registry/bundled-trust.json"), "utf8"));
    const discovery = JSON.parse(await readFile(join(temporaryRoot, "evaluations/discovery/cases.json"), "utf8"));
    assert.equal(snapshots["production-logo-system"], undefined);
    assert.equal(trust["production-logo-system"], undefined);
    assert.equal(trustSource["production-logo-system"], undefined);
    assert.equal(discovery.cases.some((item) => [item.intended, item.acceptable, item.mustNotRecommend].flat().includes("production-logo-system")), false);
  } finally {
    await rm(temporaryRoot, { recursive: true, force: true });
  }
});
