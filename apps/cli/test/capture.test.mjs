import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtemp, readFile, writeFile, readdir, rm, stat, lstat, symlink, unlink } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { PassThrough, Writable } from 'node:stream';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
const execute = promisify(execFile);
const cli = fileURLToPath(new URL('../src/index.mjs', import.meta.url));
import { createCaptureDraft, reviewCaptureDraft, exportCaptureDraft, runCaptureCommand } from '../src/capture.mjs';
import { readOutcomeFolder } from '../src/outcome-format.mjs';

const session = [
  { type: 'user', sessionId: 'synthetic-capture', message: { role: 'user', content: 'Make a clean diagram. Contact person@example.invalid for details.' } },
  { type: 'assistant', sessionId: 'synthetic-capture', message: { model: 'claude-example', content: [{ type: 'tool_use', name: 'Render', input: { command: 'COMMAND_PRIVATE_SENTINEL' } }], stop_reason: 'tool_use' } },
  { type: 'user', sessionId: 'synthetic-capture', message: { role: 'user', content: [{ type: 'tool_result', content: 'OUTPUT_PRIVATE_SENTINEL' }] } },
  { type: 'assistant', sessionId: 'synthetic-capture', message: { model: 'claude-example', content: [{ type: 'text', text: 'ASSISTANT_PRIVATE_SENTINEL' }], stop_reason: 'end_turn' } },
].map(row => JSON.stringify(row)).join('\n');

async function fixture(t) {
  const root = await mkdtemp(join(tmpdir(), 'possible-capture-workflow-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const file = join(root, 'synthetic.jsonl');
  const folder = join(root, 'draft');
  await writeFile(file, session);
  const created = await createCaptureDraft({ source: 'claude-code', file, out: folder });
  return { root, file, folder, created };
}
const readDraft = async folder => JSON.parse(await readFile(join(folder, 'draft.json'), 'utf8'));
const writeDraft = async (folder, draft) => writeFile(join(folder, 'draft.json'), JSON.stringify(draft, null, 2));
async function editForReview(folder) {
  const draft = await readDraft(folder);
  draft.manifest.slug = 'clean-diagram';
  draft.manifest.author = { name: 'Synthetic Studio', url: 'https://studio.example' };
  draft.manifest.primary = { kind: 'product', id: 'example/renderer' };
  for (const tool of draft.manifest.recipe.tools ?? []) tool.purpose = 'Render the synthetic diagram.';
  draft.manifest.preview = { images: [{ src: 'https://studio.example/diagram.svg', alt: 'Diagram showing three stages' }] };
  draft.about = '# Clean diagram\n\nA legible three-stage diagram with a clear reading order.\n';
  draft.prompt = 'Create a clear three-stage diagram with short labels.';
  draft.manifest.recipe.steps[0].prompt = draft.prompt;
  await writeDraft(folder, draft);
  return draft;
}
function terminal({ approve = true, beforeAnswer, tty = true } = {}) {
  const input = new PassThrough();
  input.isTTY = tty;
  input.setRawMode = () => {};
  let text = '';
  let answered = false;
  let asynchronousError;
  const output = new Writable({ write(chunk, _encoding, done) {
    text += chunk.toString();
    const match = text.match(/Type (APPROVE [a-f0-9]{12}) to approve/);
    if (match && !answered) {
      answered = true;
      setImmediate(async () => {
        try { await beforeAnswer?.(); input.write(`${approve ? match[1] : 'cancel'}\n`); }
        catch (error) { asynchronousError = error; input.write('cancel\n'); }
      });
    }
    done();
  } });
  output.isTTY = tty;
  output.columns = 120;
  return { input, output, text: () => text, error: () => asynchronousError, close() { input.destroy(); output.destroy(); } };
}
async function review(t, folder, options) {
  const streams = terminal(options);
  t.after(() => streams.close());
  const result = await reviewCaptureDraft(folder, streams);
  if (streams.error()) throw streams.error();
  return { result, displayed: streams.text() };
}
async function missing(path) { await assert.rejects(stat(path), { code: 'ENOENT' }); }

test('capture creates a private, sanitized local draft and preserves the source', { timeout: 5000 }, async t => {
  const { folder, file, created } = await fixture(t);
  assert.equal(created.folder, folder);
  assert.ok(created.findingCount > 0);
  assert.deepEqual((await readdir(folder)).sort(), ['.gitignore', 'REVIEW.md', 'draft.json']);
  assert.equal(await readFile(file, 'utf8'), session);
  const text = await readFile(join(folder, 'draft.json'), 'utf8');
  assert.doesNotMatch(text, /PRIVATE_SENTINEL|person@example\.invalid/);
  assert.match(text, /REDACTED/);
  const draft = JSON.parse(text);
  assert.deepEqual(draft.manifest.recipe.provenance, { method: 'recorded', source: 'claude-code' });
  assert.equal(draft.manifest.models[0].model, 'claude-example');
  assert.equal(draft.manifest.recipe.tools[0].name, 'Render');
  assert.equal((await stat(folder)).mode & 0o777, 0o700);
  assert.equal((await stat(join(folder, 'draft.json'))).mode & 0o777, 0o600);
  assert.equal(await readFile(join(folder, '.gitignore'), 'utf8'), '*\n');
  await assert.rejects(createCaptureDraft({ source: 'claude-code', file, out: folder }), { code: 'EEXIST' });
  assert.equal(await readFile(join(folder, 'draft.json'), 'utf8'), text);
});

test('export requires review and piped approval is refused', { timeout: 5000 }, async t => {
  const { folder, root } = await fixture(t);
  const out = join(root, 'export');
  await assert.rejects(exportCaptureDraft(folder, out), /Creator review is required/);
  const streams = terminal({ tty: false });
  t.after(() => streams.close());
  await assert.rejects(reviewCaptureDraft(folder, streams), /interactive terminal/);
  await missing(join(folder, 'approval.json'));
  await missing(out);
});

test('review requires completed creator fields and cancellation leaves no approval', { timeout: 5000 }, async t => {
  const { folder } = await fixture(t);
  await assert.rejects(review(t, folder), /Complete the result title/);
  await editForReview(folder);
  await assert.rejects(review(t, folder, { approve: false }), /Review cancelled/);
  await missing(join(folder, 'approval.json'));
});

test('interactive creator review exports a locally readable Outcome without network access', { timeout: 5000 }, async t => {
  let networkCalls = 0;
  t.mock.method(globalThis, 'fetch', async () => { networkCalls++; throw new Error('Network access forbidden in local capture test'); });
  const { folder, root, file } = await fixture(t);
  const draft = await editForReview(folder);
  const { result, displayed } = await review(t, folder);
  assert.match(result.digest, /^[a-f0-9]{64}$/);
  assert.match(displayed, /PRIVATE LOCAL REVIEW/);
  assert.match(displayed, /clear three-stage diagram/);
  const approval = JSON.parse(await readFile(join(folder, 'approval.json'), 'utf8'));
  assert.equal(approval.manifest.recipe.provenance.reviewDigest, result.digest);
  assert.equal((await stat(join(folder, 'approval.json'))).mode & 0o777, 0o600);
  const out = join(root, 'publisher');
  assert.deepEqual(await exportCaptureDraft(folder, out), { folder: out, slug: 'clean-diagram' });
  const outcomeFolder = join(out, 'outcomes', 'clean-diagram');
  const outcome = await readOutcomeFolder(outcomeFolder);
  assert.equal(outcome.executionPrompt, draft.prompt);
  assert.equal(outcome.about.title, 'Clean diagram');
  assert.equal(outcome.manifest.recipe.provenance.method, 'recorded');
  assert.equal(outcome.manifest.recipe.provenance.reviewDigest, result.digest);
  assert.deepEqual(JSON.parse(await readFile(join(out, 'outcomes.json'), 'utf8')).outcomes, [{ slug: 'clean-diagram', url: './outcomes/clean-diagram/outcome.json' }]);
  assert.deepEqual((await readdir(outcomeFolder)).sort(), ['outcome.json', 'outcome.md', 'prompt.md']);
  assert.equal(networkCalls, 0);
  assert.equal(await readFile(file, 'utf8'), session);
  await assert.rejects(exportCaptureDraft(folder, out), { code: 'EEXIST' });
  await writeFile(join(outcomeFolder, 'prompt.md'), 'Changed after review.');
  await assert.rejects(readOutcomeFolder(outcomeFolder), /changed after privacy review/);
});

test('edits after approval invalidate export and a new review approves the new content', { timeout: 5000 }, async t => {
  const { folder, root } = await fixture(t);
  await editForReview(folder);
  const first = await review(t, folder);
  const draft = await readDraft(folder);
  draft.prompt = 'Create a clear four-stage diagram.';
  await writeDraft(folder, draft);
  const out = join(root, 'publisher');
  await assert.rejects(exportCaptureDraft(folder, out), /changed after review/);
  await missing(out);
  const second = await review(t, folder);
  assert.notEqual(second.result.digest, first.result.digest);
  await exportCaptureDraft(folder, out);
  assert.equal((await readOutcomeFolder(join(out, 'outcomes', 'clean-diagram'))).executionPrompt, draft.prompt);
});

test('edits during interactive review invalidate the approval', { timeout: 5000 }, async t => {
  const { folder } = await fixture(t);
  await editForReview(folder);
  await assert.rejects(review(t, folder, { beforeAnswer: async () => {
    const draft = await readDraft(folder);
    draft.prompt = 'Changed while the creator was reading.';
    await writeDraft(folder, draft);
  } }), /changed during review/);
  await missing(join(folder, 'approval.json'));
});

test('tampered approval content cannot be exported', { timeout: 5000 }, async t => {
  const { folder, root } = await fixture(t);
  await editForReview(folder);
  await review(t, folder);
  const path = join(folder, 'approval.json');
  const approval = JSON.parse(await readFile(path, 'utf8'));
  approval.prompt = 'Unreviewed replacement text.';
  await writeFile(path, JSON.stringify(approval));
  await assert.rejects(exportCaptureDraft(folder, join(root, 'publisher')), /Approval does not match/);
});

test('capture command rejects unknown, repeated, incomplete and bypass flags', { timeout: 5000 }, async t => {
  const { folder, root, file } = await fixture(t);
  const invalid = [
    ['claude-code', file, '--yes'],
    ['claude-code', file, '--out'],
    ['claude-code', file, '--out', join(root, 'one'), '--out', join(root, 'two')],
    ['review', folder, '--yes', 'true'],
    ['review', folder, '--out', join(root, 'out')],
    ['export', folder, '--thread', 'synthetic'],
    ['unsupported', file, '--out', join(root, 'out')],
    ['claude-code'],
  ];
  for (const args of invalid) await assert.rejects(runCaptureCommand(args));
  assert.deepEqual((await readdir(root)).sort(), ['draft', 'synthetic.jsonl']);
});

test('creator-added credentials block review without printing the sensitive value', { timeout: 5000 }, async t => {
  const { folder } = await fixture(t);
  const draft = await editForReview(folder);
  draft.prompt = 'Use API_KEY=sk-syntheticTESTcredential987654321.';
  await writeDraft(folder, draft);
  const streams = terminal();
  t.after(() => streams.close());
  await assert.rejects(reviewCaptureDraft(folder, streams), /credential/);
  assert.doesNotMatch(streams.text(), /syntheticTESTcredential/);
  await missing(join(folder, 'approval.json'));
});

test('CLI refuses noninteractive review even when approval text is available', { timeout: 5000 }, async t => {
  const { folder, root } = await fixture(t);
  await editForReview(folder);
  await assert.rejects(execute(process.execPath, [cli, 'capture', 'review', folder], { cwd: root }), error => error.code === 1 && /interactive terminal/.test(error.stderr));
  await missing(join(folder, 'approval.json'));
});

test('an option token is not accepted as the missing --out value', { timeout: 5000 }, async t => {
  const { file, root } = await fixture(t);
  await assert.rejects(execute(process.execPath, [cli, 'capture', 'claude-code', file, '--out', '--thread'], { cwd: root }), error => error.code === 1);
  await missing(join(root, '--thread'));
});

test('review replaces an approval symlink without modifying its target; export refuses symlink receipts', { timeout: 5000 }, async t => {
  const { folder, root } = await fixture(t);
  await editForReview(folder);
  const protectedFile = join(root, 'unrelated.txt');
  await writeFile(protectedFile, 'Keep this unrelated file unchanged.');
  const approvalPath = join(folder, 'approval.json');
  await symlink(protectedFile, approvalPath);
  await review(t, folder);
  assert.equal((await lstat(approvalPath)).isSymbolicLink(), false);
  assert.equal(await readFile(protectedFile, 'utf8'), 'Keep this unrelated file unchanged.');
  const stored = await readFile(approvalPath, 'utf8');
  const copied = join(root, 'copied-approval.json');
  await writeFile(copied, stored);
  await unlink(approvalPath);
  await symlink(copied, approvalPath);
  await assert.rejects(exportCaptureDraft(folder, join(root, 'publisher')), /Creator review is required/);
});

test('draft symlinks and malformed draft content are refused without echoing raw contents', { timeout: 5000 }, async t => {
  const { folder, root } = await fixture(t);
  const draftPath = join(folder, 'draft.json');
  const copied = join(root, 'copy.json');
  await writeFile(copied, await readFile(draftPath));
  await unlink(draftPath);
  await symlink(copied, draftPath);
  await assert.rejects(review(t, folder), /regular local file/);
  await unlink(draftPath);
  await writeFile(draftPath, 'MALFORMED_PRIVATE_SENTINEL');
  await assert.rejects(review(t, folder), error => /not valid JSON/.test(error.message) && !error.message.includes('PRIVATE_SENTINEL'));
});

test('automatically detected tool names block review until the creator describes them', { timeout: 5000 }, async t => {
  const { folder } = await fixture(t);
  const draft = await editForReview(folder);
  draft.manifest.recipe.tools = [{ name: 'acme_secret_pricing', purpose: 'Library imported by an executed script; creator must confirm its purpose.' }];
  await writeDraft(folder, draft);
  const streams = terminal();
  t.after(() => streams.close());
  await assert.rejects(reviewCaptureDraft(folder, streams), /Describe each tool/);
  await missing(join(folder, 'approval.json'));
});
