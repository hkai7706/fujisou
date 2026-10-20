import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const groups=new Map();
function images(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,e.name).replaceAll('\\','/');if(e.isDirectory())images(file);else{const data=fs.readFileSync(file);const hash=crypto.createHash('sha256').update(data).digest('hex');const group=groups.get(hash)||{bytes:data.length,files:[]};group.files.push(file);groups.set(hash,group);}}}
images('img');
const replacements=[];
for(const group of groups.values()){if(group.files.length<2)continue;group.files.sort((a,b)=>a.length-b.length||a.localeCompare(b));const canonical=group.files[0];for(const duplicate of group.files.slice(1))replacements.push([duplicate,canonical]);}
const excluded=new Set(['backup','dist','tmp','.git','node_modules','tools','server','include', 'originals']);
let changed=0;
function pages(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){if(excluded.has(e.name))continue;const file=path.join(dir,e.name);if(e.isDirectory())pages(file);else if(/\.(html|shtml|css)$/.test(e.name)){const original=fs.readFileSync(file,'utf8');let content=original;for(const [oldFile,newFile] of replacements){const oldRelative=path.relative(path.dirname(file),oldFile).replaceAll('\\','/');const newRelative=path.relative(path.dirname(file),newFile).replaceAll('\\','/');if(content.includes(oldRelative))content=content.replaceAll(oldRelative,newRelative);if(content.includes('/'+oldFile))content=content.replaceAll('/'+oldFile,'/'+newFile);}if(content!==original){fs.writeFileSync(file,content);changed++;}}}}
pages('.');
console.log(`Exact-image deduplication: ${changed} text files updated. Original image bytes and source assets preserved.`);
