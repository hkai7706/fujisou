import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve('.'),destination=path.join(root,'dist');
const projects=JSON.parse(fs.readFileSync('gallery/projects.json','utf8'));
const pages=['gallery/index.html','gallery/page-2.html','gallery/page-3.html',...projects.map(p=>'gallery/'+p.file)];
const files=new Set([...pages,'sitemap.xml']);
function reference(file,value){if(/^(?:https?:|mailto:|tel:|data:|#|\/\/)/i.test(value))return;value=value.split(/[?#]/)[0];if(!value)return;const target=path.resolve(value.startsWith('/')?root:path.dirname(path.resolve(file)),value.replace(/^\//,''));if(!target.startsWith(root+path.sep)||!fs.existsSync(target)||!fs.statSync(target).isFile())return;files.add(path.relative(root,target));}
for(const file of pages){const html=fs.readFileSync(file,'utf8');for(const m of html.matchAll(/(?:src|href)="([^"]+)"/g))reference(file,m[1]);for(const m of html.matchAll(/srcset="([^"]+)"/g))for(const entry of m[1].split(','))reference(file,entry.trim().split(/\s+/)[0]);}
for(const file of [...files].filter(f=>f.endsWith('.css'))){const css=fs.readFileSync(file,'utf8');for(const m of css.matchAll(/url\(["']?([^"')]+)["']?\)/g))reference(file,m[1]);}
for(const file of files){const target=path.join(destination,file);fs.mkdirSync(path.dirname(target),{recursive:true});if(file.replaceAll('\\','/').startsWith('img/gallery/projects/')&&fs.existsSync(target)&&fs.statSync(target).size===fs.statSync(file).size)continue;fs.copyFileSync(file,target);}
console.log(`Synced ${pages.length} gallery pages and their referenced assets (${files.size} files) into dist.`);
