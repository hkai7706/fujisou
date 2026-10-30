import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const ignored=new Set(['.git','node_modules','backup','tmp','.tmp','output','dist','cms','tools', 'originals']);
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>ignored.has(e.name)?[]:e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);}
let filesChanged=0,linksChanged=0;
for(const file of walk(root).filter(f=>/\.(?:html|shtml)$/i.test(f))){
 const original=fs.readFileSync(file,'utf8');
 const html=original.replace(/\bhref=(['"])([^'"]+)\1/gi,(tag,quote,href)=>{
  if(!/(?:^|\/)index\.(?:html|shtml)(?:[?#]|$)/i.test(href))return tag;
  let local;
  if(/^https?:\/\//i.test(href)){
   const u=new URL(href);if(!['www.fujisou-ainos.com','hkai7706.github.io'].includes(u.hostname))return tag;
   let pathname=decodeURIComponent(u.pathname);if(u.hostname==='hkai7706.github.io')pathname=pathname.replace(/^\/fujisou\//,'/');
   local=path.join(root,pathname);
  }else{
   const pathname=decodeURIComponent(href.split(/[?#]/)[0]);local=href.startsWith('/')?path.join(root,pathname):path.resolve(path.dirname(file),pathname);
  }
  if(!local.startsWith(root+path.sep)||!fs.existsSync(local))return tag;
  const next=href.replace(/index\.(?:html|shtml)(?=[?#]|$)/i,'');
  linksChanged++;return `href=${quote}${next===''?'./':/^[?#]/.test(next)?'./'+next:next}${quote}`;
 });
 if(html!==original){fs.writeFileSync(file,html);filesChanged++;}
}
console.log(`Normalized ${linksChanged} index links to folder URLs across ${filesChanged} pages.`);
