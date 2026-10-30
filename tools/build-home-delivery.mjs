import fs from 'node:fs';
import crypto from 'node:crypto';
import { transform } from 'lightningcss';
import { PurgeCSS } from 'purgecss';
import postcss from 'postcss';
import cssnano from 'cssnano';

// Preserve the original cascade in one cacheable request. Full CSS inlining made
// the initial layout a long post-paint task in Chrome; keep styles render-ready
// before painting rather than trading input responsiveness for a faster paint.
const sources = ['fujisou-ainos.home.min.css', 'page-start.css', 'home-updates.css', 'house-guide.css', 'section-inquiries.css', 'home-videos.css', 'shared-chrome.min.css', 'inquiry-journey.css'];
let html = fs.readFileSync('index.html', 'utf8').replace(/<style\b[^>]*data-home-styles[^>]*>[\s\S]*?<\/style>/g, '');
const linked = [...html.matchAll(/<link\b[^>]*rel="stylesheet"[^>]*href="(?:\.\/)?stylesheet\/([^"?]+)(?:\?[^"]*)?"[^>]*>/g)];
for (const match of linked) {
  if (!sources.includes(match[1]) && match[1] !== 'homepage.min.css') throw new Error(`Review new homepage stylesheet before bundling: ${match[1]}`);
  html = html.replace(match[0], '');
}
const css = sources.map(file => fs.readFileSync('stylesheet/' + file, 'utf8')).join('\n');
const [{ css: used }] = await new PurgeCSS().purge({
  content: [{raw: html, extension:'html'}, 'script/fujisou-ainos.js', 'script/shared-chrome.js', 'script/event-status.js'],
  css: [{raw:css,extension:'css'}],
  safelist: {standard:[/^is-/,/^has-/,/^js$/, /^no-scroll$/, /^shared-/]},
  keyframes: true, fontFace: false
});
const compact = await postcss([cssnano({preset:['default', {
  // Runtime states and named animations remain available after compaction.
  discardUnused:false, reduceIdents:false, normalizeUrl:false
}]})]).process(used,{from:undefined,map:false});
const result = transform({filename:'homepage.css',code:Buffer.from(compact.css),minify:true}).code.toString();
fs.writeFileSync('stylesheet/homepage.min.css', result);
const version = crypto.createHash('sha256').update(result).digest('hex').slice(0,10);
html = html.replace('</head>', `<link rel="stylesheet" href="stylesheet/homepage.min.css?v=${version}"></head>`);
fs.writeFileSync('index.html', html);
console.log(`Homepage CSS bundled: ${Buffer.byteLength(result)} bytes; ${linked.length} stylesheet links replaced with one cacheable request.`);
