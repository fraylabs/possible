import { parse } from 'acorn';

// Static inspection only. Never evaluate session code or resolve imports/files.
const MAX_CODE = 256 * 1024;
const shellNames = new Set(['exec_command', 'shell', 'shell_command', 'run_command', 'bash', 'Bash']);
const harnessNames = new Set(['exec', 'wait', 'spawn_agent', 'send_message', 'list_agents', 'wait_agent', 'followup_task', 'interrupt_agent', 'yield_control', 'write_stdin', 'update_plan', 'apply_patch']);
export const shortToolName = name => name.split('.').filter(Boolean).at(-1);
export const isHarnessTool = name => harnessNames.has(shortToolName(name));
// Only programs that say something about how a result was made. Generic
// runtimes, package managers and text utilities are plumbing, not ingredients.
const programNames = new Set('ffmpeg ffprobe convert magick blender openscad cadquery kicad-cli freecadcmd pytest vite vitest playwright docker remotion manim yt-dlp sox imagemagick inkscape gltf-transform xcodebuild'.split(' '));
// Standard-library modules are never recipe ingredients.
const standardModules = new Set(('abc argparse array ast asyncio base64 bisect builtins collections concurrent contextlib copy csv dataclasses datetime decimal difflib enum fnmatch fractions functools gc getpass glob gzip hashlib heapq hmac html http importlib inspect io ipaddress itertools json logging math mimetypes multiprocessing operator os pathlib pickle platform pprint queue random re secrets select shlex shutil signal socket sqlite3 statistics string struct subprocess sys tarfile tempfile textwrap threading time timeit traceback types typing unicodedata unittest urllib uuid warnings weakref xml zipfile zlib __future__ '
  + 'assert buffer child_process crypto events fs module net os path process readline stream timers tty url util vm worker_threads zlib').split(' '));
const notStandard = name => !name.startsWith('node:') && !standardModules.has(name.split(/[./]/)[0]);
const nameOnly = value => typeof value === 'string' && /^[a-zA-Z][a-zA-Z0-9_.-]{0,79}$/.test(value);
const packageOnly = value => typeof value === 'string' && /^(?:@[a-z0-9_.-]+\/)?[a-z][a-z0-9_.-]{0,79}$/i.test(value);

function literal(node, bindings, depth = 0) {
  if (!node || depth > 12) return undefined;
  if (node.type === 'Literal') return node.value;
  if (node.type === 'Identifier') return bindings.get(node.name);
  if (node.type === 'TemplateLiteral' && !node.expressions.length) return node.quasis[0].value.cooked;
  if (node.type === 'ArrayExpression') return node.elements.map(n => literal(n, bindings, depth + 1));
  if (node.type === 'ObjectExpression') {
    const value = Object.create(null);
    for (const property of node.properties) {
      if (property.type !== 'Property' || property.computed || property.kind !== 'init') continue;
      const key = property.key.name ?? property.key.value;
      if (typeof key === 'string') value[key] = literal(property.value, bindings, depth + 1);
    }
    return value;
  }
}
function member(node) {
  if (node?.type === 'Identifier') return node.name;
  if (node?.type === 'MemberExpression' && !node.computed) {
    const parent = member(node.object);
    if (parent) return `${parent}.${node.property.name}`;
  }
}
function walk(node, visit) {
  if (!node || typeof node !== 'object') return;
  if (typeof node.type === 'string') visit(node);
  for (const value of Object.values(node)) {
    if (Array.isArray(value)) for (const child of value) walk(child, visit);
    else if (value && typeof value === 'object') walk(value, visit);
  }
}
export function nestedExecCalls(code) {
  if (typeof code !== 'string' || code.length > MAX_CODE) return [];
  let ast;
  try { ast = parse(code, { ecmaVersion: 'latest', sourceType: 'module', allowAwaitOutsideFunction: true }); }
  catch { return []; }
  const bindings = new Map();
  const calls = [];
  walk(ast, node => {
    if (node.type === 'VariableDeclarator' && node.id.type === 'Identifier') bindings.set(node.id.name, literal(node.init, bindings));
    if (node.type !== 'CallExpression') return;
    const path = member(node.callee);
    if (!path || !/^(?:tools|functions)\.[a-zA-Z0-9_.]+$/.test(path)) return;
    calls.push({ name: path.replace(/^(?:tools|functions)\./, ''), input: literal(node.arguments[0], bindings) });
  });
  return calls;
}
// Keep quoted tokens together. Substitutions are opaque; no expansion occurs.
function tokens(command) {
  return [...command.matchAll(/"(?:\\.|[^"\\])*"|'[^']*'|`[^`]*`|\$\([^)]*\)|&&|\|\||[;|\n]|[^\s;|]+/g)].map(m => {
    const token = m[0];
    return /^(?:".*"|'.*')$/s.test(token) ? token.slice(1, -1) : token;
  });
}
function imports(code, language, ingredient) {
  const names = [];
  if (language === 'python') {
    // Mask strings/comments before matching import statements. In particular,
    // printed source text and documentation are not evidence of a library load.
    const masked = code.replace(/(?:"""[\s\S]*?"""|'''[\s\S]*?'''|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|#[^\n]*)/g, ' ');
    for (const match of masked.matchAll(/(?:^|[;\n])\s*(?:from\s+([a-zA-Z]\w*(?:\.\w+)*)\s+import\b|import\s+([^\n;#]+))/g)) {
      names.push(...(match[1] ? [match[1]] : match[2].split(',').map(v => v.trim().split(/\s/)[0])).map(v => v.split('.')[0]));
    }
  } else {
    let ast;
    try { ast = parse(code, { ecmaVersion: 'latest', sourceType: 'module', allowAwaitOutsideFunction: true }); }
    catch { return; }
    walk(ast, node => {
      if (['ImportDeclaration', 'ExportNamedDeclaration', 'ExportAllDeclaration', 'ImportExpression'].includes(node.type)) names.push(literal(node.source, new Map()));
      if (node.type === 'CallExpression' && node.callee.type === 'Identifier' && node.callee.name === 'require') names.push(literal(node.arguments[0], new Map()));
    });
  }
  for (const name of names) if (packageOnly(name) && notStandard(name)) ingredient(name, 'Library imported by an executed script; creator must confirm its purpose.');
}
function packageArguments(words, runner = false) {
  const values = [];
  const flags = new Set(['-y', '--yes', '-D', '-S', '-g', '--global', '--save', '--save-dev', '--no-save', '--no-audit', '--no-fund', '--ignore-scripts', '--upgrade', '-U', '--user', '--quiet', '-q', '--dry-run']);
  for (let i = 0; i < words.length; i++) {
    if (words[i].startsWith('-')) {
      // Unknown option values are arguments, never package ingredients.
      if (!flags.has(words[i]) && !words[i].includes('=')) i++;
      continue;
    }
    values.push(words[i]);
    if (runner) break;
  }
  return values;
}
// Line-based so cost stays linear in command length (a single regex over the
// whole command was quadratic on long one-line commands). Unterminated
// heredocs are left in place, as before.
function stripHeredocs(command, onBody) {
  if (!command.includes('<<')) return command;
  const lines = command.split('\n');
  const positions = new Map();
  lines.forEach((line, index) => {
    if (!positions.has(line)) positions.set(line, []);
    positions.get(line).push(index);
  });
  const out = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const match = line.includes('<<') ? line.match(/<<-?[ \t]*(['"]?)([a-zA-Z_]\w*)\1/) : null;
    const end = match && (positions.get(match[2]) ?? []).find(index => index > i);
    if (!match || end === undefined) { out.push(line); continue; }
    const head = line.slice(0, match.index);
    onBody(head, lines.slice(i + 1, end).join('\n'));
    out.push(head);
    i = end;
  }
  return out.join('\n');
}

export function inspectShell(name, input, { ingredient, skill }) {
  if (!shellNames.has(shortToolName(name))) return;
  const command = typeof input === 'string' ? input : input?.cmd ?? input?.command;
  if (typeof command !== 'string' || command.length > MAX_CODE) return;
  // Executed heredocs are inspected for imports, but their body is never copied
  // or scanned as shell commands. File-writing heredocs remain opaque.
  const shell = stripHeredocs(command, (head, body) => {
    if (/\bpython(?:3)?\b/.test(head)) imports(body, 'python', ingredient);
    if (/\bnode\b/.test(head)) imports(body, 'javascript', ingredient);
  });
  const segments = [];
  let segment = [];
  for (const token of tokens(shell)) {
    if (/^(?:&&|\|\||[;|\n])$/.test(token)) { segments.push(segment); segment = []; }
    else segment.push(token);
  }
  segments.push(segment);
  for (let words of segments) {
    while (words.length && /^(?:[a-zA-Z_]\w*=|sudo$|env$)/.test(words[0])) words = words.slice(1);
    // uv run options may name packages and wrap another executable.
    if (words[0] === 'uv' && words[1] === 'run') {
      let i = 2;
      const valueOptions = new Set(['--python', '--project', '--directory', '--with-editable', '--env-file']);
      while (i < words.length && words[i].startsWith('-')) {
        const option = words[i++];
        if (option === '--with' && words[i]) {
          const pkg = words[i++].replace(/[<>=!~].*$/, '');
          if (packageOnly(pkg)) ingredient(pkg, 'Package named by the script runner; creator must confirm its purpose.');
        } else if (valueOptions.has(option)) i++;
        else if (option.startsWith('--with=')) {
          const pkg = option.slice(7).replace(/[<>=!~].*$/, '');
          if (packageOnly(pkg)) ingredient(pkg, 'Package named by the script runner; creator must confirm its purpose.');
        } else if (!['--quiet', '-q', '--no-sync', '--frozen', '--locked', '--offline'].includes(option) && !option.includes('=')) i++;
      }
      words = words.slice(i);
    }
    const program = words[0];
    if (!program) continue;
    if (programNames.has(program)) ingredient(program, 'Program invoked in a shell command; creator must confirm its purpose.');
    if (program === 'curl' || program === 'wget') {
      for (const word of words.slice(1)) {
        const match = word.match(/^https:\/\/raw\.githubusercontent\.com\/([a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+)\/([^/]+)\/(.+)\/SKILL\.md$/i);
        if (match) skill(`${match[3]}/SKILL.md`, { repository: match[1], ...(/^[a-f0-9]{40}(?:[a-f0-9]{24})?$/i.test(match[2]) ? { lastReviewedCommit: match[2] } : {}) });
      }
    }
    if (program === 'npx' && words.some(word => /^skills(?:@[^/]+)?$/.test(word))) {
      const index = words.findIndex(word => /^skills(?:@[^/]+)?$/.test(word));
      if (words[index + 1] === 'add') {
        const source = words[index + 2]?.match(/^([a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+)(?:@([^/]+))?$/);
        if (source) for (let i = index + 3; i < words.length - 1; i++) if (words[i] === '--skill' && nameOnly(words[i + 1])) {
          skill(undefined, { name: words[++i], repository: source[1], ...(/^[a-f0-9]{40}(?:[a-f0-9]{24})?$/i.test(source[2] ?? '') ? { lastReviewedCommit: source[2] } : {}) });
        }
      }
    }
    if (['cat', 'head', 'tail', 'sed', 'Read', 'read_file'].includes(program)) {
      for (const word of words.slice(1)) if (/(?:^|[/\\])SKILL\.md$/i.test(word)) skill(word);
    }
    if (['python', 'python3', 'node'].includes(program)) {
      const index = words.indexOf(program === 'node' ? '-e' : '-c');
      if (index >= 0 && words[index + 1]) imports(words[index + 1], program === 'node' ? 'javascript' : 'python', ingredient);
      // python -m names an imported module, not a script path.
      if (program !== 'node' && words[1] === '-m' && nameOnly(words[2]) && words[2] !== 'pip' && notStandard(words[2])) ingredient(words[2].split('.')[0], 'Python module invoked by the interpreter; creator must confirm its purpose.');
    }
    let packages = [];
    if (['pip', 'pip3', 'npm', 'pnpm', 'yarn', 'bun'].includes(program) || (['python', 'python3'].includes(program) && words[1] === '-m' && words[2] === 'pip') || (program === 'uv' && words[1] === 'pip')) {
      const start = words.findIndex(word => ['install', 'add'].includes(word));
      if (start >= 0) packages = packageArguments(words.slice(start + 1));
    }
    if (program === 'npx' || (program === 'pnpm' && words[1] === 'dlx') || (program === 'uv' && words[1] === 'tool' && words[2] === 'run')) packages = packageArguments(words.slice(program === 'npx' ? 1 : program === 'pnpm' ? 2 : 3), true);
    for (let pkg of packages) {
      pkg = pkg.replace(/(?<!^)@[^/]*$|[<>=!~].*$/, '');
      // The skills installer is recorded through the skills it adds, not as a tool.
      if (packageOnly(pkg) && pkg !== 'skills') ingredient(pkg, 'Package named in an install or runner command; creator must confirm its purpose.');
    }
  }
}
