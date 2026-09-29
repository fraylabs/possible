import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, readFile, rm, readdir, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
const execute = promisify(execFile);
import { CAPTURE_LIMITS, parseClaudeSession, parseCodexSession, parseTurnlessSession, readCaptureSource } from '../src/capture-sources.mjs';
import { jsonl, claudeRows, codexRows, turnlessFixture } from './capture-sources-fixture.mjs';
const safe = output => assert.doesNotMatch(JSON.stringify(output), /SECRET|wrong-current|private\.example|secret\.example/);
const error = code => error => error.code === code && !/SECRET/.test(error.message);

test('Claude preserves prompts/models in order and excludes output and harness text', () => {
  const result = parseClaudeSession(jsonl(claudeRows));
  assert.deepEqual(result.prompts.map(p => p.text), ['Make an illustrated guide using https://example.org/reference.', 'Use warmer colours.']);
  assert.deepEqual(result.models.map(m => m.model), ['claude-example', 'claude-example-2']);
  assert.equal(result.tools[0].name, 'Read');
  assert.deepEqual(result.skills, [{ directory: 'skills/illustration' }]);
  assert.equal(result.skills[0].lastReviewedCommit, undefined);
  safe(result);
});
test('Claude keeps repeated user followups, omits UUID replays and sidechain text', () => {
  const rows = [...claudeRows.slice(0, 1), claudeRows[0], { type: 'user', sessionId: 'synthetic-a', isSidechain: true, message: { content: 'SIDECHAIN_SECRET' } }, ...claudeRows.slice(1)];
  assert.equal(parseClaudeSession(jsonl(rows)).prompts.length, 2);
  safe(parseClaudeSession(jsonl(rows)));
  assert.throws(() => parseClaudeSession(jsonl([...claudeRows, { type: 'user', sessionId: 'other', message: { content: 'OTHER_SECRET' } }])), error('AMBIGUOUS_SESSION'));
});
test('Codex uses canonical user events once, keeps order and model switches', () => {
  const result = parseCodexSession(jsonl(codexRows));
  assert.deepEqual(result.prompts.map(p => p.text), ['Make a diagram.', 'Add a legend.']);
  assert.deepEqual(result.models.map(m => m.model), ['gpt-example', 'gpt-example-2']);
  assert.deepEqual(result.references, [{ kind: 'document', label: 'File referenced by tool', path: 'reference.svg' }]);
  safe(result);
});
test('Codex omits instruction envelopes in response-only legacy transcripts', () => {
  const rows = codexRows.filter(row => row.type !== 'event_msg');
  rows.push({ type: 'response_item', payload: { type: 'message', role: 'assistant', phase: 'final_answer', content: [{ type: 'output_text', text: 'FINAL_SECRET' }] } });
  assert.deepEqual(parseCodexSession(jsonl(rows)).prompts, [{ text: 'Make a diagram.' }]);
  safe(parseCodexSession(jsonl(rows)));
});
test('Codex rejects mixed sessions and fork history without exposing identifiers', () => {
  assert.throws(() => parseCodexSession(jsonl([...codexRows, { type: 'session_meta', payload: { id: 'OTHER_SECRET' } }])), error('AMBIGUOUS_SESSION'));
  assert.throws(() => parseCodexSession(jsonl([{ type: 'session_meta', payload: { id: 'child', forked_from_id: 'PARENT_SECRET' } }, ...codexRows.slice(1)])), error('AMBIGUOUS_SESSION'));
});
test('parsers reject active, malformed, oversized and unsupported sessions safely', () => {
  assert.throws(() => parseClaudeSession(jsonl(claudeRows.slice(0, 3))), error('ACTIVE_SESSION'));
  assert.throws(() => parseCodexSession(jsonl(codexRows.slice(0, -1))), error('ACTIVE_SESSION'));
  assert.throws(() => parseClaudeSession('PASSWORD_SECRET invalid'), error('MALFORMED_SESSION'));
  assert.throws(() => parseCodexSession('x'.repeat(CAPTURE_LIMITS.bytes + 1)), error('SESSION_LIMIT'));
  assert.throws(() => parseClaudeSession('{}\n'.repeat(CAPTURE_LIMITS.records + 1)), error('SESSION_LIMIT'));
  assert.throws(() => parseClaudeSession('{"type":"future"}'), error('NO_PROMPTS'));
});
test('Turnless orders user messages and uses historical model requests only', () => {
  const result = parseTurnlessSession(turnlessFixture);
  assert.deepEqual(result.prompts.map(p => p.text), ['Make a diagram.', 'Add a legend.']);
  assert.equal(result.models[0].model, 'gpt-historical');
  assert.equal(result.tools[0].name, 'command_execution');
  safe(result);
  const missing = parseTurnlessSession({ ...turnlessFixture, events: [] });
  assert.equal(missing.models.length, 0);
  assert.ok(missing.unknowns.some(s => /Execution model/.test(s)));
});
test('Turnless rejects foreign records and active states', () => {
  assert.throws(() => parseTurnlessSession({ ...turnlessFixture, messages: [{ threadId: 'other', role: 'user', text: 'OTHER_SECRET' }] }), error('AMBIGUOUS_SESSION'));
  for (const change of [{ session: { status: 'running' } }, { session: { status: 'ready', activeTurnId: 'turn' } }, { turns: [{ state: 'pending' }] }, { messages: [{ role: 'assistant', isStreaming: true }] }]) {
    assert.throws(() => parseTurnlessSession({ ...turnlessFixture, ...change }), error('ACTIVE_SESSION'));
  }
});
async function directory(t) {
  const path = await mkdtemp(join(tmpdir(), 'possible-capture-test-'));
  t.after(() => rm(path, { recursive: true, force: true }));
  return path;
}
test('explicit JSONL input only; safe errors and no source mutation', async t => {
  const path = join(await directory(t), 'source.jsonl');
  const text = jsonl(claudeRows);
  await writeFile(path, text);
  assert.equal((await readCaptureSource({ source: 'claude-code', file: path })).prompts.length, 2);
  assert.equal(await readFile(path, 'utf8'), text);
  await assert.rejects(readCaptureSource({ source: 'nope', file: path }), error('UNSUPPORTED_SOURCE'));
  await assert.rejects(readCaptureSource({ source: 'claude-code' }), error('FILE_REQUIRED'));
  await assert.rejects(readCaptureSource({ source: 'codex', file: path, thread: 'x' }), error('INVALID_INPUT'));
  await assert.rejects(readCaptureSource({ source: 'codex', file: path + 'SECRET' }), error('READ_FAILED'));
});
function database(path) {
  const db = new DatabaseSync(path);
  db.exec(`CREATE TABLE projection_threads(thread_id TEXT);
    CREATE TABLE projection_thread_sessions(thread_id TEXT,status TEXT,active_turn_id TEXT);
    CREATE TABLE projection_turns(thread_id TEXT,state TEXT);
    CREATE TABLE projection_thread_messages(thread_id TEXT,message_id TEXT,role TEXT,text TEXT,is_streaming INT,created_at TEXT);
    CREATE TABLE projection_thread_activities(thread_id TEXT,kind TEXT,payload_json TEXT);
    CREATE TABLE orchestration_events(aggregate_kind TEXT,stream_id TEXT,event_type TEXT,sequence INT,payload_json TEXT);
    INSERT INTO projection_threads VALUES('selected'),('other');
    INSERT INTO projection_thread_sessions VALUES('selected','ready',NULL),('other','running','x');
    INSERT INTO projection_turns VALUES('selected','completed'),('other','running');
    INSERT INTO projection_thread_messages VALUES('selected','b','user','Follow up',0,'2026-01-02'),('selected','a','user','First prompt',0,'2026-01-01'),('selected','c','assistant','OUTPUT_SECRET',0,'2026-01-03'),('other','d','user','OTHER_SECRET',1,'2026-01-01');
    INSERT INTO projection_thread_activities VALUES('selected','tool.completed','{"itemType":"file_read","detail":"OUTPUT_SECRET"}'),('other','tool.completed','MALFORMED_SECRET');
    INSERT INTO orchestration_events VALUES('thread','selected','thread.turn-start-requested',1,'{"modelSelection":{"provider":"codex","model":"gpt-historical"}}'),('thread','other','thread.turn-start-requested',2,'MALFORMED_SECRET');`);
  db.close();
}
test('SQLite captures selected thread read-only, ignoring another active thread and its malformed data', async t => {
  const path = join(await directory(t), 'synthetic.sqlite');
  database(path);
  const before = await readFile(path);
  const result = await readCaptureSource({ source: 'turnless', file: path, thread: 'selected' });
  assert.deepEqual(result.prompts, [{ text: 'First prompt' }, { text: 'Follow up' }]);
  assert.equal(result.models[0].model, 'gpt-historical');
  safe(result);
  assert.deepEqual(await readFile(path), before);
  await assert.rejects(readCaptureSource({ source: 'turnless', file: path }), error('THREAD_REQUIRED'));
  await assert.rejects(readCaptureSource({ source: 'turnless', file: path, thread: 'missing_SECRET' }), error('THREAD_NOT_FOUND'));
  await assert.rejects(readCaptureSource({ source: 'turnless', file: path, thread: 'other' }), error('ACTIVE_SESSION'));
  await assert.rejects(readCaptureSource({ source: 'turnless', file: path, thread: "selected' OR 1=1 --" }), error('THREAD_NOT_FOUND'));
});
test('Claude omits incomplete envelopes, wrapped tool text, and non-user roles', () => {
  const injected = [
    { type: 'user', message: { content: '<system-reminder>INCOMPLETE_SECRET' } },
    { type: 'user', toolUseResult: { stdout: 'RESULT_SECRET' }, message: { content: 'WRAPPED_SECRET' } },
    { type: 'user', message: { role: 'tool', content: 'ROLE_SECRET' } },
  ];
  const result = parseClaudeSession(jsonl([...claudeRows.slice(0, -1), ...injected, claudeRows.at(-1)]));
  assert.equal(result.prompts.length, 2);
  safe(result);
});
test('SQLite streaming and malformed selected metadata fail closed', async t => {
  const path = join(await directory(t), 'synthetic.sqlite');
  database(path);
  let db = new DatabaseSync(path);
  db.exec("UPDATE projection_thread_messages SET is_streaming = 1 WHERE message_id = 'c'");
  db.close();
  await assert.rejects(readCaptureSource({ source: 'turnless', file: path, thread: 'selected' }), error('ACTIVE_SESSION'));
  db = new DatabaseSync(path);
  db.exec("UPDATE projection_thread_messages SET is_streaming = 0 WHERE message_id = 'c'; UPDATE projection_thread_activities SET payload_json = 'MALFORMED_SECRET' WHERE thread_id = 'selected'");
  db.close();
  await assert.rejects(readCaptureSource({ source: 'turnless', file: path, thread: 'selected' }), error('UNSUPPORTED_SCHEMA'));
});
test('SQLite prompt byte limit is checked before loading prompt bodies', async t => {
  const path = join(await directory(t), 'synthetic.sqlite');
  database(path);
  const db = new DatabaseSync(path);
  db.prepare("UPDATE projection_thread_messages SET text = ? WHERE message_id = 'a'").run('x'.repeat(CAPTURE_LIMITS.bytes + 1));
  db.close();
  await assert.rejects(readCaptureSource({ source: 'turnless', file: path, thread: 'selected' }), error('SESSION_LIMIT'));
});
test('missing SQLite database is not created', async t => {
  const path = join(await directory(t), 'missing.sqlite');
  await assert.rejects(readCaptureSource({ source: 'turnless', file: path, thread: 'selected' }), error('UNSUPPORTED_SCHEMA'));
  await assert.rejects(readFile(path), { code: 'ENOENT' });
});

function claudeToolCalls(calls) {
  return jsonl([
    { type: 'user', message: { role: 'user', content: 'Create a diagram from the supplied material.' } },
    { type: 'assistant', message: { model: 'claude-example', stop_reason: 'tool_use', content: calls.map(([name, input]) => ({ type: 'tool_use', name, input })) } },
    { type: 'user', message: { role: 'user', content: [{ type: 'tool_result', content: 'OUTPUT_SECRET', repository: 'OUTPUT_SECRET/repo', expectedSha256: 'e'.repeat(64) }] } },
    { type: 'assistant', message: { model: 'claude-example', stop_reason: 'end_turn', content: [] } },
  ]);
}

test('structured skills.read preserves explicit identifiers and content digests without inventing commit coordinates', () => {
  const digest = 'c'.repeat(64);
  const result = parseClaudeSession(claudeToolCalls([
    ['orchestrator', { request: { command: 'skills.read', id: 'illustration-guide', expectedSha256: digest, content: 'FILE_SECRET' } }],
  ]));
  assert.deepEqual(result.skills, [{ name: 'illustration-guide', expectedSha256: digest }]);
  assert.equal(result.skills[0].lastReviewedCommit, undefined);
  assert.equal(result.skills[0].repository, undefined);
  assert.equal(result.skills[0].directory, undefined);
  assert.ok(result.unknowns.some(text => /Exact historical skill directory/.test(text)));
  assert.ok(result.unknowns.some(text => /not evidence of a repository commit/.test(text)));
  safe(result);
});

test('skills.read preserves only explicitly recorded repositories, directories and real commit pins', () => {
  const commit = 'a'.repeat(40);
  const digest = 'd'.repeat(64);
  const result = parseClaudeSession(claudeToolCalls([
    ['skills.read', { id: 'diagram', repository: 'example/skills', directory: 'skills/diagram', lastReviewedCommit: commit, expectedSha256: digest }],
    ['wrapper', { command: 'skills.read', request: { id: 'colour', repository: 'https://example.org/skills', directory: 'colour', lastReviewedCommit: 'not-a-pin', expectedSha256: 'not-a-digest' } }],
  ]));
  assert.deepEqual(result.skills, [
    { name: 'diagram', repository: 'example/skills', directory: 'skills/diagram', lastReviewedCommit: commit, expectedSha256: digest },
    { name: 'colour', repository: 'https://example.org/skills', directory: 'colour' },
  ]);
  assert.deepEqual(result.references.filter(ref => ref.kind === 'repository'), [
    { kind: 'repository', label: 'Repository explicitly named in tool input', path: 'example/skills' },
    { kind: 'repository', label: 'Repository explicitly named in tool input', url: 'https://example.org/skills' },
  ]);
});

test('WebSearch/WebFetch and web.run expose input queries and real URLs but ignore opaque provider IDs', () => {
  const result = parseClaudeSession(claudeToolCalls([
    ['WebSearch', { query: 'diagram accessibility', results: [{ url: 'https://OUTPUT_SECRET.example' }] }],
    ['WebFetch', { url: 'https://example.org/guide', prompt: 'PROMPT_SECRET', content: 'FILE_SECRET' }],
    ['web.run', {
      search_query: [{ q: 'accessible diagram labels', result: 'OUTPUT_SECRET' }],
      image_query: [{ q: 'clear diagram examples' }],
      open: [{ ref_id: 'https://example.org/example' }, { ref_id: 'turn0search0' }],
      find: [{ ref_id: 'https://example.org/guide', pattern: 'PATTERN_SECRET' }],
      click: [{ ref_id: 'turn0view1', id: 3 }],
      screenshot: [{ ref_id: 'https://example.org/guide.pdf', pageno: 0 }],
      data: { url: 'https://NESTED_SECRET.example' },
    }],
  ]));
  assert.deepEqual(result.references.filter(ref => ref.purpose).map(ref => ref.purpose), ['diagram accessibility', 'accessible diagram labels', 'clear diagram examples']);
  assert.deepEqual([...new Set(result.references.filter(ref => ref.url).map(ref => ref.url))], ['https://example.org/guide', 'https://example.org/example', 'https://example.org/guide.pdf']);
  assert.ok(result.references.every(ref => ref.kind === 'web'));
  assert.doesNotMatch(JSON.stringify(result), /turn0search0|turn0view1/);
  safe(result);
});

test('Codex structured tool requests use the same extraction without decoding command strings or arbitrary nesting', () => {
  const result = parseCodexSession(jsonl([
    ...codexRows.slice(0, -1),
    { type: 'response_item', payload: { type: 'function_call', name: 'functions.web__run', arguments: JSON.stringify({ search_query: [{ q: 'legible chart layout' }], open: [{ ref_id: 'https://example.org/charts' }] }) } },
    { type: 'response_item', payload: { type: 'function_call', name: 'repo_tool', arguments: JSON.stringify({ repository: 'example/charts', command: '{"request":{"command":"skills.read","id":"COMMAND_SECRET"}}', data: { request: { command: 'skills.read', id: 'NESTED_SECRET' } } }) } },
    { type: 'response_item', payload: { type: 'function_call', name: 'orchestrator', arguments: JSON.stringify({ request: { command: 'skills.list', id: 'LIST_SECRET', expectedSha256: 'e'.repeat(64) } }) } },
    { type: 'event_msg', payload: { type: 'task_complete' } },
  ]));
  assert.equal(result.skills.length, 0);
  assert.ok(result.references.some(ref => ref.kind === 'repository' && ref.path === 'example/charts'));
  assert.ok(result.references.some(ref => ref.kind === 'web' && ref.purpose === 'legible chart layout'));
  assert.ok(result.references.some(ref => ref.url === 'https://example.org/charts'));
  safe(result);
});

test('Turnless relay and Board envelopes are not attributed to the creator; appended role context is removed', () => {
  const result = parseTurnlessSession({
    ...turnlessFixture,
    messages: [
      { threadId: 'selected', role: 'user', createdAt: '2026-01-01', text: '[T3 thread message — server-authored]\nFrom: another agent\nRELAY_SECRET https://RELAY_SECRET.example' },
      { threadId: 'selected', role: 'user', createdAt: '2026-01-02', text: 'Turnless assignment · assigned work\nASSIGNMENT_SECRET' },
      { threadId: 'selected', role: 'user', createdAt: '2026-01-03', text: 'Turnless resume · resume notification\nRESUME_SECRET' },
      { threadId: 'selected', role: 'user', createdAt: '2026-01-04', text: 'Turnless question · agent question\nQUESTION_SECRET' },
      { threadId: 'selected', role: 'user', createdAt: '2026-01-05', text: 'Make the diagram clearer.\n\nTurnless role: Builder ROLE_SECRET\nSelected skills: SKILL_SECRET\nhttps://INJECTION_SECRET.example' },
      { threadId: 'selected', role: 'user', createdAt: '2026-01-06', text: 'Add a legend.\nTurnless selected skills: SKILL_SECRET' },
      { threadId: 'selected', role: 'user', createdAt: '2026-01-07', text: 'Explain the phrase Turnless role: Builder in this document.' },
    ],
  });
  assert.deepEqual(result.prompts, [
    { text: 'Make the diagram clearer.' },
    { text: 'Add a legend.' },
    { text: 'Explain the phrase Turnless role: Builder in this document.' },
  ]);
  assert.deepEqual(result.references, []);
  safe(result);
});

test('shell and command wrappers never become prompts or references, independent of redaction', () => {
  const wrappers = ['bash-input', 'bash-stdout', 'bash-stderr', 'command-message', 'command-args', 'user_shell_command'];
  for (const source of ['claude-code', 'codex']) {
    const messages = wrappers.flatMap(tag => [
      `<${tag}>ordinary shell output and https://example.org/output</${tag}>`,
      `<${tag}>unfinished ordinary shell output`,
    ]);
    messages.push('Make 3 diagrams with warm colours for the landing page.');
    const rows = source === 'claude-code' ? [
      ...messages.map(text => ({ type: 'user', message: { role: 'user', content: text } })),
      { type: 'assistant', message: { model: 'claude-example', stop_reason: 'end_turn', content: [] } },
    ] : [
      { type: 'session_meta', payload: { id: 'synthetic-shell', model_provider: 'openai' } },
      ...messages.map(text => ({ type: 'response_item', payload: { type: 'message', role: 'user', content: [{ type: 'input_text', text }] } })),
      { type: 'response_item', payload: { type: 'message', role: 'assistant', phase: 'final_answer', content: [] } },
    ];
    const result = (source === 'claude-code' ? parseClaudeSession : parseCodexSession)(jsonl(rows));
    assert.deepEqual(result.prompts, [{ text: 'Make 3 diagrams with warm colours for the landing page.' }]);
    assert.deepEqual(result.references, []);
  }
});

test('shell wrappers also stay excluded in canonical Codex user events', () => {
  const result = parseCodexSession(jsonl([
    { type: 'event_msg', payload: { type: 'user_message', message: '<user_shell_command><command>echo notes</command><result>ordinary output</result></user_shell_command>' } },
    { type: 'event_msg', payload: { type: 'user_message', message: 'Make a diagram.' } },
    { type: 'event_msg', payload: { type: 'task_complete' } },
  ]));
  assert.deepEqual(result.prompts, [{ text: 'Make a diagram.' }]);
});

test('FIFOs and symlinks to FIFOs are rejected promptly for JSONL and SQLite inputs', { timeout: 10000, skip: process.platform === 'win32' }, async t => {
  const root = await directory(t);
  const fifo = join(root, 'synthetic.fifo');
  const link = join(root, 'synthetic-link');
  await execute('mkfifo', [fifo]);
  await symlink(fifo, link);
  // A subprocess timeout ensures a future blocking-open regression cannot hang
  // the test runner's fs worker threads or leave a FIFO reader behind.
  const moduleUrl = new URL('../src/capture-sources.mjs', import.meta.url).href;
  const script = `import { readCaptureSource } from ${JSON.stringify(moduleUrl)};
    try { await readCaptureSource({source:process.argv[1],file:process.argv[2],thread:process.argv[1]==='turnless'?'selected':undefined}); process.exitCode=2; }
    catch (error) { process.stdout.write(error.code ?? 'unexpected'); }`;
  for (const source of ['claude-code', 'turnless']) for (const file of [fifo, link]) {
    const result = await execute(process.execPath, ['--input-type=module', '--eval', script, source, file], { timeout: 2000 });
    assert.equal(result.stdout, 'INVALID_INPUT');
  }
});

test('WAL captures disclose coordination-file side effects and preserve database records', async t => {
  const root = await directory(t);
  const path = join(root, 'synthetic.sqlite');
  database(path);
  const writer = new DatabaseSync(path);
  writer.exec('PRAGMA journal_mode = WAL');
  writer.close();
  const before = await readFile(path);
  assert.deepEqual((await readdir(root)).sort(), ['synthetic.sqlite']);
  const result = await readCaptureSource({ source: 'turnless', file: path, thread: 'selected' });
  assert.deepEqual(result.prompts, [{ text: 'First prompt' }, { text: 'Follow up' }]);
  assert.deepEqual(await readFile(path), before);
  assert.ok(result.unknowns.some(text => /-wal and -shm coordination files/.test(text)));
  // Some SQLite versions leave these files, others remove them on close. Both
  // are valid; capture must not pretend read-only implies a pristine directory.
  assert.ok((await readdir(root)).every(name => ['synthetic.sqlite', 'synthetic.sqlite-wal', 'synthetic.sqlite-shm'].includes(name)));
});

test('WAL capture reads committed records still in the WAL without checkpointing the source', async t => {
  const path = join(await directory(t), 'synthetic.sqlite');
  database(path);
  const writer = new DatabaseSync(path);
  t.after(() => writer.close());
  writer.exec('PRAGMA journal_mode = WAL; PRAGMA wal_autocheckpoint = 0');
  writer.prepare("UPDATE projection_thread_messages SET text = ? WHERE message_id = 'a'").run('Prompt committed in the WAL');
  const mainBefore = await readFile(path);
  const walBefore = await readFile(`${path}-wal`);
  assert.ok(walBefore.length > 0);
  const result = await readCaptureSource({ source: 'turnless', file: path, thread: 'selected' });
  assert.equal(result.prompts[0].text, 'Prompt committed in the WAL');
  assert.deepEqual(await readFile(path), mainBefore);
  assert.deepEqual(await readFile(`${path}-wal`), walBefore);
});

test('Turnless reports missing authenticated sender provenance rather than guessing from prose', () => {
  const result = parseTurnlessSession({
    ...turnlessFixture,
    messages: [{ threadId: 'selected', role: 'user', text: 'From a collaborator: make a diagram.' }],
  });
  assert.deepEqual(result.prompts, [{ text: 'From a collaborator: make a diagram.' }]);
  assert.ok(result.unknowns.some(text => /do not identify the authenticated sender/.test(text)));
});
