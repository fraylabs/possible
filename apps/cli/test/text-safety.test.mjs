import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { hasInvisibleText, stripInvisibleText, visibleText } from '../src/text-safety.mjs';
import { validateOutcomeManifest, parseOutcomeMarkdown, readOutcomeFolder } from '../src/outcome-format.mjs';
import { captureReviewDigest } from '../src/capture-integrity.mjs';
import { manifest } from './recipe-fixture.mjs';

test('invisible tag, format and control characters are detected without modifying ordinary Unicode', () => {
  const hidden = [0xe0041, 0xe007f, 0x00ad, 0x034f, 0x115f, 0x1160, 0x180e, 0x3164, 0xffa0, 0xfe0f, 0xe0100, 0x85, 0x1b, 0x202e];
  for (const code of hidden) {
    const text = `Visible${String.fromCodePoint(code)}text`;
    assert.equal(hasInvisibleText(text), true);
    assert.equal(hasInvisibleText(text), true); // Stateful-regexp regression.
    assert.equal(stripInvisibleText(text), 'Visibletext');
    assert.equal(visibleText(text), `Visible\\u{${code.toString(16)}}text`);
  }
  const prose = 'Café 東京 — 3 diagrams.\nTab\there\r\n';
  assert.equal(hasInvisibleText(prose), false);
  assert.equal(visibleText(prose), prose);
});

test('all Outcome generations reject hidden text in metadata, descriptions and prompts', async t => {
  const marker = String.fromCodePoint(0xe0041);
  assert.throws(() => validateOutcomeManifest({ ...manifest, author: { ...manifest.author, name: `Maker${marker}` } }), /invisible/);
  assert.throws(() => parseOutcomeMarkdown(`# Film\n\nDescription${marker}`), /invisible/);
  const root = await mkdtemp(join(tmpdir(), 'possible-hidden-text-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const { mkdir } = await import('node:fs/promises');
  const folder = join(root, manifest.slug); await mkdir(folder);
  await writeFile(join(folder, 'outcome.md'), '# Film\n\nA visible film.');
  await writeFile(join(folder, 'prompt.md'), `Make a film.${marker}`);
  for (const candidate of [manifest, { ...manifest, schemaVersion: 3, primary: undefined }]) {
    await writeFile(join(folder, 'outcome.json'), JSON.stringify(candidate));
    await assert.rejects(readOutcomeFolder(folder), /invisible/);
  }
});

test('recorded content receipts survive platform line endings', () => {
  const candidate = { ...manifest, recipe: { provenance: { method: 'recorded', source: 'codex', reviewedAt: '2026-09-30T00:00:00Z' } } };
  assert.equal(captureReviewDigest(candidate, '# Title\n\nSummary\n', 'First\nSecond\n'), captureReviewDigest(candidate, '# Title\r\n\r\nSummary\r\n', 'First\r\nSecond\r\n'));
});

test('legitimate emoji presentation, emoji joiners and script shaping survive unchanged', () => {
  const england = '\u{1f3f4}\u{e0067}\u{e0062}\u{e0065}\u{e006e}\u{e0067}\u{e007f}';
  for (const text of ['❤️', '⚠️', '👩‍💻', '🏳️‍🌈', '☀︎', '1️⃣', 'می‌روم', 'क्‍ष', england]) {
    assert.equal(hasInvisibleText(text), false, text);
    assert.equal(stripInvisibleText(text), text);
    assert.equal(visibleText(text), text);
    assert.doesNotThrow(() => validateOutcomeManifest({ ...manifest, author: { ...manifest.author, name: `Creator ${text}` } }));
    assert.doesNotThrow(() => parseOutcomeMarkdown(`# ${text}\n\nA visible result.`));
  }
  for (const text of ['x\u200dy', 'x\u200cy', '\ufe0f', 'A\ufe0f', '❤️\u{e0041}', '\u{1f3f4}\u{e0041}\u{e007f}', 'سلام\u202e']) {
    assert.equal(hasInvisibleText(text), true);
    assert.throws(() => parseOutcomeMarkdown(`# Result\n\n${text}`), /invisible/);
  }
});
