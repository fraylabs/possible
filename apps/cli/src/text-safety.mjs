// Shared by capture, validation and public rendering. Legitimate emoji and
// script joiners are preserved; arbitrary invisible payloads are not.
const invisible = /[\p{Default_Ignorable_Code_Point}\p{Cf}\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f-\u009f]/gu;
const segmenter = new Intl.Segmenter('und', { granularity: 'grapheme' });
const emoji = new RegExp('^\\p{RGI_Emoji}$', 'v');
const scriptNames = ['Arabic', 'Devanagari', 'Bengali', 'Gurmukhi', 'Gujarati', 'Oriya', 'Tamil', 'Telugu', 'Kannada', 'Malayalam', 'Sinhala', 'Tibetan', 'Myanmar', 'Khmer'];
const scripts = scriptNames.map(name => new RegExp(`^\\p{Script_Extensions=${name}}$`, 'u'));
function scriptJoiner(text, index) {
  const left = text.slice(0, index).match(/(\p{Letter})\p{Mark}*$/u)?.[1];
  const right = text.slice(index + 1).match(/^\p{Mark}*(\p{Letter})/u)?.[1];
  return Boolean(left && right && scripts.some(script => script.test(left) && script.test(right)));
}
export function invisibleTextSpans(value) {
  const text = String(value);
  const allowed = new Set();
  for (const { segment, index } of segmenter.segment(text)) {
    // RGI includes the finite standardized subdivision flags, never arbitrary
    // tag strings attached to an emoji. VS15 is text presentation of an emoji.
    if (emoji.test(segment) || /^\p{Emoji}\ufe0e$/u.test(segment)) {
      for (let offset = 0; offset < segment.length; offset++) allowed.add(index + offset);
    }
  }
  const spans = [];
  for (const match of text.matchAll(invisible)) {
    if (allowed.has(match.index)) continue;
    if (/^[\u200c\u200d]$/u.test(match[0]) && scriptJoiner(text, match.index)) continue;
    spans.push({ start: match.index, end: match.index + match[0].length });
  }
  return spans;
}
export const hasInvisibleText = text => invisibleTextSpans(text).length > 0;
function replaceInvisible(text, replacement) {
  text = String(text);
  for (const { start, end } of invisibleTextSpans(text).reverse()) text = text.slice(0, start) + replacement(text.slice(start, end)) + text.slice(end);
  return text;
}
export const stripInvisibleText = text => replaceInvisible(text, () => '');
export const visibleText = text => replaceInvisible(text, character => `\\u{${character.codePointAt(0).toString(16)}}`);
export function assertVisibleText(value) {
  if (typeof value === 'string' && hasInvisibleText(value)) throw new Error('Outcome contains unsupported invisible or control characters. Remove them before validation or publication.');
  if (Array.isArray(value)) value.forEach(assertVisibleText);
  else if (value && typeof value === 'object') for (const [key, item] of Object.entries(value)) { assertVisibleText(key); assertVisibleText(item); }
}
export function visibleValue(value) {
  if (typeof value === 'string') return visibleText(value);
  if (Array.isArray(value)) return value.map(visibleValue);
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, item]) => [visibleText(key), visibleValue(item)]));
  return value;
}
