import fs from 'node:fs';
import path from 'node:path';
const project=path.resolve(import.meta.dirname,'..');
const root=process.argv[2]?path.resolve(process.argv[2]):project;
if(root!==project&&root!==path.join(project,'dist'))throw Error('Unsupported hero output');
const skip=new Set(['.git','node_modules','tools','docs','source','dist','tmp','backup','output','originals']);
const heroes=new Set(['event-index-hero','archive-heading','policy-hero','staff-hero','concept-hero']);
let changed=0;
function walk(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
  if(entry.isSymbolicLink()||skip.has(entry.name))continue;
  const file=path.join(dir,entry.name);if(entry.isDirectory()){walk(file);continue;}
  if(!/\.(?:html|shtml)$/.test(file))continue;
  const before=fs.readFileSync(file,'utf8');if(!before.includes('data-site-design="interior"'))continue;
  const after=before.replace(/<(?:section|header)\b[^>]*class="([^"]+)"[^>]*>/g,(tag,classes)=>{
    const list=classes.split(/\s+/).filter(name=>name!=='page-hero');
    const section=path.relative(root,file).split(path.sep)[0];
    if(['eventinfo','staffblog','policy','staff','concept'].includes(section)&&list.some(name=>heroes.has(name)))list.push('page-hero');
    return tag.replace(`class="${classes}"`,`class="${list.join(' ')}"`);
  });
  if(after!==before){fs.writeFileSync(file,after);changed++;}
}}
walk(root);console.log(`Shared event-style hero applied in ${changed} pages; page copy and images preserved.`);
