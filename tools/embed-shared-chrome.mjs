import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const project = path.resolve(import.meta.dirname, '..');
const root = process.argv[2] ? path.resolve(process.argv[2]) : project;
if (root !== project && root !== path.join(project, 'dist')) throw new Error('Unsupported output folder');
const skip = new Set(['analytics-portal','analytics-service','analytics-portal-dist','analytics-service-dist','.git', 'node_modules', 'backup', 'tmp', '.tmp', 'output', 'dist', 'cms', 'tools', 'docs', 'include', 'mailformpro', 'mfp.statics', 'iplogs', 'originals']);
const header = fs.readFileSync(path.join(project, 'include/header.shtml'), 'utf8').match(/<header\b[\s\S]*?<\/header>/)?.[0];
const footer = fs.readFileSync(path.join(project, 'include/footer.shtml'), 'utf8').match(/<footer\b[\s\S]*?<\/footer>/)?.[0];
if (!header || !footer) throw new Error('Missing shared component markup');
const hash = file => crypto.createHash('sha256').update(fs.readFileSync(path.join(project, file))).digest('hex').slice(0, 10);
let count = 0;
function walk(directory) {
  for (const item of fs.readdirSync(directory, { withFileTypes: true })) {
    if (skip.has(item.name) || item.isSymbolicLink()) continue;
    const file = path.join(directory, item.name);
    if (item.isDirectory()) { walk(file); continue; }
    if (!/\.(html|shtml)$/.test(file)) continue;
    const original = fs.readFileSync(file, 'utf8');
    if (!original.includes('include/header.shtml') && !original.includes('include/footer.shtml') && !original.includes('data-shared-header')) continue;
    const rel = path.relative(path.dirname(file), root).replaceAll('\\', '/');
    const prefix = rel ? rel + '/' : './';
    const relative = markup => markup.replace(/((?:src|href)=["'])\/(?!\/)/g, '$1' + prefix)
      .replace(/srcset="([^"]+)"/g, (_, value) => `srcset="${value.replace(/(^|,\s*)\/(?!\/)/g, '$1' + prefix)}"`);
    let html = original.replace(/<!--#set var="site_root" value="[^"]*" -->\s*/g, '')
      .replace(/<!--#include virtual="[^"\n]*include\/header\.shtml"\s*-->/g, relative(header))
      .replace(/<!--#include virtual="[^"\n]*include\/footer\.shtml"\s*-->/g, relative(footer));
    // Refresh embedded copies from the shared source on every build.
    html = html.replace(/<header\b[^>]*data-shared-header[^>]*>[\s\S]*?<\/header>/g, relative(header))
      .replace(/<footer\b[^>]*class="shared-footer"[^>]*>[\s\S]*?<\/footer>/g, relative(footer));
    html = html.replace(/<link\b[^>]*href="[^"\n]*shared-chrome\.min\.css[^"\n]*"[^>]*>/g, '')
      .replace(/<link\b[^>]*href="[^"\n]*inquiry-journey\.css[^"\n]*"[^>]*>/g, '')
      .replace(/<script\b[^>]*src="[^"\n]*inquiry-tracking\.js[^"\n]*"[^>]*><\/script>/g, '')
      .replace(/<script\b[^>]*src="[^"\n]*shared-chrome\.js[^"\n]*"[^>]*><\/script>/g, '');
    const assets = `<link rel="stylesheet" href="${prefix}stylesheet/shared-chrome.min.css?v=${hash('stylesheet/shared-chrome.min.css')}"><link rel="stylesheet" href="${prefix}stylesheet/inquiry-journey.css?v=${hash('stylesheet/inquiry-journey.css')}"><script src="${prefix}script/shared-chrome.js?v=${hash('script/shared-chrome.js')}" defer></script><script src="${prefix}script/inquiry-tracking.js?v=${hash('script/inquiry-tracking.js')}" defer></script>`;
    html = html.replace(/<link\b[^>]*href="[^"\n]*site-design\.css[^"\n]*"[^>]*>/g, '');
    // Apply the homepage's design language to every interior template, including
    // regenerated articles. The homepage itself remains the reference design.
    const interior = path.resolve(file) !== path.join(root, 'index.html');
    html = html.replace(/<body\b([^>]*)>/i, (_, attrs) => `<body${attrs.replace(/\sdata-site-design="[^"]*"/g, '')}${interior ? ' data-site-design="interior"' : ''}>`);
    const design = interior ? `<link rel="stylesheet" href="${prefix}stylesheet/site-design.css?v=${hash('stylesheet/site-design.css')}">` : '';
    html = html.includes('</head>') ? html.replace('</head>', assets + design + '</head>') : assets + design + html;
    html = html.replace(/^[\t ]+(?=\r?$)/gm, '');
    if (html !== original) { fs.writeFileSync(file, html); count++; }
  }
}
walk(root);
if (root !== project) {
  for (const name of ['header', 'footer']) {
    const source = fs.readFileSync(path.join(project, `include/${name}.shtml`), 'utf8');
    fs.writeFileSync(path.join(root, `include/${name}.shtml`), source.replace(/((?:src|href)=["'])\/(?!\/)/g, '$1../'));
  }
}
console.log(`Embedded shared header/footer in ${count} files (${path.basename(root)}).`);
