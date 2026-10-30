import fs from 'node:fs';
import path from 'node:path';

// Deployment-only conversion. Never turn the GitHub/source pages into SSI.
const project=path.resolve(import.meta.dirname,'..'),root=path.join(project,'dist');
if(process.argv[2]&&!process.argv[2].startsWith('--')&&path.resolve(process.argv[2])!==root)throw Error('SSI conversion is restricted to dist');
const base=process.argv.find(a=>a.startsWith('--base='))?.slice(7)||'/';
if(!/^\/(?:[A-Za-z0-9_-]+\/)*$/.test(base))throw Error('Use a root/subfolder path ending in /');
const headerPattern=/<header\b[^>]*data-shared-header[^>]*>[\s\S]*?<\/header>/g;
const footerPattern=/<footer\b[^>]*class="shared-footer"[^>]*>[\s\S]*?<\/footer>/g;
const prefix=html=>html.replace(/\b(href|src)="\/(?!\/)([^"]*)"/g,(_,attr,url)=>`${attr}="${base}${url}"`)
 .replace(/srcset="([^"]*)"/g,(_,value)=>`srcset="${value.replace(/(^|,\s*)\/(?!\/)/g,'$1'+base)}"`);
fs.mkdirSync(path.join(root,'include'),{recursive:true});
for(const [name,pattern] of [['header',headerPattern],['footer',footerPattern]]){
 const source=fs.readFileSync(path.join(project,'include',name+'.shtml'),'utf8');
 const markup=source.match(pattern)?.[0];if(!markup)throw Error('Missing shared '+name);
 // Page heads retain their CSS/scripts; fragments contain shared markup only.
 fs.writeFileSync(path.join(root,'include',name+'.shtml'),prefix(markup)+'\n');
 fs.writeFileSync(path.join(root,name+'.shtml'),`<!--#include virtual="${base}include/${name}.shtml" -->\n`);
}
let count=0;
const skip=new Set(['include','mailformpro','mfp.statics','iplogs','originals']);
function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){
 if(skip.has(e.name)||e.isSymbolicLink())continue;
 const file=path.join(dir,e.name);if(e.isDirectory()){walk(file);continue;}
 if(!/\.(?:html|shtml)$/.test(e.name)||['header.shtml','footer.shtml'].includes(e.name))continue;
 const original=fs.readFileSync(file,'utf8');
 const html=original.replace(headerPattern,`<!--#include virtual="${base}include/header.shtml" -->`)
  .replace(footerPattern,`<!--#include virtual="${base}include/footer.shtml" -->`)
  .replace(/<!--#include virtual="[^"\n]*include\/(header|footer)\.shtml"\s*-->/g,(_,name)=>`<!--#include virtual="${base}include/${name}.shtml" -->`);
 if(html!==original){fs.writeFileSync(file,html);count++;}
}}
walk(root);
console.log(`Deployment SSI: ${count} pages share include/header.shtml and include/footer.shtml; source pages untouched.`);
