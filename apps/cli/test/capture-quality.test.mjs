// Synthetic fixtures only: never add private rollout excerpts here.
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, open, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { parseCodexSession, readCaptureSource, CAPTURE_LIMITS } from '../src/capture-sources.mjs';
import { createCaptureDraft } from '../src/capture.mjs';
import { redactCapture } from '../src/capture-redaction.mjs';
import { jsonl } from './capture-sources-fixture.mjs';
const execute = promisify(execFile);
const user = text => ({ type: 'response_item', payload: { type: 'message', role: 'user', content: [{ type: 'input_text', text }] } });
const exec = input => ({ type: 'response_item', payload: { type: 'custom_tool_call', name: 'exec', input } });
const done = { type: 'event_msg', payload: { type: 'task_complete' } };
const session = rows => jsonl([{ type: 'session_meta', payload: { id: 'synthetic-quality', model_provider: 'openai' } }, ...rows, done]);
async function directory(t) {
  const root = await mkdtemp(join(tmpdir(), 'possible-quality-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  return root;
}

test('nested exec extracts only program/package names and API inputs, omitting coordination and output', () => {
  const result = parseCodexSession(session([
    user('Create an animated chart.'),
    exec(`const cmd = "uv run --with numpy==2.0 --with matplotlib python -c 'import numpy as np; print(123)' && npx -y playwright --output ARGUMENT_PRIVATE_SENTINEL && npm install --prefix OPTION_PRIVATE_SENTINEL vite@6 @example/charts@2 && curl https://INPUT_PRIVATE_SENTINEL.example/file";
      const r = await tools.exec_command({cmd, workdir:"/home/PATH_PRIVATE_SENTINEL"});
      await tools.web__run({search_query:[{q:"animated charts"}]});
      await tools.spawn_agent({message:"MESSAGE_PRIVATE_SENTINEL"});
      await tools.send_message({message:"MESSAGE_PRIVATE_SENTINEL"});
      await tools.write_stdin({chars:"INPUT_PRIVATE_SENTINEL"});
      text(r);`),
    ...['exec', 'wait', 'spawn_agent', 'send_message', 'list_agents', 'wait_agent', 'collaboration.followup_task', 'functions.update_plan'].map(name => ({ type: 'response_item', payload: { type: 'function_call', name, arguments: '{}' } })),
    { type: 'response_item', payload: { type: 'custom_tool_call_output', output: 'OUTPUT_PRIVATE_SENTINEL' } },
  ]));
  assert.deepEqual([...new Set(result.tools.map(t => t.name))], ['numpy', 'matplotlib', 'playwright', 'vite', '@example/charts', 'web__run']);
  assert.doesNotMatch(JSON.stringify(result), /PRIVATE_SENTINEL/);
  assert.deepEqual(result.references, [{ kind: 'web', label: 'Web search query', purpose: 'animated charts' }]);
});

test('exec inspection is static: strings, comments, dynamic arguments and file-writing heredocs stay opaque', () => {
  const result = parseCodexSession(session([
    user('Make a chart.'),
    exec(`// tools.exec_command({cmd: "npm install COMMENT_PRIVATE_SENTINEL"});
      const hidden = 'tools.exec_command({cmd: "npm install STRING_PRIVATE_SENTINEL"})';
      await tools.exec_command({cmd: getCommand()});
      await tools.exec_command({cmd: "cat > script.py <<'PY'\\nimport FILE_PRIVATE_SENTINEL\\nPY"});
      throw new Error("EXECUTION_PRIVATE_SENTINEL");`),
    exec('not valid javascript PRIVATE_SENTINEL'),
  ]));
  assert.deepEqual(result.tools, []);
  assert.doesNotMatch(JSON.stringify(result), /PRIVATE_SENTINEL/);
});

test('executed heredocs expose imported libraries but never string payloads or outputs', () => {
  const command = "python3 - <<'PY'\nimport numpy, scipy as sp\nfrom PIL import Image\nprint('OUTPUT_PRIVATE_SENTINEL')\nPY\nnode -e \"const x = require('three'); console.log('OUTPUT_PRIVATE_SENTINEL')\"";
  const result = parseCodexSession(session([user('Make a chart.'), exec(`await tools.exec_command({cmd:${JSON.stringify(command)}});`)]));
  assert.deepEqual([...new Set(result.tools.map(t => t.name))], ['numpy', 'scipy', 'PIL', 'three']);
  assert.doesNotMatch(JSON.stringify(result), /PRIVATE_SENTINEL/);
});

test('wrapped skill reads and creator mentions retain evidence without inventing repository revisions', () => {
  const commit = 'a'.repeat(40);
  const result = parseCodexSession(session([
    user('Use $diagram for a clear chart.'),
    exec(`await tools.exec_command({cmd:"sed -n '1,200p' skills/diagram/SKILL.md && cat skills/colour/SKILL.md && tail -80 skills/colour/SKILL.md"});
      await tools.skills.read({id:"diagram",repository:"example/skills",directory:"skills/diagram",lastReviewedCommit:"${commit}",expectedSha256:"${'b'.repeat(64)}"});`),
  ]));
  assert.deepEqual(result.skills, [
    { name: 'diagram' }, { name: 'diagram', directory: 'skills/diagram' }, { name: 'colour', directory: 'skills/colour' },
    { name: 'diagram', repository: 'example/skills', directory: 'skills/diagram', lastReviewedCommit: commit, expectedSha256: 'b'.repeat(64) },
  ]);
  const { capture } = redactCapture(result);
  assert.equal(capture.skills.at(-1).lastReviewedCommit, commit);
  assert.ok(capture.skills.every(s => !s.repository && !s.directory));
});

test('explicit skill download/install coordinates are recorded; branch names and archive audits do not become skill commits', () => {
  const commit = 'c'.repeat(40);
  const cmd = `curl https://raw.githubusercontent.com/example/skills/${commit}/skills/diagram/SKILL.md && curl https://raw.githubusercontent.com/example/skills/main/skills/colour/SKILL.md && npx -y skills add example/skills@${commit} --skill layout && curl https://github.com/example/skills/archive/${commit}.tar.gz`;
  const result = parseCodexSession(session([user('Make a chart.'), exec(`await tools.exec_command({cmd:${JSON.stringify(cmd)}});`)]));
  assert.deepEqual(result.skills, [
    { name: 'diagram', directory: 'skills/diagram', repository: 'example/skills', lastReviewedCommit: commit },
    { name: 'colour', directory: 'skills/colour', repository: 'example/skills' },
    { name: 'layout', repository: 'example/skills', lastReviewedCommit: commit },
  ]);
  assert.ok(!result.tools.some(t => t.name.includes('example/skills')));
});

test('harness skill/plugin envelopes and attached images are omitted before redaction, retaining creator text', () => {
  const result = parseCodexSession(session([
    user('<recommended_plugins>ENVELOPE_PRIVATE_SENTINEL https://private.example</recommended_plugins>'),
    user('<skill><name>diagram</name><path>SKILL_PRIVATE_SENTINEL</path></skill>'),
    user('<skills_instructions>SKILL_PRIVATE_SENTINEL $fake</skills_instructions>'),
    user('<recommended_plugins>UNFINISHED_PRIVATE_SENTINEL'),
    user(`Create a pastel gallery.\n<appshot><image>${'ATTACHMENT_PRIVATE_SENTINEL'.repeat(30000)}</image></appshot>\nUse generous margins.`),
    user('Add captions.<attachment>ATTACHMENT_PRIVATE_SENTINEL</attachment>'),
  ]));
  assert.deepEqual(result.prompts.map(p => p.text), ['Create a pastel gallery.\n\nUse generous margins.', 'Add captions.']);
  assert.deepEqual(result.references, []);
  assert.deepEqual(result.skills, []);
  const { capture, findings } = redactCapture(result);
  assert.deepEqual(capture.prompts, result.prompts);
  assert.ok(!findings.some(f => f.category === 'pasted-content'));
});

test('canonical events and response-only transcripts apply the same attachment/envelope filtering', () => {
  const result = parseCodexSession(session([
    user('DUPLICATE_PRIVATE_SENTINEL'),
    { type: 'event_msg', payload: { type: 'user_message', message: '<recommended_plugins>ENVELOPE_PRIVATE_SENTINEL</recommended_plugins>Make a chart.<image>IMAGE_PRIVATE_SENTINEL</image>' } },
  ]));
  assert.deepEqual(result.prompts, [{ text: 'Make a chart.' }]);
});

test('steps have deterministic prompt titles; trivial turns join the preceding step after redaction', async t => {
  const root = await directory(t);
  const file = join(root, 'synthetic.jsonl');
  await writeFile(file, session([user('Please create an animated chart. Use soft colours.'), user('yes'), user('Continue!'), user('Add a legend and accessible labels.'), user('proceed'), user('Contact fake@example.invalid and improve spacing.')]));
  const out = join(root, 'draft');
  await createCaptureDraft({ source: 'codex', file, out });
  const draft = JSON.parse(await readFile(join(out, 'draft.json'), 'utf8'));
  assert.deepEqual(draft.manifest.recipe.steps.map(s => s.title), ['Create an animated chart', 'Add a legend and accessible labels', 'Contact and improve spacing']);
  assert.equal(draft.manifest.recipe.steps[0].prompt, 'Please create an animated chart. Use soft colours.\n\nyes\n\nContinue!');
  assert.equal(draft.manifest.recipe.steps[1].prompt, 'Add a legend and accessible labels.\n\nproceed');
  assert.doesNotMatch(JSON.stringify(draft), /fake@example|(?:Creator|User) prompt \d|User message recorded/);
  assert.equal((await stat(out)).mode & 0o777, 0o700);
  await assert.rejects(stat(join(out, 'approval.json')), { code: 'ENOENT' });
});

test('split credentials remain redacted before creating any derived step title', async t => {
  const root = await directory(t);
  const file = join(root, 'synthetic.jsonl');
  await writeFile(file, session([user('sk-'), user('syntheticTest123456789'), user('continue'), user('Improve the chart.')]));
  await createCaptureDraft({ source: 'codex', file, out: join(root, 'draft') });
  const text = await readFile(join(root, 'draft', 'draft.json'), 'utf8');
  assert.doesNotMatch(text, /syntheticTest/);
  assert.match(text, /Review redacted instructions/);
});

test('titles drop acknowledgements and filler, end before long phrases, and prompts have no title prefixes', async t => {
  const root = await directory(t);
  const file = join(root, 'synthetic.jsonl');
  const prompts = [
    'Works nicely. Now create a lantern display as one self-contained scene with soft lighting.',
    'Looks great! Next make the Seed scene look good as a colourful garden.',
    'Also add warm lights, and render a long panoramic view of the entire scene.',
    'Build an intricately decorated enormous luminous fantastical ceremonial paper lantern installation.',
    'Looks great!',
    'Works nicely.',
  ];
  await writeFile(file, session(prompts.map(user)));
  const out = join(root, 'draft');
  await createCaptureDraft({ source: 'codex', file, out });
  const draft = JSON.parse(await readFile(join(out, 'draft.json'), 'utf8'));
  assert.deepEqual(draft.manifest.recipe.steps.map(s => s.title), [
    'Create a lantern display as one self-contained scene', 'Make the Seed scene look good', 'Add warm lights', 'Review redacted instructions',
  ]);
  assert.ok(draft.manifest.recipe.steps.every(s => s.title.split(/\s+/).length <= 9));
  assert.equal(draft.prompt, prompts.join('\n\n'));
  assert.doesNotMatch(draft.prompt, /Create a lantern display:\n|Make the Seed scene look good:\n/);
  const again = join(root, 'again');
  await createCaptureDraft({ source: 'codex', file, out: again });
  assert.deepEqual(JSON.parse(await readFile(join(again, 'draft.json'), 'utf8')).manifest.recipe.steps, draft.manifest.recipe.steps);
});

test('large files stream under a small heap and match the string parser without loading outputs', { timeout: 30000 }, async t => {
  const root = await directory(t);
  const file = join(root, 'large.jsonl');
  const handle = await open(file, 'wx');
  const prefix = [{ type: 'session_meta', payload: { id: 'synthetic-quality', model_provider: 'openai' } }, user('Create a chart.')];
  await handle.write(jsonl(prefix) + '\n');
  const output = JSON.stringify({ type: 'response_item', payload: { type: 'function_call_output', output: 'OUTPUT_PRIVATE_SENTINEL' + 'x'.repeat(512 * 1024) } }) + '\n';
  for (let i = 0; i < 140; i++) await handle.write(output);
  await handle.write(JSON.stringify(done));
  await handle.close();
  assert.ok((await stat(file)).size > CAPTURE_LIMITS.bytes * 2);
  const module = new URL('../src/capture-sources.mjs', import.meta.url).href;
  const script = `import {readCaptureSource} from ${JSON.stringify(module)}; console.log(JSON.stringify(await readCaptureSource({source:'codex',file:process.argv[1]})));`;
  const { stdout } = await execute(process.execPath, ['--max-old-space-size=64', '--input-type=module', '--eval', script, file]);
  assert.deepEqual(JSON.parse(stdout), parseCodexSession(jsonl([...prefix, done])));
  assert.doesNotMatch(stdout, /PRIVATE_SENTINEL/);
});

test('streamed files preserve safe errors and bound individual records and retained evidence', async t => {
  const root = await directory(t);
  const file = join(root, 'bad.jsonl');
  await writeFile(file, 'MALFORMED_PRIVATE_SENTINEL');
  await assert.rejects(readCaptureSource({ source: 'codex', file }), e => e.code === 'MALFORMED_SESSION' && !e.message.includes('PRIVATE_SENTINEL'));
  await writeFile(file, 'x'.repeat(CAPTURE_LIMITS.bytes + 1));
  await assert.rejects(readCaptureSource({ source: 'codex', file }), { code: 'SESSION_LIMIT' });
  await writeFile(file, session(Array.from({ length: 1001 }, () => user('Make a chart.'))));
  await assert.rejects(readCaptureSource({ source: 'codex', file }), { code: 'SESSION_LIMIT' });
});

test('acknowledgement sentences fold into the prior step, leading skill tokens leave titles, tools are unique, plumbing and standard modules are omitted', async t => {
  const root = await directory(t);
  const file = join(root, 'synthetic.jsonl');
  await writeFile(file, session([
    user('$possible\n\nI want to make a paper lantern.'),
    user('Yes, proceed with this pack.'),
    user('Continue from my previous answer.'),
    user('Render it at dusk.'),
    exec('await tools.exec_command({ cmd: "git status && rg lantern && python3 -c \'import os, math, json\\nimport trimesh\' && python3 -m json.tool x && blender -b && blender -b" });'),
  ]));
  const out = join(root, 'draft');
  await createCaptureDraft({ source: 'codex', file, out });
  const draft = JSON.parse(await readFile(join(out, 'draft.json'), 'utf8'));
  assert.deepEqual(draft.manifest.recipe.steps.map(s => s.title), ['Make a paper lantern', 'Render it at dusk']);
  assert.match(draft.manifest.recipe.steps[0].prompt, /Yes, proceed with this pack\.\n\nContinue from my previous answer\.$/);
  assert.deepEqual(draft.manifest.recipe.tools.map(t => t.name), ['trimesh', 'blender']);
});

test('long one-line and unterminated-heredoc commands are inspected in linear time', () => {
  for (const cmd of ['echo ' + 'a'.repeat(256 * 1024 - 10), 'python3 - <<EOF\n' + 'a'.repeat(250 * 1024), ('cat <<X\n').repeat(20000)]) {
    const started = performance.now();
    parseCodexSession(session([user("Go."), exec(`await tools.exec_command({ cmd: ${JSON.stringify(cmd)} });`)]));
    assert.ok(performance.now() - started < 1000, `took ${Math.round(performance.now() - started)}ms`);
  }
});

test('terminated heredocs still expose imports', () => {
  const result = parseCodexSession(session([user("Go."), exec(`await tools.exec_command({ cmd: ${JSON.stringify("python3 - <<'PY'\nimport trimesh\nPY\nls")} });`)]));
  assert.deepEqual(result.tools.map(t => t.name), ['trimesh']);
});
