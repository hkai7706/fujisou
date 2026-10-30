import fs from 'node:fs';
import crypto from 'node:crypto';
import { transform } from 'lightningcss';
import { PurgeCSS } from 'purgecss';
import postcss from 'postcss';
import cssnano from 'cssnano';
import {buildHomeFonts} from './build-home-fonts.mjs';
import sharp from 'sharp';

// Preserve the original cascade in one cacheable request. Full CSS inlining made
// the initial layout a long post-paint task in Chrome; keep styles render-ready
// before painting rather than trading input responsiveness for a faster paint.
const sources = ['fujisou-ainos.home.min.css', 'page-start.css', 'home-updates.css', 'house-guide.css', 'home-videos.css', 'shared-chrome.min.css', 'inquiry-journey.css'];
let html = fs.readFileSync('index.html', 'utf8').replace(/<style\b[^>]*data-home-styles[^>]*>[\s\S]*?<\/style>/g, '');
html=html.replace(/(<img\b[^>]*fetchpriority="high"[^>]*\bdecoding=")async("[^>]*>)/, '$1sync$2');
html=html.replace(/<noscript data-home-font-fallback>[\s\S]*?<\/noscript>/g,'');
// Keep deployment photographs in WebP, with the original responsive dimensions.
for(const width of [768,1152,1920,2560]){
 const stem=`img/home/hero-material-hq-${width}`;
 const display=`img/home/hero-material-display-${width}.webp`;
 if(!fs.existsSync(display))await sharp(stem+'.webp').webp({quality:78,effort:4}).toFile(display);
 html=html.replaceAll(stem+'.webp',display).replaceAll(stem+'.avif',display);
}
html=html.replace(/(<link\b[^>]*as="image"[^>]*hero-material[^>]*type=")image\/avif/, '$1image/webp');
const linked = [...html.matchAll(/<link\b[^>]*rel="stylesheet"[^>]*href="(?:\.\/)?stylesheet\/([^"?]+)(?:\?[^"]*)?"[^>]*>/g)];
for (const match of linked) {
  if (!sources.includes(match[1]) && match[1] !== 'homepage.min.css') throw new Error(`Review new homepage stylesheet before bundling: ${match[1]}`);
  html = html.replace(match[0], '');
}
const homeFonts=await buildHomeFonts(html);
// Inactive slides are overlaid within the viewport, so native lazy loading still
// fetched them at startup. The carousel requests each photo before it is shown.
html=html.replace(/(<div class="hybrid-hero__scene [^"]*"[^>]*>\s*<article[^>]*>)(<img\b[^>]*>)/g,(match,opening,image)=>{
 if(opening.includes('is-active')||image.includes('data-hero-src'))return match;
 return opening+image.replace(/\bsrcset=/,'data-hero-srcset=').replace(/\bsrc=/,'data-hero-src=').replace('<img ','<img src="data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'3\' height=\'2\'/%3E" ');
});
// Discover the two visible Japanese fonts with the document instead of waiting
// for the stylesheet download and CSS parsing to reveal them.
html=html.replace(/<link\b[^>]*data-home-font-preload[^>]*>/g,'');
const fontPreloads=[homeFonts.hannari,homeFonts.noto].map(file=>`<link rel="preload" as="font" type="font/woff2" href="${file}" crossorigin data-home-font-preload>`).join('');
html=html.replace(/(<meta\b[^>]*charset[^>]*>)/i,`$1${fontPreloads}`);
const parsed=postcss.parse(sources.map(file => fs.readFileSync('stylesheet/' + file, 'utf8')).join('\n'));
parsed.walkAtRules('font-face',rule=>{if(/(?:Hannari Mincho|Noto Serif JP)/.test(rule.toString()))rule.remove();});
parsed.walkDecls(declaration=>{if(declaration.prop==='font-family'||declaration.prop==='--serif')declaration.value=declaration.value.replace(/(["'])Noto Serif JP\1/g,'"Noto Serif JP","Noto Serif JP Fallback"');});
const css=homeFonts.css+'\n'+parsed.toString();
const [{ css: used }] = await new PurgeCSS().purge({
  content: [{raw: html, extension:'html'}, 'script/fujisou-ainos.js', 'script/shared-chrome.js', 'script/event-status.js', 'staffblog/latest-cards.inc', 'eventinfo/latest-cards.inc'],
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
html=html.replace(/<meta name="home-font-characters"[^>]*>/g,'');
const characters=homeFonts.characters.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
html = html.replace('</head>', `<meta name="home-font-characters" content="${characters}"><link rel="stylesheet" href="stylesheet/homepage.min.css?v=${version}"><noscript data-home-font-fallback><link rel="stylesheet" href="stylesheet/post-font-fallback.css" data-post-font-fallback></noscript></head>`);
fs.writeFileSync('index.html', html);
console.log(`Homepage CSS bundled: ${Buffer.byteLength(result)} bytes; ${linked.length} stylesheet links replaced with one cacheable request.`);
