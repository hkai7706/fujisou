import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { origin } from './seo-helpers.mjs';

const root = process.argv[2] ? path.resolve(process.argv[2]) : path.resolve(import.meta.dirname, '..');
const skip = new Set(['.git','node_modules','docs','tools','include','server','dist','tmp','backup','.tmp','output','cms','originals','mailformpro','mfp.statics','iplogs']);
function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    if (skip.has(entry.name) || entry.isSymbolicLink()) return [];
    const file = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(file) : /\.(html|shtml)$/.test(entry.name) ? [file] : [];
  });
}
const canonicalPages = new Map();
let pages = 0, schemas = 0;
for (const file of walk(root)) {
  const html = fs.readFileSync(file, 'utf8');
  if (!html.includes('</head>') || html.includes('data-gallery-redirect')) continue;
  const relative = path.relative(root, file).replaceAll('\\', '/');
  const expected = new URL(relative.replace(/index\.html$/, ''), origin).href;
  const canonicals = [...html.matchAll(/<link\b[^>]*rel="canonical"[^>]*href="([^"]+)"/g)];
  assert.equal(canonicals.length, 1, `${relative}: canonical count`);
  assert.equal(canonicals[0][1], expected, `${relative}: canonical URL`);
  canonicalPages.set(expected, html);
  assert.equal([...html.matchAll(/<meta\b[^>]*name="description"/g)].length, 1, `${relative}: description count`);
  const images = [...html.matchAll(/<meta\b[^>]*(?:property="og:image"|name="twitter:image")[^>]*content="([^"]+)"/g)];
  assert.equal(images.length, 2, `${relative}: sharing images`);
  for (const [, image] of images) {
    const url = new URL(image);
    if (url.origin === new URL(origin).origin) assert.ok(fs.statSync(path.join(root, decodeURIComponent(url.pathname))).isFile(), `${relative}: missing share image`);
  }
  for (const match of html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) {
    const schema = JSON.parse(match[1]);
    assert.equal(schema['@context'], 'https://schema.org', `${relative}: schema context`);
    schemas++;
  }
  if (/<(?:nav|div)\b[^>]*class="site-breadcrumbs"/.test(html) && !html.includes('data-archive-robots')) assert.match(html, /"@type":"BreadcrumbList"/, `${relative}: breadcrumb schema`);
  pages++;
}
const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
assert.equal(new Set(urls).size, urls.length, 'Duplicate sitemap URLs');
for (const url of urls) {
  assert.ok(canonicalPages.has(url), `Sitemap URL has no canonical page: ${url}`);
  assert.doesNotMatch(canonicalPages.get(url), /data-archive-robots|data-gallery-redirect/, `Excluded page in sitemap: ${url}`);
}
console.log(`SEO check passed: ${pages} pages, ${schemas} JSON-LD blocks, ${urls.length} sitemap URLs.`);
