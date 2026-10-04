import { open } from 'node:fs/promises';
import { constants, readSync } from 'node:fs';
import { isHarnessTool, shortToolName, nestedExecCalls, inspectShell } from './capture-inputs.mjs';

export const CAPTURE_LIMITS = Object.freeze({ bytes: 32 * 1024 * 1024, records: 100000 });
export class CaptureSourceError extends Error {
  constructor(code, message) { super(message); this.name = 'CaptureSourceError'; this.code = code; }
}
const fail = (code, message) => { throw new CaptureSourceError(code, message); };
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const string = value => typeof value === 'string' && value.trim().length > 0;
const active = value => ['running', 'pending', 'starting', 'connecting', 'inProgress', 'in_progress'].includes(value);
const unique = values => [...new Map(values.map(value => [JSON.stringify(value), value])).values()];
function empty(source) {
  // Bound retained evidence independently of transcript size. Deduplicate
  // metadata as it arrives, rather than retaining thousands of model repeats.
  let bytes = 0;
  const list = (deduplicate = true) => {
    const values = [];
    const seen = new Set();
    Object.defineProperty(values, 'push', { value(...items) {
      for (const item of items) {
        const key = JSON.stringify(item);
        if (deduplicate && seen.has(key)) continue;
        if (values.length >= 1000 || (bytes += Buffer.byteLength(key)) > 2_000_000) fail('SESSION_LIMIT', 'Retained capture evidence exceeds the safe draft limit.');
        if (deduplicate) seen.add(key);
        Array.prototype.push.call(values, item);
      }
      return values.length;
    } });
    return values;
  };
  return { source, models: list(), prompts: list(false), tools: list(), references: list(), skills: list(), unknowns: list() };
}
function finish(out) {
  for (const key of ['models', 'tools', 'references', 'skills', 'unknowns']) out[key] = unique(out[key]);
  if (!out.models.length) out.unknowns.push('Execution model was not recorded in the supported session metadata.');
  out.unknowns.push('Historical skill repository revisions are unknown unless explicitly recorded; current checkouts were not inspected.');
  if (!out.prompts.length) fail('NO_PROMPTS', 'No supported user prompts were found in the selected session.');
  return out;
}
function records(text) {
  if (typeof text !== 'string') fail('INVALID_INPUT', 'Session input must be JSONL text.');
  if (Buffer.byteLength(text) > CAPTURE_LIMITS.bytes) fail('SESSION_LIMIT', 'Session exceeds the 32 MiB capture limit.');
  const lines = text.split(/\r?\n/).filter(line => line.trim());
  if (lines.length > CAPTURE_LIMITS.records) fail('SESSION_LIMIT', 'Session exceeds the capture record limit.');
  return lines.map((line, index) => {
    let value;
    try { value = JSON.parse(line); } catch { fail('MALFORMED_SESSION', `Invalid session JSON at record ${index + 1}.`); }
    if (!object(value)) fail('MALFORMED_SESSION', `Invalid session record at record ${index + 1}.`);
    return value;
  });
}
function oneSession(ids) {
  if (new Set(ids.filter(string)).size > 1) fail('AMBIGUOUS_SESSION', 'Input contains multiple sessions; provide one session transcript.');
}
// Provider-injected context is not a creator prompt. Discard known envelopes,
// including their contents, before extracting either prompts or references.
function userText(value) {
  if (typeof value !== 'string') return '';
  // CLI shell/command wrappers are harness events, even when persisted with
  // the user role. Drop the whole message, including malformed open wrappers.
  if (/<(?:bash-input|bash-stdout|bash-stderr|command-message|command-args|user_shell_command)(?=[\s>/]|$)/i.test(value)) return '';
  if (/^\s*(?:\[T3 thread message [—-] server-authored\]|Turnless (?:assignment|resume|question)\s*·)/i.test(value)) return '';
  // Turnless appends role and selected-skill context after the creator's prose.
  value = value.replace(/(?:^|\r?\n)Turnless (?:role|selected skills):[\s\S]*$/i, '');
  if (/^\s*(?:# AGENTS\.md instructions|This session is being continued from a previous conversation|\[Request interrupted by user|<local-command-caveat>|<command-name>|<task-notification>|<subagent_notification>)/i.test(value)) return '';
  const envelopes = 'recommended_plugins|skills_instructions|available_skills|skill|subagents|system-reminder|environment_context|INSTRUCTIONS|user_instructions|developer_instructions|developer_message|permissions instructions|collaboration_mode|local-command-stdout|task-notification|subagent_notification|tool_result|file_contents';
  // Attachment metadata is opaque. Keep surrounding creator prose.
  value = value.replace(/<(appshot|image|attachment|attached_image)\b[^>]*>[\s\S]*?<\/\1>/gi, '');
  if (/<(?:appshot|image|attachment|attached_image)\b/i.test(value)) return '';
  const cleaned = value.replace(new RegExp(`<(${envelopes})\\b[^>]*>[\\s\\S]*?<\\/\\1>`, 'gi'), '').trim();
  // An incomplete envelope is unsafe to attribute to the creator.
  if (new RegExp(`<(${envelopes})\\b`, 'i').test(cleaned)) return '';
  return cleaned;
}
function prompt(out, text) {
  text = userText(text);
  if (!text) return;
  out.prompts.push({ text });
  for (const match of text.matchAll(/(?:^|\s)\$([a-zA-Z][a-zA-Z0-9_-]*(?::[a-zA-Z][a-zA-Z0-9_-]*)?)\b/g)) out.skills.push({ name: match[1] });
  for (const match of text.matchAll(/https?:\/\/[^\s<>"`]+/g)) {
    out.references.push({ kind: 'web', label: 'Reference in user prompt', url: match[0].replace(/[),.;]+$/, '') });
  }
}
function model(out, provider, name, agent) {
  if (!string(name) || name === '<synthetic>') return;
  out.models.push({ provider: string(provider) ? provider : 'unknown', model: name, agent, role: 'execution' });
}
function inputObject(value) {
  if (object(value)) return value;
  if (typeof value === 'string') { try { const parsed = JSON.parse(value); return object(parsed) ? parsed : {}; } catch {} }
  return {};
}
function tool(out, name, input, depth = 0) {
  if (!string(name) || depth > 8) return;
  const shortName = shortToolName(name);
  if (shortName === 'exec') {
    for (const call of nestedExecCalls(input)) tool(out, call.name, call.input, depth + 1);
    return;
  }
  if (isHarnessTool(name)) return;
  const shellTool = ['exec_command', 'shell', 'shell_command', 'run_command', 'bash', 'Bash'].includes(shortName);
  if (!shellTool) out.tools.push({ name, purpose: 'Observed in the session; creator must describe its purpose.' });
  const args = inputObject(input);
  inspectShell(name, typeof input === 'string' && !Object.keys(args).length ? input : args, {
    ingredient: (name, purpose) => out.tools.push({ name, purpose }),
    skill: (path, coordinates = {}) => {
      const skill = { ...coordinates };
      if (string(path)) {
        skill.directory = path.replace(/[/\\]?SKILL\.md$/i, '') || '.';
        skill.name = skill.directory.split(/[/\\]/).filter(Boolean).at(-1);
      }
      out.skills.push(skill);
    },
  });
  // Only documented input fields are inspected. Outputs and arbitrary data
  // objects never enter the evidence projection.

  const webReference = (value, label = 'Reference in tool input') => {
    if (typeof value === 'string' && /^https?:\/\//.test(value)) out.references.push({ kind: 'web', label, url: value });
  };
  const repositoryReference = value => {
    if (!string(value)) return;
    out.references.push({ kind: 'repository', label: 'Repository explicitly named in tool input', ...(/^https?:\/\//.test(value) ? { url: value } : { path: value }) });
  };
  const searchReference = value => {
    if (string(value)) out.references.push({ kind: 'web', label: 'Web search query', purpose: value });
  };
  for (const key of ['url', 'uri']) webReference(args[key]);
  repositoryReference(args.repository);
  for (const key of ['file_path', 'filePath', 'path']) if (string(args[key])) {
    out.references.push({ kind: 'document', label: 'File referenced by tool', path: args[key] });
    if (/(?:^|[/\\])SKILL\.md$/i.test(args[key])) out.skills.push({ directory: args[key].replace(/[/\\]?SKILL\.md$/i, '') || '.' });
  }
  if (/^Skill$/i.test(name) && string(args.skill)) out.skills.push({ name: args.skill });

  // Recognize only the documented skills.read request envelope. A digest of
  // skill contents is not a repository revision and must not become a commit.
  let skillRequest;
  if (name === 'skills.read') skillRequest = args;
  else if (args.request?.command === 'skills.read') skillRequest = args.request;
  else if (args.command === 'skills.read') skillRequest = object(args.request) ? args.request : args;
  if (skillRequest) {
    const skill = {};
    if (string(skillRequest.name ?? skillRequest.id)) skill.name = skillRequest.name ?? skillRequest.id;
    for (const key of ['repository', 'directory']) if (string(skillRequest[key])) skill[key] = skillRequest[key];
    if (/^(?:[a-f0-9]{40}|[a-f0-9]{64})$/i.test(skillRequest.lastReviewedCommit ?? '')) skill.lastReviewedCommit = skillRequest.lastReviewedCommit;
    if (/^[a-f0-9]{64}$/i.test(skillRequest.expectedSha256 ?? '')) skill.expectedSha256 = skillRequest.expectedSha256;
    if (Object.keys(skill).length) out.skills.push(skill);
    if (!skill.directory) out.unknowns.push('Exact historical skill directory was not recorded in the skills.read request.');
    if (!skill.repository) out.unknowns.push('Historical skill repository was not recorded in the skills.read request.');
    if (skill.expectedSha256) out.unknowns.push('A skills.read content SHA-256 was recorded; it is not evidence of a repository commit.');
    if (skillRequest.repository !== args.repository) repositoryReference(skillRequest.repository);
  }
  if (/^WebSearch$/i.test(name)) searchReference(args.query);
  if (['web.run', 'web__run', 'functions.web__run', 'functions.web.run'].includes(name)) {
    for (const key of ['search_query', 'image_query']) if (Array.isArray(args[key])) {
      for (const query of args[key]) if (object(query)) searchReference(query.q);
    }
    for (const key of ['open', 'find', 'click', 'screenshot']) if (Array.isArray(args[key])) {
      for (const reference of args[key]) if (object(reference)) webReference(reference.ref_id, 'URL supplied to web tool');
    }
  }
}
function blocks(content) { return Array.isArray(content) ? content : []; }

export function parseClaudeSession(text) { return parseClaudeRows(records(text)); }
function parseClaudeRows(rows) {
  let sessionId;
  const out = empty('claude-code');
  let state = 'unknown';
  const seen = new Set();
  for (const row of rows) {
    const id = row.sessionId ?? row.session_id;
    oneSession([sessionId, id]);
    if (string(id)) sessionId = id;
    if (row.isSidechain) { out.unknowns.push('Sidechain records were omitted; capture each agent session separately.'); continue; }
    if (row.uuid && seen.has(row.uuid)) continue;
    if (row.uuid) {
      if (seen.size >= CAPTURE_LIMITS.records) fail('SESSION_LIMIT', 'Session exceeds the replay tracking limit.');
      seen.add(row.uuid);
    }
    if (row.type === 'user' && !row.isMeta && !row.isCompactSummary && row.toolUseResult === undefined && (!row.message?.role || row.message.role === 'user')) {
      const content = row.message?.content;
      const texts = typeof content === 'string' ? [content] : blocks(content).filter(b => b.type === 'text').map(b => b.text);
      for (const text of texts) prompt(out, text);
      if (texts.some(text => userText(text))) state = 'active';
    }
    if (row.type === 'assistant') {
      model(out, 'anthropic', row.message?.model, 'Claude Code');
      for (const block of blocks(row.message?.content)) if (block.type === 'tool_use') tool(out, block.name, block.input);
      if (['end_turn', 'stop_sequence'].includes(row.message?.stop_reason)) state = 'finished';
      else if (row.message?.stop_reason === 'tool_use' || blocks(row.message?.content).some(b => b.type === 'tool_use')) state = 'active';
      else state = 'unknown';
    }
    if (row.type === 'result' || (row.type === 'system' && row.subtype === 'turn_duration')) state = 'finished';
    if (row.type === 'result' && row.is_error) out.unknowns.push('The session ended with an error; successful execution is not established.');
    if (row.type === 'system' && active(row.status)) state = 'active';
  }
  if (state === 'active') fail('ACTIVE_SESSION', 'Session has an unfinished turn; finish or export a completed session first.');
  if (state === 'unknown') out.unknowns.push('The transcript does not record a definitive completion marker; confirm it is finished.');
  out.unknowns.push('Claude Code runtime version and API hosting provider were not inferred from model names.');
  return finish(out);
}

function codexScan() {
  let meta = {};
  let id;
  let canonicalPrompts = false;
  return {
    row(row) {
      if (row.type === 'session_meta') {
        const p = row.payload ?? {};
        oneSession([id, p.id ?? p.session_id]);
        if (string(p.id ?? p.session_id)) id = p.id ?? p.session_id;
        if (p.forked_from_id || p.parent_thread_id || object(p.source?.subagent)) fail('AMBIGUOUS_SESSION', 'Forked/subagent rollouts contain inherited history; provide an isolated transcript.');
        meta = { model_provider: p.model_provider };
      }
      if (row.type === 'event_msg' && row.payload?.type === 'user_message') canonicalPrompts = true;
    },
    result() { return { meta, canonicalPrompts }; },
  };
}
export function parseCodexSession(text) {
  const rows = records(text);
  const scan = codexScan();
  for (const row of rows) scan.row(row);
  return parseCodexRows(rows, scan.result());
}
function parseCodexRows(rows, { meta, canonicalPrompts }) {
  const out = empty('codex');
  let state = 'unknown';
  for (const row of rows) {
    const p = row.payload;
    if (!object(p)) continue;
    if (row.type === 'turn_context') model(out, meta.model_provider, p.model, 'Codex');
    if (row.type === 'event_msg') {
      if (p.type === 'user_message') { prompt(out, p.message); state = 'active'; }
      if (['task_started', 'turn_started'].includes(p.type)) state = 'active';
      if (['task_complete', 'turn_complete', 'turn_aborted'].includes(p.type)) state = 'finished';
      if (p.type === 'turn_aborted') out.unknowns.push('A turn was interrupted; successful execution is not established.');
    }
    if (row.type === 'response_item') {
      if (!canonicalPrompts && p.type === 'message' && p.role === 'user') {
        for (const block of blocks(p.content)) if (['input_text', 'text'].includes(block.type)) prompt(out, block.text);
        state = 'active';
      }
      if (p.type === 'message' && p.role === 'assistant' && p.phase === 'final_answer') state = 'finished';
      if (['function_call', 'custom_tool_call'].includes(p.type)) tool(out, p.name, p.type === 'custom_tool_call' ? p.input ?? p.arguments : p.arguments);
      if (p.type === 'web_search_call') tool(out, 'web_search', {});
    }
  }
  if (state === 'active') fail('ACTIVE_SESSION', 'Session has an unfinished turn; finish or export a completed session first.');
  if (state === 'unknown') out.unknowns.push('The transcript does not record a definitive completion marker; confirm it is finished.');
  if (!canonicalPrompts) out.unknowns.push('User prompts came from response items; recognized harness instruction envelopes were omitted.');
  return finish(out);
}

function payload(row) {
  if (object(row.payload)) return row.payload;
  if (typeof row.payload_json !== 'string') return {};
  try { const value = JSON.parse(row.payload_json); if (object(value)) return value; } catch {}
  fail('MALFORMED_SESSION', 'Invalid JSON in selected thread metadata.');
}
function ordered(rows) {
  return [...rows].sort((a, b) => (a.sequence ?? 0) - (b.sequence ?? 0) || String(a.createdAt ?? a.created_at ?? '').localeCompare(String(b.createdAt ?? b.created_at ?? '')) || String(a.messageId ?? a.message_id ?? '').localeCompare(String(b.messageId ?? b.message_id ?? '')));
}
export function parseTurnlessSession(data) {
  if (!object(data) || !object(data.thread)) fail('INVALID_INPUT', 'Turnless input must contain one selected thread.');
  const id = data.thread.threadId ?? data.thread.thread_id ?? data.thread.id;
  if (!string(id)) fail('INVALID_INPUT', 'Turnless input is missing its selected thread ID.');
  const out = empty('turnless');
  const lists = ['messages', 'activities', 'turns', 'events'];
  for (const key of lists) {
    if (data[key] !== undefined && !Array.isArray(data[key])) fail('MALFORMED_SESSION', 'Invalid selected thread records.');
    if ((data[key]?.length ?? 0) > CAPTURE_LIMITS.records) fail('SESSION_LIMIT', 'Selected thread exceeds the capture record limit.');
    for (const row of data[key] ?? []) {
      if (!object(row)) fail('MALFORMED_SESSION', 'Invalid selected thread record.');
      const rowId = row.threadId ?? row.thread_id ?? row.stream_id;
      if (rowId && rowId !== id) fail('AMBIGUOUS_SESSION', 'Input contains records from another thread.');
    }
  }
  const session = data.session ?? {};
  if ((session.threadId ?? session.thread_id ?? id) !== id) fail('AMBIGUOUS_SESSION', 'Input contains records from another thread.');
  if (active(session.status) || session.activeTurnId || session.active_turn_id || (data.turns ?? []).some(turn => active(turn.state)) || (data.messages ?? []).some(message => message.isStreaming || message.is_streaming)) fail('ACTIVE_SESSION', 'Selected thread is active; finish its turn before capture.');
  for (const message of ordered(data.messages ?? [])) if (message.role === 'user') prompt(out, message.text);
  for (const event of ordered(data.events ?? [])) {
    const p = payload(event);
    if (p.threadId && p.threadId !== id) fail('AMBIGUOUS_SESSION', 'Input contains records from another thread.');
    if ((event.type ?? event.event_type) === 'thread.turn-start-requested' && p.modelSelection) {
      model(out, p.modelSelection.provider, p.modelSelection.model, 'Turnless');
      out.unknowns.push('Turnless models reflect historical turn requests; provider-side overrides are not available in this projection.');
    }
  }
  for (const activity of ordered(data.activities ?? [])) {
    const p = payload(activity);
    if (!/^tool\.(started|updated|completed|progress)$/.test(activity.kind ?? '')) continue;
    if (string(p.toolName)) tool(out, p.toolName, {});
    else if (string(p.itemType)) tool(out, p.itemType, {});
  }
  if (!data.session && !data.turns?.length) out.unknowns.push('Thread completion state was not supplied; confirm it is finished.');
  out.unknowns.push('Turnless activity projections may omit original tool names, input references, skills, and provider details.');
  out.unknowns.push('Turnless user-role records do not identify the authenticated sender. Known server envelopes were omitted; confirm ownership of all remaining prompts.');
  return finish(out);
}

// Total file size is unrestricted; each record and retained projection are
// bounded. Scan Codex metadata once, then replay through the same reducers used
// by synthetic string fixtures. Never retain raw records across iterations.
function parsedRecord(line, index) {
  let value;
  try { value = JSON.parse(line); } catch { fail('MALFORMED_SESSION', `Invalid session JSON at record ${index}.`); }
  if (!object(value)) fail('MALFORMED_SESSION', `Invalid session record at record ${index}.`);
  return value;
}
function* fileRecords(handle, size) {
  // Synchronous positional reads let the shared synchronous reducers consume a
  // lazy iterator. The open/stat lifecycle remains asynchronous and read-only.
  const buffer = Buffer.alloc(64 * 1024);
  let pieces = [];
  let length = 0;
  let offset = 0;
  let index = 0;
  while (offset < size) {
    const bytes = readSync(handle.fd, buffer, 0, Math.min(buffer.length, size - offset), offset);
    if (!bytes) fail('ACTIVE_SESSION', 'Session changed during capture; retry after it finishes.');
    offset += bytes;
    let start = 0;
    for (let i = 0; i < bytes; i++) if (buffer[i] === 10) {
      length += i - start;
      if (length > CAPTURE_LIMITS.bytes) fail('SESSION_LIMIT', 'Session record exceeds the 32 MiB capture limit.');
      pieces.push(Buffer.from(buffer.subarray(start, i)));
      const line = Buffer.concat(pieces, length).toString('utf8');
      pieces = []; length = 0; start = i + 1;
      if (line.trim()) yield parsedRecord(line, ++index);
    }
    length += bytes - start;
    if (length > CAPTURE_LIMITS.bytes) fail('SESSION_LIMIT', 'Session record exceeds the 32 MiB capture limit.');
    if (start < bytes) pieces.push(Buffer.from(buffer.subarray(start, bytes)));
  }
  if (length) {
    const line = Buffer.concat(pieces, length).toString('utf8');
    if (line.trim()) yield parsedRecord(line, ++index);
  }
}
async function readJsonl(file, source) {
  let handle;
  try {
    handle = await open(file, constants.O_RDONLY | (constants.O_NONBLOCK ?? 0));
    const before = await handle.stat();
    if (!before.isFile()) fail('INVALID_INPUT', 'Provide an explicit regular session file.');
    let result;
    if (source === 'codex') {
      const scan = codexScan();
      for (const row of fileRecords(handle, before.size)) scan.row(row);
      result = parseCodexRows(fileRecords(handle, before.size), scan.result());
    } else result = parseClaudeRows(fileRecords(handle, before.size));
    const after = await handle.stat();
    if (before.size !== after.size || before.mtimeMs !== after.mtimeMs || before.ctimeMs !== after.ctimeMs) fail('ACTIVE_SESSION', 'Session changed during capture; retry after it finishes.');
    return result;
  } catch (error) {
    if (error instanceof CaptureSourceError) throw error;
    fail('READ_FAILED', 'Could not read the explicit session file.');
  } finally { await handle?.close(); }
}

async function readTurnless(file, thread) {
  if (!string(thread)) fail('THREAD_REQUIRED', 'Turnless capture requires an explicit --thread ID.');
  let db;
  try {
    // Reject special files before SQLite opens the path. This descriptor is
    // nonblocking so an explicit FIFO (or a symlink to one) cannot hang capture.
    const input = await open(file, constants.O_RDONLY | (constants.O_NONBLOCK ?? 0));
    try {
      if (!(await input.stat()).isFile()) fail('INVALID_INPUT', 'Provide an explicit regular session file.');
    } finally { await input.close(); }
    let DatabaseSync;
    try { ({ DatabaseSync } = await import('node:sqlite')); }
    catch { fail('SQLITE_UNAVAILABLE', 'Turnless capture requires Node.js 22.13 or newer with node:sqlite support.'); }
    db = new DatabaseSync(file, { readOnly: true });
    db.exec('PRAGMA query_only = ON; BEGIN');
    // Do not use immutable=1 or copy the main file: either can omit committed
    // WAL data. A normal consistent read may create/update SQLite sidecars.
    const walMode = db.prepare('PRAGMA journal_mode').get().journal_mode === 'wal';
    const tables = new Set(db.prepare("SELECT name FROM sqlite_master WHERE type = 'table'").all().map(row => row.name));
    for (const table of ['projection_threads', 'projection_thread_messages', 'projection_thread_sessions', 'projection_turns']) if (!tables.has(table)) fail('UNSUPPORTED_SCHEMA', 'Unsupported Turnless database schema.');
    const selected = db.prepare('SELECT thread_id FROM projection_threads WHERE thread_id = ?').get(thread);
    if (!selected) fail('THREAD_NOT_FOUND', 'The selected thread was not found in this database.');
    const query = (table, columns, suffix = '') => {
      if (!tables.has(table)) return [];
      const rows = db.prepare(`SELECT ${columns} FROM ${table} WHERE thread_id = ? ${suffix} LIMIT ?`).all(thread, CAPTURE_LIMITS.records + 1);
      if (rows.length > CAPTURE_LIMITS.records || Buffer.byteLength(JSON.stringify(rows)) > CAPTURE_LIMITS.bytes) fail('SESSION_LIMIT', 'Selected thread exceeds the capture limit.');
      return rows;
    };
    const session = query('projection_thread_sessions', 'thread_id, status, active_turn_id')[0];
    const turns = query('projection_turns', 'thread_id, state');
    // Check liveness before fetching any prompt bodies.
    if (active(session?.status) || session?.active_turn_id || turns.some(turn => active(turn.state))) fail('ACTIVE_SESSION', 'Selected thread is active; finish its turn before capture.');
    if (db.prepare('SELECT 1 FROM projection_thread_messages WHERE thread_id = ? AND is_streaming = 1 LIMIT 1').get(thread)) fail('ACTIVE_SESSION', 'Selected thread is active; finish its turn before capture.');
    const promptSize = db.prepare("SELECT count(*) AS count, coalesce(sum(length(CAST(text AS BLOB))), 0) AS bytes FROM projection_thread_messages WHERE thread_id = ? AND role = 'user'").get(thread);
    if (promptSize.count > CAPTURE_LIMITS.records || promptSize.bytes > CAPTURE_LIMITS.bytes) fail('SESSION_LIMIT', 'Selected thread exceeds the capture limit.');
    const messages = query('projection_thread_messages', 'thread_id, message_id, role, text, created_at', "AND role = 'user' ORDER BY created_at, message_id");
    // Only metadata fields are selected; assistant/tool output never leaves SQL.
    const activities = query('projection_thread_activities', "thread_id, kind, json_object('toolName', json_extract(payload_json, '$.toolName'), 'itemType', json_extract(payload_json, '$.itemType')) AS payload_json", "AND kind IN ('tool.started','tool.updated','tool.completed','tool.progress')");
    let events = [];
    if (tables.has('orchestration_events')) {
      events = db.prepare("SELECT stream_id, event_type, sequence, json_object('modelSelection', json_extract(payload_json, '$.modelSelection')) AS payload_json FROM orchestration_events WHERE aggregate_kind = 'thread' AND stream_id = ? AND event_type = 'thread.turn-start-requested' ORDER BY sequence LIMIT ?").all(thread, CAPTURE_LIMITS.records + 1);
      if (events.length > CAPTURE_LIMITS.records) fail('SESSION_LIMIT', 'Selected thread exceeds the capture record limit.');
    }
    const result = parseTurnlessSession({ thread: selected, session, turns, messages, activities, events });
    if (walMode) result.unknowns.push('SQLite WAL reads may create or update -wal and -shm coordination files beside the source. Capture does not write database records or checkpoint the source.');
    db.exec('ROLLBACK');
    return result;
  } catch (error) {
    if (error instanceof CaptureSourceError) throw error;
    fail('UNSUPPORTED_SCHEMA', 'Could not read the selected thread from this Turnless database; check the file and supported schema.');
  } finally { db?.close(); }
}

export async function readCaptureSource({ source, file, thread } = {}) {
  if (!['claude-code', 'codex', 'turnless'].includes(source)) fail('UNSUPPORTED_SOURCE', 'Choose source claude-code, turnless, or codex.');
  if (!string(file)) fail('FILE_REQUIRED', 'Capture requires an explicit input file.');
  if (source === 'turnless') return readTurnless(file, thread);
  if (thread !== undefined) fail('INVALID_INPUT', '--thread applies to Turnless databases; select one JSONL session file for this source.');
  return readJsonl(file, source);
}
