import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve(import.meta.dirname, '..');
const skip = new Set(['.git', 'node_modules', 'backup', 'tmp', '.tmp', 'output', 'dist', 'cms', 'tools', 'docs', 'include', 'mailformpro', 'mfp.statics']);
let count = 0;
function walk(directory) {
  for (const item of fs.readdirSync(directory, { withFileTypes: true })) {
    if (skip.has(item.name) || item.isSymbolicLink()) continue;
    const file = path.join(directory, item.name);
    if (item.isDirectory()) { walk(file); continue; }
    if (!/\.(html|shtml)$/.test(file)) continue;
    const source = fs.readFileSync(file, 'utf8');
    if (!source.includes('</head>')) continue;
    const prefix = path.relative(path.dirname(file), root).replaceAll('\\', '/');
    const base = prefix ? prefix + '/' : '';
    const updated = source.replace(/<link\b[^>]*rel=["'](?:icon|shortcut icon|apple-touch-icon)["'][^>]*>/gi, '')
      .replace('</head>', `<link rel="icon" href="${base}favicon.ico" sizes="any"><link rel="icon" href="${base}favicon.png" type="image/png" sizes="32x32"><link rel="apple-touch-icon" href="${base}apple-touch-icon.png"></head>`);
    if (updated !== source) { fs.writeFileSync(file, updated); count++; }
  }
}
walk(root);
console.log(`Favicon links updated in ${count} pages.`);
