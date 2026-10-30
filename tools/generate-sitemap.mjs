import fs from 'node:fs';
import path from 'node:path';

const project = path.resolve(import.meta.dirname, '..');
const root = process.argv[2] ? path.resolve(process.argv[2]) : project;
if(root!==project&&root!==path.join(project,'dist'))throw Error('Unsupported sitemap output');
const ignoredDirectories = new Set(['analytics-portal','analytics-service','analytics-portal-dist','analytics-service-dist','.git', 'node_modules', 'docs', 'dist', 'backup', 'tmp', '.tmp', 'output', 'cms', 'server', 'include', 'mailformpro', 'mfp.statics', 'iplogs', 'originals']);
const articles = new Set(JSON.parse(fs.readFileSync(path.join(project, 'docs/sitemap-articles.json'), 'utf8')));
const events = JSON.parse(fs.readFileSync(path.join(project, 'eventinfo/posts.json'), 'utf8'));
const today=new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Tokyo',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
const activeEventFiles = new Set(events.filter(post => (post.existing && (!post.endDate || today<=post.endDate) && (post.file!=='open-house/index.html'||today<='2026-10-18'))||post.legacyFile==='post-16.shtml').map(post => post.file.replaceAll('\\','/')));

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (ignoredDirectories.has(entry.name)) return [];
    const fullPath = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(fullPath) : [fullPath];
  });
}

const urls = new Set();
for (const file of walk(root).filter((item) => /\.(?:html|shtml)$/i.test(item))) {
  if (['404.html', 'header.shtml', 'footer.shtml'].includes(path.basename(file))) continue;
  const html = fs.readFileSync(file, 'utf8');
  const relative = path.relative(root,file).replaceAll('\\','/');
  if (html.includes('data-archive-robots') || html.includes('data-gallery-redirect') || html.includes('data-legacy-redirect') || relative.startsWith('design-sample/')) continue;
  if (relative.startsWith('staffblog/') && relative !== 'staffblog/index.html' && !articles.has(relative.slice('staffblog/'.length))) continue;
  if (relative.startsWith('eventinfo/') && relative !== 'eventinfo/index.html' && !activeEventFiles.has(relative.slice('eventinfo/'.length))) continue;
  const canonical = html.match(/<link\b[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)/i)?.[1]
    ?? html.match(/<link\b[^>]*href=["']([^"']+)["'][^>]*rel=["']canonical["']/i)?.[1];
  const expected = new URL(relative.replace(/index\.html$/, ''), 'https://www.fujisou-ainos.com/').href;
  if (canonical === expected) urls.add(canonical);
}

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[...urls].sort().map((url) => `  <url><loc>${url}</loc></url>`).join('\n')}\n</urlset>\n`;
fs.writeFileSync(path.join(root, 'sitemap.xml'), xml);
console.log(`Generated sitemap.xml with ${urls.size} URLs.`);
