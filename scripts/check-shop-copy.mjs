import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

async function walk(path) {
  const files = [];
  for (const entry of await readdir(path, { withFileTypes: true })) {
    const name = join(path, entry.name);
    if (entry.isDirectory()) files.push(...await walk(name));
    else if (entry.name.endsWith('.html')) files.push(name);
  }
  return files;
}
const root = 'apps/web/out';
const paths = [join(root, 'index.html'), ...await walk(join(root, 'skills')), ...await walk(join(root, 'results')), ...await walk(join(root, 'docs')), ...await walk(join(root, 'saved'))];
let failed = false;
for (const path of paths) {
  const html = await readFile(path, 'utf8');
  const metadata = [...html.matchAll(/<meta\b[^>]*(?:name|property)=["'](?:description|keywords|og:[^"']+)["'][^>]*>/gi)]
    .map(([tag]) => tag.match(/content=["']([^"']*)["']/i)?.[1] ?? '').filter(value => !/^https?:\/\//i.test(value)).join(' ');
  const visible = metadata + ' ' + html.replace(/<code\b[^>]*>[\s\S]*?<\/code>/gi, ' ').replace(/<pre\b[^>]*>[\s\S]*?<\/pre>/gi, ' ').replace(/<p data-copy-check-ignore="true">[\s\S]*?<\/p>/gi, ' ').replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ');
  const words = visible.match(/\bhire\b|\bagent prompt\b|\bprompt only\b|\brecipe\b|\bOutcome\b|\bturnless\b|\bToolSearch\b|remote\.run|\bcleanroom\b|\bBoat\b|Fray Agent/gi);
  if (words) { console.error(`${path}: forbidden terms ${[...new Set(words)].join(', ')}`); failed = true; }
}
if (failed) process.exitCode = 1;
else console.log('Shop HTML copy check passed');
