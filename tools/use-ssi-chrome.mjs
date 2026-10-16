import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = path.resolve(import.meta.dirname, '..');
const excluded = new Set(['.git', 'node_modules', 'backup', 'tmp', '.tmp', 'output', 'dist', 'cms', 'tools', 'docs', 'include', 'mailformpro', 'mfp.statics']);
const headerPattern = /<header\b[^>]*\bdata-shared-header\b[^>]*>[\s\S]*?<\/header>/g;
const footerPattern = /<footer\b[^>]*class="shared-footer"[^>]*>[\s\S]*?<\/footer>/g;
const home = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const absolute = markup => markup.replace(/((?:href|src|srcset)=["'])(?:\.\.\/)+/g, '$1/').replace(/((?:href|src|srcset)=["'])(?![a-z]+:|\/|#)([^"']+)/gi, '$1/$2');
const version = file => crypto.createHash('sha256').update(fs.readFileSync(path.join(root, file))).digest('hex').slice(0, 10);
const header = home.match(headerPattern)?.[0];
const footer = home.match(footerPattern)?.[0];
if (header) fs.writeFileSync(path.join(root, 'include/header.shtml'), `<link rel="stylesheet" href="/stylesheet/shared-chrome.min.css?v=${version('stylesheet/shared-chrome.min.css')}">\n<script src="/script/shared-chrome.js?v=${version('script/shared-chrome.js')}" defer></script>\n${absolute(header)}\n`);
if (footer) fs.writeFileSync(path.join(root, 'include/footer.shtml'), `${absolute(footer)}\n`);
for (const name of ['header', 'footer']) if (!fs.existsSync(path.join(root, `include/${name}.shtml`))) throw new Error(`Missing SSI ${name}`);
let changed = 0;
function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (excluded.has(entry.name) || entry.isSymbolicLink()) continue;
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) { walk(file); continue; }
    if (!/\.(html|shtml)$/.test(file)) continue;
    const source = fs.readFileSync(file, 'utf8');
    if (!source.includes('data-shared-header') && !source.includes('include/header.shtml')) continue;
    const updated = source.replace(headerPattern, '<!--#include virtual="/include/header.shtml" -->')
      .replace(footerPattern, '<!--#include virtual="/include/footer.shtml" -->')
      .replace(/<link\b[^>]*href="[^"\n]*shared-chrome\.min\.css[^"\n]*"[^>]*>/g, '')
      .replace(/<script\b[^>]*src="[^"\n]*shared-chrome\.js[^"\n]*"[^>]*><\/script>/g, '')
      .replace(/<(style|script)>\s*([\s\S]*?)<\/\1>/g, (all, tag, body) => /shared-header|shared-footer/.test(body) ? '' : all);
    if (updated !== source) { fs.writeFileSync(file, updated); changed++; }
  }
}
walk(root);
console.log(`Replaced shared header/footer markup with SSI in ${changed} pages.`);
