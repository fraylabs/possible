import assert from "node:assert/strict";
import { once } from "node:events";
import { mkdir, mkdtemp, rm, symlink, writeFile } from "node:fs/promises";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import {
  activeAssetReferences,
  describeArtifact,
  resolveRequestTarget,
} from "./verify-preview.mjs";

async function sandbox(t) {
  const directory = await mkdtemp(join(tmpdir(), "possible-preview-"));
  t.after(() => rm(directory, { force: true, recursive: true }));
  return directory;
}

test("artifact enumeration rejects an unmanifested symbolic link", async (t) => {
  const root = await sandbox(t);
  const dist = join(root, "dist");
  await mkdir(join(dist, "assets"), { recursive: true });
  await writeFile(join(root, "outside.json"), "private");
  await symlink("../../outside.json", join(dist, "assets", "unmanifested.json"));

  await assert.rejects(
    describeArtifact(dist),
    /Symbolic links are not allowed in the preview artifact/,
  );
});

test("artifact enumeration rejects a nested non-regular socket", {
  skip: process.platform === "win32" ? "Unix-domain socket fixture requires a POSIX filesystem." : false,
}, async (t) => {
  const root = await sandbox(t);
  const dist = join(root, "dist");
  const socketPath = join(dist, "assets", "unmanifested.sock");
  await mkdir(join(dist, "assets"), { recursive: true });

  const server = createServer();
  server.listen(socketPath);
  await once(server, "listening");
  try {
    await assert.rejects(
      describeArtifact(dist),
      /Non-regular entries are not allowed in the preview artifact/,
    );
  } finally {
    await new Promise((resolveClose, rejectClose) => {
      server.close((error) => error ? rejectClose(error) : resolveClose());
    });
  }
});

test("request resolution rejects a parent-directory link escaping the artifact", async (t) => {
  const root = await sandbox(t);
  const dist = join(root, "dist");
  const outside = join(root, "outside-assets");
  await mkdir(dist, { recursive: true });
  await mkdir(outside, { recursive: true });
  await writeFile(join(dist, "index.html"), "<!doctype html>");
  await writeFile(join(outside, "private.json"), "private");
  await symlink(outside, join(dist, "assets"), "dir");

  assert.deepEqual(
    await resolveRequestTarget("/assets/private.json", dist),
    { statusCode: 404 },
  );
});

test("artifact enumeration and routing reject a linked artifact root", async (t) => {
  const root = await sandbox(t);
  const actual = join(root, "actual-artifact");
  const linked = join(root, "dist");
  await mkdir(actual, { recursive: true });
  await writeFile(join(actual, "index.html"), "<!doctype html>");
  await symlink(actual, linked, "dir");

  await assert.rejects(
    describeArtifact(linked),
    /Artifact directories must be real directories/,
  );
  assert.deepEqual(await resolveRequestTarget("/", linked), { statusCode: 404 });
});

test("HTML parsing requires active module-script and stylesheet references", () => {
  const decoys = activeAssetReferences(`
    <!-- <script type="module" src="/assets/app.js"></script> -->
    <link rel="preload" href="/assets/app.css">
  `);
  assert.deepEqual(decoys, { moduleScripts: [], stylesheets: [] });

  const active = activeAssetReferences(`
    <script type="module" src="/assets/app.js"></script>
    <link rel="stylesheet preload" href="/assets/app.css">
  `);
  assert.deepEqual(active, {
    moduleScripts: ["/assets/app.js"],
    stylesheets: ["/assets/app.css"],
  });
});
