import fs from 'node:fs';
import path from 'node:path';
const project=path.resolve(import.meta.dirname,'..');
const root=process.argv[2]?path.resolve(process.argv[2]):project;
if(root!==project&&root!==path.join(project,'dist'))throw Error('Unsupported hero output');
const skip=new Set(['.git','node_modules','tools','docs','source','dist','tmp','backup','output','originals','analytics-portal','analytics-service','analytics-portal-dist','analytics-service-dist']);
const heroes=new Set(['event-index-hero','concept-hero','staff-hero','policy-hero','gallery-hero','land-hero','shikkui-hero','planning-hero','custom-hero','cute-hero','custom-product__hero','video-intro','archive-heading']);
let changed=0;
function walk(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
  if(entry.isSymbolicLink()||skip.has(entry.name))continue;
  const file=path.join(dir,entry.name);if(entry.isDirectory()){walk(file);continue;}
  if(!/\.(?:html|shtml)$/.test(file))continue;
  const before=fs.readFileSync(file,'utf8');if(!before.includes('data-site-design="interior"'))continue;
  const after=before.replace(/<(?:section|header)\b[^>]*class="([^"]+)"[^>]*>/g,(tag,classes)=>{
    const list=classes.split(/\s+/);return list.some(name=>heroes.has(name))&&!list.includes('page-hero')?tag.replace(`class="${classes}"`,`class="${classes} page-hero"`):tag;
  });
  if(after!==before){fs.writeFileSync(file,after);changed++;}
}}
walk(root);console.log(`Shared event-style hero applied in ${changed} pages; page copy and images preserved.`);
