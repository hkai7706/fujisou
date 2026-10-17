import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';

const root = path.resolve(import.meta.dirname, '..');
const port = Number(process.env.PORT || 5501);
const mime = { '.html': 'text/html; charset=utf-8', '.shtml': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.pdf': 'application/pdf' };
function resolve(url) {
  const file = path.resolve(root, '.' + url);
  if (file !== root && !file.startsWith(root + path.sep)) throw new Error('Invalid path');
  const relative = path.relative(root, file).split(path.sep);
  if (relative.some(part => part.startsWith('.') || ['tmp', 'backup', 'node_modules', 'mailformpro', 'iplogs', 'originals'].includes(part))) throw new Error('Private path');
  return file;
}
function render(file, depth = 0) {
  if (depth > 5) throw new Error('Nested SSI limit');
  return fs.readFileSync(file, 'utf8').replace(/<!--#include virtual="([^"]+)"\s*-->/g, (_, url) => render(resolve(url), depth + 1));
}
http.createServer((request, response) => {
  try {
    let file = resolve(decodeURIComponent(new URL(request.url, 'http://localhost').pathname));
    if (fs.statSync(file).isDirectory()) file = ['index.html', 'index.shtml'].map(name => path.join(file, name)).find(candidate => fs.existsSync(candidate));
    if (!file) throw new Error('Missing index');
    const extension = path.extname(file);
    if (['.cgi', '.pm'].includes(extension)) throw new Error('CGI requires Lolipop');
    response.setHeader('Content-Type', mime[extension] || 'application/octet-stream');
    response.end(/\.(html|shtml)$/.test(file) ? render(file) : fs.readFileSync(file));
  } catch { response.writeHead(404).end('Not found'); }
}).listen(port, '127.0.0.1', () => console.log(`SSI preview: http://127.0.0.1:${port}/ (mail sending requires Lolipop)`));
