import fs from 'node:fs';
import path from 'node:path';

const project=path.resolve(import.meta.dirname,'..'),root=path.join(project,'dist');
const allowed=/\.(?:avif|webp|jpe?g|png|gif|svg|ico|woff2?|ttf|otf|pdf|css|m?js)$/i;
const files=[];
function walk(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
  if(entry.isSymbolicLink())continue;
  const file=path.join(dir,entry.name);
  if(entry.isDirectory())walk(file);else if(/\.(html|shtml|css)$/.test(file))files.push(file);
}}
walk(root);let copied=0;
function copy(file,reference){
  if(/^(?:data:|mailto:|tel:|#|\/\/)/.test(reference))return;
  if(reference.startsWith('https://www.fujisou-ainos.com/'))reference=new URL(reference).pathname;
  else if(/^https?:/.test(reference))return;
  let clean;
  try{clean=decodeURIComponent(reference.split(/[?#]/)[0]);}catch{return;}
  if(!allowed.test(clean))return;
  const destination=clean.startsWith('/')?path.resolve(root,'.'+clean):path.resolve(path.dirname(file),clean);
  if(!destination.startsWith(root+path.sep)||fs.existsSync(destination))return;
  const relative=path.relative(root,destination);
  if(relative.split(path.sep).some(part=>part.startsWith('.')||['mailformpro','mfp.statics','iplogs'].includes(part)))return;
  const source=path.join(project,relative);
  if(!fs.existsSync(source)||!fs.statSync(source).isFile())return;
  fs.mkdirSync(path.dirname(destination),{recursive:true});fs.copyFileSync(source,destination);copied++;
}
for(const file of files){const html=fs.readFileSync(file,'utf8');
  for(const match of html.matchAll(/(?:src|href|content)=["']([^"']+)["']/g))copy(file,match[1]);
  for(const match of html.matchAll(/(?:srcset|imagesrcset)=["']([^"']+)["']/g))for(const entry of match[1].split(','))copy(file,entry.trim().split(/\s+/)[0]);
  for(const match of html.matchAll(/url\(\s*["']?([^"')\s]+)["']?\s*\)/g))copy(file,match[1]);
}
console.log(`Copied ${copied} additional assets referenced by generated deployment files.`);
