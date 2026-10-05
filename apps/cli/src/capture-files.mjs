import { constants } from 'node:fs';
import { lstat, realpath, readdir, open } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { createHash } from 'node:crypto';

export const CAPTURE_FILE_LIMITS = { fileBytes: 16 * 1024 * 1024, totalBytes: 64 * 1024 * 1024, files: 256, entries: 512, depth: 16 };
const unsafe = () => new Error('Capture media/artifacts must be regular files inside the draft folder; symlinks, special files and unsafe paths are refused.');
const oversized = () => new Error('Capture media/artifacts exceed limits: 16 MiB per file, 64 MiB total, 256 files, 512 entries or 16 directory levels.');

// Read a bounded snapshot, with no symlink following and no blocking on FIFOs.
// Export writes these exact bytes, rather than reopening paths after approval.
export async function readCaptureFiles(folder) {
  const root = resolve(folder);
  if (!(await lstat(root)).isDirectory() || (await lstat(root)).isSymbolicLink()) throw unsafe();
  const actualRoot = await realpath(root);
  const files = [];
  let total = 0;
  let entries = 0;
  async function walk(path, depth) {
    if (++entries > CAPTURE_FILE_LIMITS.entries || depth > CAPTURE_FILE_LIMITS.depth) throw oversized();
    const location = join(root, path);
    const stat = await lstat(location);
    if (stat.isSymbolicLink() || !['media', 'artifacts'].some(prefix => path.startsWith(prefix + '/') || path === prefix)) throw unsafe();
    if (await realpath(location) !== join(actualRoot, path)) throw unsafe();
    if (stat.isDirectory()) {
      for (const name of (await readdir(location)).sort()) {
        if (name.includes('\\') || name === '.' || name === '..') throw unsafe();
        await walk(`${path}/${name}`, depth + 1);
      }
      return;
    }
    if (!stat.isFile() || !path.includes('/')) throw unsafe();
    if (files.length >= CAPTURE_FILE_LIMITS.files || stat.size > CAPTURE_FILE_LIMITS.fileBytes || total + stat.size > CAPTURE_FILE_LIMITS.totalBytes) throw oversized();
    const handle = await open(location, constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK);
    let bytes;
    try {
      const before = await handle.stat();
      if (!before.isFile() || before.dev !== stat.dev || before.ino !== stat.ino) throw unsafe();
      if (before.size !== stat.size) throw new Error('Capture files changed while reading. Check or review again.');
      const buffer = Buffer.alloc(stat.size + 1);
      let count = 0;
      while (count < buffer.length) {
        const read = await handle.read(buffer, count, buffer.length - count, count);
        if (!read.bytesRead) break;
        count += read.bytesRead;
      }
      const after = await handle.stat();
      if (count !== stat.size || after.size !== stat.size || after.mtimeMs !== before.mtimeMs || after.ctimeMs !== before.ctimeMs || await realpath(location) !== join(actualRoot, path)) throw new Error('Capture files changed while reading. Check or review again.');
      bytes = buffer.subarray(0, count);
    } finally { await handle.close(); }
    total += bytes.length;
    files.push({ path, size: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex'), bytes });
  }
  for (const path of ['artifacts', 'media']) {
    try { await lstat(join(root, path)); }
    catch (error) { if (error.code === 'ENOENT') continue; throw error; }
    await walk(path, 0);
  }
  return files;
}

export const fileInventory = files => files.map(({ path, size, sha256 }) => ({ path, size, sha256 }));

export function validateCaptureFileInventory(files) {
  if (!Array.isArray(files) || !files.length || files.length > CAPTURE_FILE_LIMITS.files) throw unsafe();
  const seen = new Set();
  let total = 0;
  for (const file of files) {
    if (!file || Object.keys(file).some(key => !['path', 'size', 'sha256'].includes(key)) || typeof file.path !== 'string' || !/^(?:media|artifacts)\//.test(file.path) || file.path.includes('\\') || file.path.split('/').some(part => !part || part === '.' || part === '..') || file.path.split('/').length > CAPTURE_FILE_LIMITS.depth + 1 || seen.has(file.path) || !Number.isSafeInteger(file.size) || file.size < 0 || file.size > CAPTURE_FILE_LIMITS.fileBytes || typeof file.sha256 !== 'string' || !/^[a-f0-9]{64}$/.test(file.sha256)) throw unsafe();
    seen.add(file.path);
    total += file.size;
  }
  if (total > CAPTURE_FILE_LIMITS.totalBytes) throw oversized();
}
