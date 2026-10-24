import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {transform} from 'lightningcss';
await import('./embed-shared-chrome.mjs');

const pages=[];
const excluded=new Set(['analytics-portal','analytics-service','analytics-portal-dist','analytics-service-dist','backup','dist','tmp','.git','node_modules','tools','server','include', 'originals']);
function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){if(excluded.has(e.name))continue;const file=path.join(dir,e.name);if(e.isDirectory())walk(file);else if(/\.(html|shtml)$/.test(e.name))pages.push(file);}}
walk('.');
const normalize=body=>body.replace(/(?:\.\.\/)*img\//g,'../img/').replace(/\r\n/g,'\n').trim();
const styles=new Set(),scripts=new Set();
for(const file of pages){for(const m of fs.readFileSync(file,'utf8').matchAll(/<(style|script)>\s*([\s\S]*?)<\/\1>/g)){if(!/shared-header|shared-footer/.test(m[2]))continue;(m[1]==='style'?styles:scripts).add(normalize(m[2]));}}
if(styles.size){fs.writeFileSync('stylesheet/shared-chrome.min.css',transform({filename:'shared-chrome.css',code:Buffer.from([...styles].join('\n')),minify:true}).code);}
if(scripts.size)fs.writeFileSync('script/shared-chrome.js',[...scripts].join('\n')+'\n');
if(!fs.existsSync('stylesheet/shared-chrome.min.css'))throw Error('Missing shared component styles.');
const version=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex').slice(0,10);
let saved=0,count=0;
for(const file of pages){const original=fs.readFileSync(file,'utf8');if(!original.includes('data-shared-header'))continue;let html=original.replace(/<(style|script)>\s*([\s\S]*?)<\/\1>/g,(all,tag,body)=>/shared-header|shared-footer/.test(body)?'':all);
html=html.replace(/<link[^>]*href="[^\"]*shared-chrome\.min\.css[^\"]*"[^>]*>/g,'').replace(/<script[^>]*src="[^\"]*shared-chrome\.js[^\"]*"[^>]*><\/script>/g,'');
const root=path.relative(path.dirname(file),'.').replaceAll('\\','/');const prefix=root?root+'/':'';
const sharedAssets=`<link rel="stylesheet" href="${prefix}stylesheet/shared-chrome.min.css?v=${version('stylesheet/shared-chrome.min.css')}"><script src="${prefix}script/shared-chrome.js?v=${version('script/shared-chrome.js')}" defer></script>`;
const journey=/<link[^>]*href="[^\"]*inquiry-journey\.css[^\"]*"[^>]*>/;
html=journey.test(html)?html.replace(journey,match=>sharedAssets+match):html.replace('</head>',sharedAssets+'</head>');
if(html!==original){saved+=Buffer.byteLength(original)-Buffer.byteLength(html);fs.writeFileSync(file,html);count++;}}
console.log(`Shared chrome: ${count} pages, ${(saved/1024/1024).toFixed(2)} MiB removed from repeated HTML.`);
