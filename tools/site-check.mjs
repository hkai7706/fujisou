import fs from 'node:fs';
import path from 'node:path';

const root = process.argv[2]
  ? path.resolve(process.cwd(), process.argv[2])
  : path.resolve(import.meta.dirname, '..');
const ignoredDirectories = new Set(['.git', 'node_modules', 'docs', 'dist', 'backup', 'tmp', '.tmp', 'output', 'cms']);
const failures = [];
let checkedPages = 0;

function checkReference(file, reference) {
  if (/^(?:https?:|mailto:|tel:|data:|\/\/|#)/i.test(reference)) return;
  const clean = reference.split(/[?#]/)[0];
  if (!clean) return;
  const target = clean.startsWith('/') ? path.join(root, clean) : path.resolve(path.dirname(file), clean);
  if (!fs.existsSync(target)) failures.push(`${path.relative(root, file)}: broken local reference ${reference}`);
}

// Check responsive candidates and CSS assets as well as normal src/href links.
for (const file of walk(root).filter(item => /\.(?:html|shtml|css)$/i.test(item))) {
  const content = fs.readFileSync(file, 'utf8');
  for (const match of content.matchAll(/(?:src|href)=["']([^"']+)["']/gi)) checkReference(file, match[1]);
  for (const match of content.matchAll(/(?:srcset|imagesrcset)=["']([^"']+)["']/gi)) {
    for (const item of match[1].split(',')) checkReference(file, item.trim().split(/\s+/)[0]);
  }
  for (const match of content.matchAll(/url\(\s*["']?([^"')\s]+)["']?\s*\)/g)) checkReference(file, match[1]);
  for (const match of content.matchAll(/<!--#include virtual=["']([^"']*(?:header|footer)\.shtml)["']/g)) checkReference(file, match[1]);
}

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (ignoredDirectories.has(entry.name)) return [];
    const fullPath = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(fullPath) : [fullPath];
  });
}

for (const file of walk(root).filter((item) => /\.(?:html|shtml)$/i.test(item))) {
  if (['header.shtml', 'footer.shtml'].includes(path.basename(file))) continue;
  checkedPages += 1;
  const relativeFile = path.relative(root, file);
  const html = fs.readFileSync(file, 'utf8');

  if (!/<html\b[^>]*\blang=["']ja["']/i.test(html)) failures.push(`${relativeFile}: missing lang="ja"`);
  if (!/<meta\b[^>]*name=["']viewport["']/i.test(html)) failures.push(`${relativeFile}: missing viewport metadata`);
  if (!/<title>[^<]+<\/title>/i.test(html)) failures.push(`${relativeFile}: missing title`);
  if (path.basename(file) !== '404.html' && !/<meta\b[^>]*name=["']description["']/i.test(html)) failures.push(`${relativeFile}: missing meta description`);
  if (path.basename(file) !== '404.html' && !/<link\b[^>]*rel=["']canonical["']/i.test(html)) failures.push(`${relativeFile}: missing canonical URL`);

  for (const match of html.matchAll(/(?:src|href)=["']([^"'#?]+)["']/gi)) {
    const reference = match[1];
    if (/^(?:https?:|mailto:|tel:|data:|\/\/)/i.test(reference)) continue;
    const target = reference.startsWith('/') ? path.join(root, reference) : path.resolve(path.dirname(file), reference);
    if (!fs.existsSync(target)) failures.push(`${relativeFile}: broken local reference ${reference}`);
  }

  for (const match of html.matchAll(/<img\b[^>]*>/gi)) {
    if (!/\balt=["'][^"']*["']/i.test(match[0])) failures.push(`${relativeFile}: image missing alt text`);
    if (!/\bwidth=/i.test(match[0]) || !/\bheight=/i.test(match[0])) failures.push(`${relativeFile}: image missing intrinsic dimensions`);
  }
}

if (failures.length) {
  console.error(`Site check failed with ${failures.length} issue(s):\n${failures.map((item) => `- ${item}`).join('\n')}`);
  process.exit(1);
}

console.log(`Site check passed for ${checkedPages} pages.`);
