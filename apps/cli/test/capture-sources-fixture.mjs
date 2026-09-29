// Synthetic transcripts only. Sentinels prove outputs do not become recipe text.
export const jsonl = rows => rows.map(row => JSON.stringify(row)).join('\n');
export const claudeRows = [
  { type: 'user', sessionId: 'synthetic-a', uuid: 'u1', message: { role: 'user', content: 'Make an illustrated guide using https://example.org/reference.' } },
  { type: 'assistant', sessionId: 'synthetic-a', message: { model: 'claude-example', content: [{ type: 'text', text: 'ASSISTANT_SECRET' }, { type: 'tool_use', name: 'Read', input: { file_path: 'skills/illustration/SKILL.md', content: 'FILE_SECRET' } }], stop_reason: 'tool_use' } },
  { type: 'user', sessionId: 'synthetic-a', message: { role: 'user', content: [{ type: 'tool_result', content: 'OUTPUT_SECRET https://secret.example/private', tool_use_id: 'x' }] } },
  { type: 'user', sessionId: 'synthetic-a', isMeta: true, message: { content: 'META_SECRET' } },
  { type: 'assistant', sessionId: 'synthetic-a', message: { model: 'claude-example', content: [], stop_reason: 'end_turn' } },
  { type: 'user', sessionId: 'synthetic-a', uuid: 'u2', message: { content: 'Use warmer colours.<system-reminder>ENVELOPE_SECRET</system-reminder>' } },
  { type: 'assistant', sessionId: 'synthetic-a', message: { model: 'claude-example-2', content: [], stop_reason: 'end_turn' } },
];
export const codexRows = [
  { type: 'session_meta', payload: { id: 'synthetic-codex', model_provider: 'openai', base_instructions: { text: 'BASE_SECRET' } } },
  { type: 'turn_context', payload: { model: 'gpt-example', developer_instructions: 'DEVELOPER_SECRET' } },
  { type: 'response_item', payload: { type: 'message', role: 'user', content: [{ type: 'input_text', text: '# AGENTS.md instructions\nINSTRUCTIONS_SECRET' }] } },
  { type: 'event_msg', payload: { type: 'task_started' } },
  { type: 'response_item', payload: { type: 'message', role: 'user', content: [{ type: 'input_text', text: 'Make a diagram.' }] } },
  { type: 'event_msg', payload: { type: 'user_message', message: 'Make a diagram.' } },
  { type: 'response_item', payload: { type: 'function_call', name: 'read_file', arguments: JSON.stringify({ path: 'reference.svg', command: 'COMMAND_SECRET' }) } },
  { type: 'response_item', payload: { type: 'function_call_output', output: 'OUTPUT_SECRET https://private.example/a' } },
  { type: 'response_item', payload: { type: 'message', role: 'assistant', content: [{ type: 'output_text', text: 'ASSISTANT_SECRET' }] } },
  { type: 'event_msg', payload: { type: 'task_complete' } },
  { type: 'turn_context', payload: { model: 'gpt-example-2' } },
  { type: 'event_msg', payload: { type: 'user_message', message: 'Add a legend.' } },
  { type: 'event_msg', payload: { type: 'task_complete' } },
];
export const turnlessFixture = {
  thread: { threadId: 'selected', modelSelection: { provider: 'wrong-current-provider', model: 'wrong-current-model' } },
  session: { threadId: 'selected', status: 'ready', activeTurnId: null },
  turns: [{ threadId: 'selected', state: 'completed' }],
  messages: [
    { threadId: 'selected', messageId: 'b', role: 'user', text: 'Add a legend.', createdAt: '2026-01-02' },
    { threadId: 'selected', messageId: 'a', role: 'user', text: 'Make a diagram.', createdAt: '2026-01-01' },
    { threadId: 'selected', messageId: 'c', role: 'assistant', text: 'ASSISTANT_SECRET', createdAt: '2026-01-03' },
  ],
  activities: [{ threadId: 'selected', kind: 'tool.completed', payload: { itemType: 'command_execution', detail: 'OUTPUT_SECRET', data: { output: 'NESTED_SECRET' } } }],
  events: [{ stream_id: 'selected', event_type: 'thread.turn-start-requested', sequence: 4, payload: { threadId: 'selected', modelSelection: { provider: 'codex', model: 'gpt-historical' } } }],
};
