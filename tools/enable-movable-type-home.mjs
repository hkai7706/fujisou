import fs from 'node:fs';
import path from 'node:path';
// Optional host activation AFTER normal packaging. GitHub Pages stays static.
const root=path.resolve(process.argv[2]||'dist');
const base=process.argv.find(a=>a.startsWith('--base='))?.slice(7)||'/';
if(!/^\/(?:[A-Za-z0-9_-]+\/)*$/.test(base))throw Error('Use a root or subfolder path ending with /');
const file=path.join(root,'index.html');let html=fs.readFileSync(file,'utf8');
for(const [kind,folder] of [['blog','staffblog'],['event','eventinfo']]){
 if(!fs.existsSync(path.join(root,folder,'latest-cards.inc')))throw Error('Seed fragment missing: '+folder);
 let count=0;
 const include=`<!--#include virtual="${base}${folder}/latest-cards.inc" -->`;
 const expression=new RegExp('<a\\b[^>]*data-news-category="'+kind+'"[^>]*>[\\s\\S]*?<\\/a>','g');
 html=html.replace(expression,()=>++count===1?include:'');
 if(!count&&!html.includes(include))throw Error('Homepage card slot missing: '+kind);
}
fs.writeFileSync(file,html);
console.log('Homepage uses published Movable Type fragments through Apache SSI. Verify SSI on the actual host.');
