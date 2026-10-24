import fs from 'node:fs';
import path from 'node:path';

const root=path.resolve(import.meta.dirname,'..');
const service=path.join(root,'analytics-service-dist'),portal=path.join(root,'analytics-portal-dist');
const excluded=new Set(['.git','node_modules','docs','tools','source','dist','backup','tmp','output','originals','mailformpro','mfp.statics','iplogs','analytics-service','analytics-portal','analytics-service-dist','analytics-portal-dist']);
const catalogue={};
function walk(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
  if(entry.isSymbolicLink()||excluded.has(entry.name)||entry.name.startsWith('.'))continue;
  const file=path.join(dir,entry.name);
  if(entry.isDirectory()){walk(file);continue;}
  if(!/\.(html|shtml)$/.test(file)||['header.shtml','footer.shtml','404.html'].includes(entry.name))continue;
  const html=fs.readFileSync(file,'utf8');if(html.includes('data-gallery-redirect'))continue;
  const relative=path.relative(root,file).replaceAll('\\','/').replace(/index\.html$/,'');
  const title=(html.match(/<title>([\s\S]*?)<\/title>/)?.[1]||relative).replaceAll('&amp;','&').replaceAll('&quot;','"');
  catalogue['/'+relative]={title};
}}
walk(root);
// Update code/assets only. Do not delete or overwrite private config or data in
// an existing package. No administrator credentials or visitor database is copied.
function copyTree(source,target){fs.mkdirSync(target,{recursive:true});for(const entry of fs.readdirSync(source,{withFileTypes:true})){
  if(entry.isSymbolicLink()||['config.php','data','pages.json'].includes(entry.name))continue;
  const from=path.join(source,entry.name),to=path.join(target,entry.name);
  if(entry.isDirectory())copyTree(from,to);else fs.copyFileSync(from,to);
}}
copyTree(path.join(root,'analytics-service'),service);copyTree(path.join(root,'analytics-portal'),portal);
for(const name of ['index.html','portal.css','portal.js','config.js'])fs.copyFileSync(path.join(portal,name),path.join(service,name));
fs.mkdirSync(path.join(service,'private'),{recursive:true});fs.writeFileSync(path.join(service,'private/pages.json'),JSON.stringify(catalogue,null,2)+'\n');
console.log(`Separate analytics packages built; ${Object.keys(catalogue).length} permitted public page paths. Private configuration/data preserved.`);
