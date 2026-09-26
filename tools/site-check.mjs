import fs from 'node:fs';
import path from 'node:path';

const root = process.argv[2]
  ? path.resolve(process.cwd(), process.argv[2])
  : path.resolve(import.meta.dirname, '..');
const ignoredDirectories = new Set(['.git', 'node_modules', 'docs', 'dist']);
const failures = [];
let checkedPages = 0;

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
