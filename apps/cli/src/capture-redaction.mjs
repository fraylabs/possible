import { invisibleTextSpans, hasInvisibleText } from './text-safety.mjs';

/** Local, conservative draft filtering. This is not proof that a draft is safe to publish. */
const REDACTED = '[REDACTED — creator review required]';
const MAX_TEXT = 2000;
const MAX_ITEMS = 1000;
const MAX_TOTAL = 2_000_000;
const RULES = [
  ['credential', /-----BEGIN [^-\n]*(?:PRIVATE KEY|CERTIFICATE)[^-\n]*-----[\s\S]*?(?:-----END [^-\n]+-----|$)/g],
  ['credential', /\b(?:sk-(?:ant-|proj-|svcacct-)?[a-zA-Z0-9_-]{8,}|(?:gh[pousr]_|github_pat_)[a-zA-Z0-9_]{8,}|(?:AKIA|ASIA)[A-Z0-9]{16}|xox[baprs]-[a-zA-Z0-9-]{8,}|AIza[a-zA-Z0-9_-]{15,}|npm_[a-zA-Z0-9]{10,}|(?:pk|sk)_(?:live|test)_[a-zA-Z0-9]{8,})\b/g],
  ['credential', /\beyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/g],
  ['email', /[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+/g],
  ['url', /\b[a-zA-Z][a-zA-Z0-9+.-]*:\/\/[^\s<>"'\])}]+/g],
  ['url', /\bwww\.[^\s<>"'\])}]+/gi],
  ['path', /(?<![\w./\\-])(?:[a-zA-Z]:[\\/]|\\\\|~\/|\/(?!\/))[\w. @+-][^\s<>"'\])},;]*/g],
  ['network-address', /\b(?:\d{1,3}\.){3}\d{1,3}(?::\d{1,5})?\b/g],
  ['network-address', /(?<![\w:])(?:[a-fA-F0-9]{0,4}:){2,}[a-fA-F0-9:]{0,4}(?:%[\w]+)?(?![\w:])/g],
  ['phone', /(?<!\w)(?:\+?\d[\d(). -]{6,}\d)(?!\w)/g],
  ['repository', /\b[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+(?:\/[a-zA-Z0-9_.-]+)*/g],
  ['repository', /\b(?:private\s+repo(?:sitory)?|repo(?:sitory)?\s*(?:name|id))\s*(?::|=|is)?\s*[\w.-]+/gi],
];
const MESSAGES = {
  credential: 'Possible credential removed.',
  email: 'Possible email address removed.',
  url: 'URL removed; destination privacy and embedded credentials need creator review.',
  path: 'Local path removed.',
  'network-address': 'Possible network address removed.',
  phone: 'Possible phone number removed.',
  repository: 'Repository identifier removed; public visibility has not been established.',
  opaque: 'Opaque or high-entropy value removed; its meaning needs creator review.',
};

function invalid() { throw new Error('Unsafe or malformed normalized capture; no draft was produced.'); }
function record(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value) || ![Object.prototype, null].includes(Object.getPrototypeOf(value))) invalid();
  const descriptors = Object.getOwnPropertyDescriptors(value);
  if (Object.values(descriptors).some((d) => !Object.hasOwn(d, 'value'))) invalid();
  return value;
}
// Detector transforms carry raw offsets, so safe prose is never normalized or
// percent-decoded in the resulting recipe just because we inspected it.
function transformMapped(state, pattern, replacement) {
  let cursor = 0;
  let text = '';
  const map = [];
  for (const match of state.text.matchAll(pattern)) {
    text += state.text.slice(cursor, match.index);
    for (const entry of state.map.slice(cursor, match.index)) map.push(entry);
    const value = replacement(match);
    const range = { start: state.map[match.index].start, end: state.map[match.index + match[0].length - 1].end };
    text += value;
    for (let i = 0; i < value.length; i++) map.push(range);
    cursor = match.index + match[0].length;
  }
  text += state.text.slice(cursor);
  // Avoid argument-count limits for large synthetic input.
  for (const entry of state.map.slice(cursor)) map.push(entry);
  return { text, map };
}
function decodeMapped(raw) {
  let state = { text: raw, map: Array.from({ length: raw.length }, (_, i) => ({ start: i, end: i + 1 })) };
  const invisible = [];
  for (let i = 0; i < 4; i++) {
    const before = state.text;
    state = transformMapped(state, /\\u\{([a-fA-F0-9]{1,6})\}|\\u([a-fA-F0-9]{4})|\\x([a-fA-F0-9]{2})|\\([nrt/])|%([a-fA-F0-9]{2})/g, (match) => {
      if (match[4]) return match[4] === '/' ? '/' : ' ';
      const code = Number.parseInt(match[1] ?? match[2] ?? match[3] ?? match[5], 16);
      return code <= 0x10ffff ? String.fromCodePoint(code) : '';
    });
    if (state.text === before) break;
  }
  const unsafe = invisibleTextSpans(state.text);
  let unsafeIndex = 0;
  state = transformMapped(state, /[\s\S]/gu, (match) => {
    while (unsafeIndex < unsafe.length && unsafe[unsafeIndex].end <= match.index) unsafeIndex++;
    if (unsafeIndex < unsafe.length && unsafe[unsafeIndex].start <= match.index) {
      invisible.push({ start: state.map[match.index].start, end: state.map[match.index + match[0].length - 1].end, category: 'invisible-text' });
      return '';
    }
    return match[0].normalize('NFKC');
  });
  // Private-use glyphs can visually split a credential. Ignore them only in the
  // detector view; preserve ordinary text unless a sensitive span includes them.
  state = transformMapped(state, /\p{Co}/gu, () => '');
  return { ...state, invisible };
}
function decode(text) { return decodeMapped(text).text; }
function entropy(value) {
  const counts = new Map();
  for (const char of value) counts.set(char, (counts.get(char) ?? 0) + 1);
  return [...counts.values()].reduce((total, n) => total - n / value.length * Math.log2(n / value.length), 0);
}
// A deliberately narrow skeleton for common Latin lookalikes in credential
// prefixes. It is used only to detect credentials, never to rewrite user prose.
const PREFIX_LOOKALIKES = new Map(Object.entries({
  'Ꭺ': 'A', 'ɡ': 'g',
  'А': 'A', 'В': 'B', 'С': 'C', 'Е': 'E', 'Н': 'H', 'І': 'I', 'Ј': 'J', 'К': 'K', 'М': 'M', 'О': 'O', 'Р': 'P', 'Ѕ': 'S', 'Т': 'T', 'Х': 'X',
  'һ': 'h', 'ӏ': 'l', 'а': 'a', 'с': 'c', 'е': 'e', 'і': 'i', 'ј': 'j', 'о': 'o', 'р': 'p', 'ѕ': 's', 'х': 'x', 'у': 'y',
  'Α': 'A', 'Β': 'B', 'Ε': 'E', 'Ζ': 'Z', 'Η': 'H', 'Ι': 'I', 'Κ': 'K', 'Μ': 'M', 'Ν': 'N', 'Ο': 'O', 'Ρ': 'P', 'Τ': 'T', 'Υ': 'Y', 'Χ': 'X', 'ο': 'o',
}));
function credentialSkeleton(text) { return text.replace(/[\u0261\u0370-\u03ff\u0400-\u052f\u13aa]/g, (char) => PREFIX_LOOKALIKES.get(char) ?? char); }
function matches(text, { credentialsOnly = false } = {}) {
  const found = [];
  const skeleton = credentialSkeleton(text);
  for (const [category, pattern] of RULES) {
    if (credentialsOnly && category !== 'credential') continue;
    pattern.lastIndex = 0;
    for (const match of (category === 'credential' ? skeleton : text).matchAll(pattern)) {
      if (category === 'repository' && /^(?:A\/B|and\/or|\d+\/\d+)$/i.test(match[0])) continue;
      found.push({ start: match.index, end: match.index + match[0].length, category });
    }
  }
  // Keyword prose is not an assignment. A quoted value or a value-like token is;
  // bare lowercase values are accepted after :/=, but ordinary lead-in words are not.
  const assignments = /\b([a-zA-Z0-9_-]*(?:api[ _-]?key|access[ _-]?key|secret|password|passwd|pass|token|authorization|credential)[a-zA-Z0-9_-]*)["']?\s*(:|=|\bis\b)\s*(?:"([^"\n]+)"|'([^'\n]+)'|([^\s,;}"']+))/gi;
  for (const match of skeleton.matchAll(assignments)) {
    const value = match[3] ?? match[4] ?? match[5];
    const quoted = match[3] !== undefined || match[4] !== undefined;
    if (!quoted && /^(?:a|an|the|in|from|for|not|never|to|your|our|this|that|refreshed|stored|rotated|needed|required|optional|available|unknown|redacted)$/i.test(value)) continue;
    const valueLike = /[0-9_+=!@#$%^&*/-]/.test(value) || (/[A-Z]/.test(value) && /[a-z]/.test(value));
    if (quoted || valueLike || (match[2] !== 'is' && value.length >= 4)) found.push({ start: match.index, end: match.index + match[0].length, category: 'credential' });
  }
  // A value-like password can also be stated without punctuation. Numbers
  // alone and ordinary prose such as "password fields" are not credential values.
  for (const match of skeleton.matchAll(/\b(?:password|passwd|pass|api[ _-]?key|access[ _-]?key|secret|token)\s+(?:(?:is|value|of)\s+)?([^\s,;}"']+)/gi)) {
    const value = match[1].replace(/[.,;]+$/, '');
    if (/\d/.test(value) && ((/[A-Z]/.test(value) && /[a-z]/.test(value)) || /[^a-zA-Z0-9]/.test(value))) {
      found.push({ start: match.index, end: match.index + match[0].length, category: 'credential' });
    }
  }
  for (const match of skeleton.matchAll(/\b(?:bearer|basic)\s+([a-zA-Z0-9+/=_:.-]{8,})/gi)) {
    const token = match[1].replace(/[.,]+$/, '');
    if (/[0-9+/=_:-]/.test(token) || (/[A-Z]/.test(token) && /[a-z]/.test(token))) found.push({ start: match.index, end: match.index + match[0].length, category: 'credential' });
  }
  if (!credentialsOnly) for (const match of text.matchAll(/[a-zA-Z0-9+/_=-]{24,}/g)) {
    const value = match[0];
    if (entropy(value) >= 3.5 || /^[a-fA-F0-9]{24,}$/.test(value) || value.length >= 32) found.push({ start: match.index, end: match.index + value.length, category: 'opaque' });
  }
  return found;
}
function detectedSpans(raw, { credentialsOnly = false, boundaries = [] } = {}) {
  const decoded = decodeMapped(raw);
  const spans = matches(decoded.text, { credentialsOnly }).map((span) => ({ ...span, start: decoded.map[span.start].start, end: decoded.map[span.end - 1].end }));
  // Compact only recognized credential prefixes, not arbitrary prose/opaque
  // text. Keep spaces in assignment values so prose cannot become a password.
  const compact = transformMapped(decoded, /\s+/g, () => '');
  const skeleton = credentialSkeleton(compact.text);
  for (const [category, pattern] of RULES) {
    if (category !== 'credential' || pattern.source.includes('BEGIN')) continue;
    const detector = new RegExp(pattern.source.replace(/\\b/g, ''), pattern.flags);
    for (const match of skeleton.matchAll(detector)) {
      const start = compact.map[match.index].start;
      let end = compact.map[match.index + match[0].length - 1].end;
      // Removing whitespace must not turn task-management or risk-free into an
      // sk- key. Check the boundary in the decoded original, not the compact view.
      const previous = decode(raw.slice(0, start)).at(-1);
      if (previous && /[\p{L}\p{N}_]/u.test(previous) && !boundaries.includes(start)) continue;
      const fragmentText = decode(raw.slice(start, end));
      const fragments = fragmentText.trim().split(/\s+/);
      if (fragments.length > 1) {
        const singlySpaced = fragments.every((fragment) => fragment.length === 1);
        const tokenLikeTail = fragments.slice(1).some((fragment) => /[a-zA-Z]/.test(fragment) && /[0-9_=-]/.test(fragment) || /[A-Z].*[a-z]|[a-z].*[A-Z]/.test(fragment));
        const credentialContext = /\b(?:key|token|credential|secret)\s*[:=]?\s*$/i.test(raw.slice(Math.max(0, start - 30), start));
        if (!singlySpaced && !boundaries.some((boundary) => boundary > start && boundary < end) && /^ASIA$/i.test(fragments[0]) && /^[A-Z]{2,}$/.test(fragments[1]) && !credentialContext) continue;
        if (!singlySpaced && !tokenLikeTail && !/^(?:AKIA|ASIA)[A-Z0-9]*$/.test(fragments[0]) && !spans.some((span) => span.category === 'credential' && span.start === start)) continue;
      }
      // Stop compact matches at ordinary prose following a complete key. A
      // synthetic continuation such as FAKEfake0123 still remains in the match.
      const segment = raw.slice(start, end);
      for (const gap of segment.matchAll(/\s+([a-z]*[A-Z]?[a-z]+)(?=\s|$|[.!?,;])/g)) {
        const prefix = decode(segment.slice(0, gap.index)).replace(/\s/g, '');
        const prefixDetector = new RegExp(pattern.source.replace(/\\b/g, ''), pattern.flags);
        if (prefixDetector.test(credentialSkeleton(prefix))) { end = start + gap.index; break; }
      }
      spans.push({ start, end, category: 'credential' });
    }
  }
  return { spans, invisible: decoded.invisible };
}
function replaceSpans(raw, spans) {
  const merged = [];
  for (const span of spans.toSorted((a, b) => a.start - b.start)) {
    const previous = merged.at(-1);
    if (previous && span.start <= previous.end) { previous.end = Math.max(previous.end, span.end); previous.removeOnly &&= span.removeOnly; }
    else merged.push({ ...span });
  }
  let result = raw;
  for (const span of merged.reverse()) result = result.slice(0, span.start) + (span.removeOnly ? '' : REDACTED) + result.slice(span.end);
  return result;
}

export function redactCapture(normalized) {
  try { return redact(normalized); } catch { invalid(); }
}
function redact(normalized) {
  record(normalized);
  const findings = [];
  let total = 0;
  const add = (category, location, message = MESSAGES[category]) => {
    if (!findings.some((item) => item.category === category && item.location === location)) findings.push({ category, location, message });
  };
  const allowed = (obj, fields, location) => {
    record(obj);
    if (Object.keys(obj).some((key) => !fields.includes(key))) add('excluded-data', location, 'Unrecognized fields were excluded, including any tool outputs or file contents.');
  };
  const string = (value) => {
    if (typeof value !== 'string') invalid();
    total += value.length;
    if (total > MAX_TOTAL) invalid();
    return value;
  };
  const sanitize = (value, location, { pin = false, contentHash = false } = {}) => {
    const text = string(value);
    if (pin && /^(?:[a-fA-F0-9]{40}|[a-fA-F0-9]{64})$/.test(text)) return text;
    if (text.length > MAX_TEXT || /```|~~~/.test(text)) {
      add('pasted-content', location, 'Large or fenced pasted content removed; add only the reusable instructions after review.');
      return REDACTED;
    }
    if (pin) {
      add('opaque', location, contentHash ? 'Unverified skill content hash removed; add a reviewed full content hash.' : 'Unverified skill revision removed; add a reviewed full commit pin.');
      return REDACTED;
    }
    const { spans, invisible } = detectedSpans(text);
    if (invisible.length) add('invisible-text', location, 'Invisible or control characters were removed; inspect the visible wording before reuse.');
    for (const span of spans) add(span.category, location);
    return replaceSpans(text, [...spans, ...invisible.map((span) => ({ ...span, removeOnly: true }))]);
  };
  const list = (name, fields, mapper) => {
    const values = normalized[name] === undefined ? [] : normalized[name];
    if (!Array.isArray(values) || values.length > MAX_ITEMS) invalid();
    for (let index = 0; index < values.length; index++) {
      if (!Object.hasOwn(Object.getOwnPropertyDescriptor(values, index) ?? {}, 'value')) invalid();
    }
    return values.map((value, index) => {
      const location = `${name}[${index}]`;
      allowed(value, fields, location);
      return mapper(value, location);
    });
  };
  const copy = (value, fields, location) => Object.fromEntries(fields.filter((key) => value[key] !== undefined).map((key) => [key, sanitize(value[key], `${location}.${key}`)]));
  allowed(normalized, ['source', 'models', 'prompts', 'tools', 'references', 'skills', 'unknowns'], 'capture');
  const capture = {
    source: sanitize(normalized.source, 'source'),
    models: list('models', ['provider', 'model', 'agent', 'role'], (v, loc) => copy(v, ['provider', 'model', 'agent', 'role'], loc)),
    prompts: list('prompts', ['text'], (v, loc) => ({ text: sanitize(v.text, `${loc}.text`) })),
    tools: list('tools', ['name', 'purpose'], (v, loc) => copy(v, ['name', 'purpose'], loc)),
    references: list('references', ['kind', 'label', 'url', 'path', 'purpose'], (v, loc) => {
      for (const key of ['url', 'path']) if (v[key] !== undefined) { string(v[key]); add(key === 'url' ? 'url' : 'path', `${loc}.${key}`); }
      return copy(v, ['kind', 'label', 'purpose'], loc);
    }),
    skills: list('skills', ['repository', 'directory', 'lastReviewedCommit', 'expectedSha256', 'name'], (v, loc) => {
      for (const key of ['repository', 'directory']) if (v[key] !== undefined) { string(v[key]); add('repository', `${loc}.${key}`); }
      const skill = copy(v, ['name'], loc);
      for (const key of ['lastReviewedCommit', 'expectedSha256']) {
        if (v[key] !== undefined) skill[key] = sanitize(v[key], `${loc}.${key}`, { pin: true, contentHash: key === 'expectedSha256' });
      }
      return skill;
    }),
    unknowns: [],
  };
  if (normalized.unknowns !== undefined && (!Array.isArray(normalized.unknowns) || normalized.unknowns.length > MAX_ITEMS)) invalid();
  capture.unknowns = (normalized.unknowns ?? []).map((value, index) => sanitize(value, `unknowns[${index}]`));

  // Only credential matches spanning multiple prompt records can remove whole
  // contributing messages. Ordinary PII/URL/path matches keep surrounding prose.
  const rawPrompts = normalized.prompts ?? [];
  const joined = rawPrompts.map((value) => value.text).join('');
  const owners = [];
  rawPrompts.forEach((value, index) => { for (let i = 0; i < value.text.length; i++) owners.push(index); });
  const boundaries = [];
  let offset = 0;
  for (const { text } of rawPrompts) { boundaries.push(offset); offset += text.length; }
  for (const span of detectedSpans(joined, { credentialsOnly: true, boundaries }).spans) {
    const affected = new Set(owners.slice(span.start, span.end));
    // An independently complete credential followed by a new prose sentence is
    // not a split credential. Retain that following prompt.
    for (const index of [...affected].slice(1)) {
      if (!/^[A-Z]?[a-z]+(?:\s|[.!?])/.test(rawPrompts[index].text.trimStart())) continue;
      const prefix = rawPrompts.slice(0, index).map((value) => value.text).join('');
      if (detectedSpans(prefix, { credentialsOnly: true }).spans.some((prior) => prior.start === span.start)) {
        for (const later of affected) if (later >= index) affected.delete(later);
        break;
      }
    }
    if (affected.size < 2) continue;
    for (const index of affected) {
      capture.prompts[index].text = REDACTED;
      add('combined-content', `prompts[${index}].text`, 'Content removed after checking combined messages for split credentials.');
    }
  }
  add('creator-review', 'capture', 'Review the sanitized draft before publication. Automated filtering can miss personal, confidential or copyrighted information; removed references and skill sources require explicit review.');
  return { capture, findings, reviewRequired: true };
}

/** Inspect creator edits without rewriting them; callers own exact-content consent.
 * Accepts text, serialized JSON, or an ordered string array. Keep related prompt
 * fragments in the same call so boundary-spanning credentials can be checked.
 */
// Attached result files are whole generated artifacts, so the pasted-prose size
// rule does not apply to them; every other check still does.
export function inspectReviewText(input, { checkSize = true } = {}) {
  const invalidFinding = () => [{ category: 'invalid-content', location: 'draft', message: 'Draft content could not be safely inspected.', severity: 'block' }];
  const fields = [];
  const prompts = [];
  let serialized;
  let size = 0;
  const field = (value) => {
    if (typeof value !== 'string') throw new Error();
    size += value.length;
    if (size > MAX_TOTAL || fields.length >= 20_000) throw new Error();
    fields.push(value);
  };
  try {
    if (Array.isArray(input)) {
      if (input.length > MAX_ITEMS) return invalidFinding();
      for (const value of input) { field(value); prompts.push(value); }
    } else if (typeof input === 'string' && input.length <= MAX_TOTAL) {
      let parsed;
      let isJson = false;
      try { parsed = JSON.parse(input); isJson = true; } catch { /* Ordinary prose. */ }
      if (isJson && parsed !== null && typeof parsed === 'object') {
        serialized = input;
        const walk = (value, depth = 0) => {
          if (depth > 64) throw new Error();
          if (typeof value === 'string') { field(value); return; }
          if (Array.isArray(value)) { for (const item of value) walk(item, depth + 1); return; }
          if (value && typeof value === 'object') {
            for (const [key, item] of Object.entries(value)) {
              // Unknown JSON keys can themselves contain private material.
              field(key);
              if ((key === 'prompt' || key === 'text') && typeof item === 'string') prompts.push(item);
              walk(item, depth + 1);
            }
          }
        };
        walk(parsed);
      } else field(input);
    } else return invalidFinding();
  } catch { return invalidFinding(); }

  const findings = [];
  const add = (category, message, severity) => {
    if (!findings.some((finding) => finding.category === category)) findings.push({ category, location: 'draft', message, severity });
  };
  const scan = (raw, { checkSize = true, credentialsOnly = false, boundaries = [] } = {}) => {
    const decoded = decode(raw);
    // JSON syntax and repeated recipe sections do not count as a pasted block.
    // Apply this bound to each human string or ordinary prose paragraph instead.
    if (checkSize && (decoded.split(/\n\s*\n/).some((paragraph) => paragraph.length > MAX_TEXT) || /(?:```|~~~)[\s\S]{2000,}?(?:```|~~~|$)/.test(decoded))) {
      add('pasted-content', 'Large pasted content requires removal or a smaller reviewed excerpt.', 'block');
    }
    const detected = detectedSpans(raw, { credentialsOnly, boundaries });
    if (hasInvisibleText(raw) || detected.invisible.length) add('invisible-text', 'Invisible or control characters must be removed before approval.', 'block');
    for (const match of detected.spans) {
      // A root-relative URL or slash command can resemble a one-segment path.
      const ambiguousPath = match.category === 'path' && /^\/[^/\\]+$/.test(raw.slice(match.start, match.end));
      add(match.category, MESSAGES[match.category].replaceAll('removed', 'detected'), match.category === 'credential' || (match.category === 'path' && !ambiguousPath) ? 'block' : 'review');
    }
    if (credentialsOnly) return;
    // A reviewed URL is allowed, but embedded authentication is not.
    for (const match of decoded.matchAll(/\b[a-zA-Z][a-zA-Z0-9+.-]*:\/\/[^\s<>"'\])}]+/g)) {
      try {
        const url = new URL(match[0]);
        if (url.username || url.password) add('credential', 'URL authentication details must be removed.', 'block');
        if (url.search || url.hash) add('url-parameters', 'URL query parameters or fragments require careful creator review.', 'review');
      } catch { add('url', 'Malformed URL requires creator review.', 'review'); }
    }
  };
  for (const value of fields) scan(value, { checkSize });
  if (serialized !== undefined) scan(serialized, { checkSize: false });
  // Delimiters inserted by JSON must not break the check for a credential split
  // across consecutive prompt strings, including Unicode escape fragments.
  if (prompts.length) {
    const boundaries = [];
    let offset = 0;
    for (const text of prompts) { boundaries.push(offset); offset += text.length; }
    scan(prompts.join(''), { checkSize: false, credentialsOnly: true, boundaries });
  }
  return findings;
}
