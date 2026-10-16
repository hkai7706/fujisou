import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import sharp from 'sharp';

const root = path.resolve(import.meta.dirname, '..');
process.chdir(root);
const skip = new Set(['.git', 'node_modules', 'backup', 'tmp', '.tmp', 'output', 'dist', 'cms', 'mailformpro', 'mfp.statics', 'iplogs']);
const files = [];
function walk(directory) {
  for (const item of fs.readdirSync(directory, { withFileTypes: true })) {
    if (skip.has(item.name) || item.isSymbolicLink()) continue;
    const file = path.join(directory, item.name).replaceAll('\\', '/');
    if (item.isDirectory()) walk(file); else files.push(file);
  }
}
walk('.');
const texts = files.filter(file => /\.(html|shtml|css|js|mjs|cjs|json|md|ps1|xml|txt)$/.test(file))
  .map(file => ({ file, original: fs.readFileSync(file, 'utf8'), content: fs.readFileSync(file, 'utf8') }));
const groups = new Map();
for (const file of files.filter(file => file.startsWith('img/'))) {
  const bytes = fs.readFileSync(file);
  const hash = crypto.createHash('sha256').update(bytes).digest('hex');
  const group = groups.get(hash) || [];
  group.push({ file, bytes: bytes.length }); groups.set(hash, group);
}
const replacements = [];
for (const group of groups.values()) {
  group.sort((a, b) => a.file.length - b.file.length || a.file.localeCompare(b.file));
  for (const duplicate of group.slice(1)) replacements.push({ from: duplicate.file, to: group[0].file, bytes: duplicate.bytes, method: 'identical bytes' });
}
let pngs = 0;
for (const file of files.filter(file => file.startsWith('img/') && file.endsWith('.png') && !replacements.some(item => item.from === file))) {
  // Original enhancement inputs keep their source hashes and rebuild behavior.
  if (file.startsWith('img/gallery/projects/')) continue;
  const metadata = await sharp(file).metadata();
  if (metadata.icc || metadata.orientation || metadata.pages > 1) continue;
  const buffer = await sharp(file).webp({ lossless: true, effort: 6 }).toBuffer();
  const size = fs.statSync(file).size;
  if (buffer.length >= size) continue;
  const before = await sharp(file).ensureAlpha().raw().toBuffer();
  const after = await sharp(buffer).ensureAlpha().raw().toBuffer();
  if (!before.equals(after)) continue;
  const destination = file.replace(/\.png$/, '.lossless.webp');
  if (fs.existsSync(destination)) continue;
  fs.writeFileSync(destination, buffer);
  replacements.push({ from: file, to: destination, bytes: size, outputBytes: buffer.length, method: 'pixel-identical lossless WebP' });
  pngs++;
}
// Retarget pages, styles, scripts, generators and JSON manifests together.
for (const item of texts) {
  for (const replacement of replacements) {
    const relative = file => path.relative(path.dirname(item.file), file).replaceAll('\\', '/');
    item.content = item.content.replaceAll(relative(replacement.from), relative(replacement.to));
    item.content = item.content.replaceAll('/' + replacement.from, '/' + replacement.to);
    item.content = item.content.replaceAll(replacement.from, replacement.to);
  }
  if (item.content !== item.original) fs.writeFileSync(item.file, item.content);
}
let removed = 0, saved = 0;
const retained = [];
for (const replacement of replacements) {
  // A basename-only mention may be a dynamically assembled path: retain it.
  if (texts.some(item => item.content.includes(path.basename(replacement.from)))) { retained.push(replacement.from); continue; }
  const absolute = fs.realpathSync(replacement.from);
  if (!absolute.startsWith(path.join(root, 'img') + path.sep)) throw new Error('Unsafe image deletion target');
  fs.unlinkSync(absolute);
  removed++; saved += replacement.bytes - (replacement.outputBytes || 0);
}
const report = { removed, savedBytes: saved, losslessPngConversions: pngs, changedTextFiles: texts.filter(item => item.content !== item.original).length, retainedDynamicSources: retained, replacements };
fs.mkdirSync('output', { recursive: true });
fs.writeFileSync('output/lossless-cleanup-report.json', JSON.stringify(report, null, 2));
console.log(JSON.stringify({ removed, savedBytes: saved, losslessPngConversions: pngs, changedTextFiles: report.changedTextFiles, retainedDynamicSources: retained.length }));
