import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = path.resolve(import.meta.dirname, '..');
process.chdir(root);
const apply = process.argv.includes('--apply');
const excluded = new Set(['.git','node_modules','backup','tmp','.tmp','output','dist','cms','tools','docs','originals','mailformpro','mfp.statics','iplogs']);
const walk = dir => fs.readdirSync(dir,{withFileTypes:true}).flatMap(e => excluded.has(e.name)||e.isSymbolicLink()?[]:e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);
const files = walk('.').filter(f => /\.(?:html|shtml|css|js|mjs|json)$/.test(f) && !/gallery[\\/](?:image-paths|project-folders)\.json$/.test(f));
const texts = new Map(files.map(f => [f,fs.readFileSync(f,'utf8')]));
const used = new Set([...texts].filter(([file])=>!file.endsWith('.json')).flatMap(([,text]) => [...text.matchAll(/img\/[^\s"'<>),?#\\]+/g)].map(m => m[0])));
const projects = JSON.parse(fs.readFileSync('gallery/projects.json','utf8'));
const enhanced = JSON.parse(fs.readFileSync('gallery/image-enhancements.json','utf8')).images;
const viewers = JSON.parse(fs.readFileSync('gallery/viewing-images.json','utf8')).images;
const owners = new Map();
const register = (image,id,label) => {
  const add = entry => { if(entry?.file && !owners.has(entry.file)) owners.set(entry.file,{id,label,width:entry.width}); };
  add(image); (image.variants||[]).forEach(add);
  const extra = enhanced[image.file];
  add(extra?.full); (extra?.variants||[]).forEach(add); add(viewers[image.file]);
};
const sourceRoot = 'img/gallery/originals';
const sourceFolders = fs.readdirSync(sourceRoot,{withFileTypes:true}).filter(e => e.isDirectory()).map(e => e.name);
const previousRegistry = fs.existsSync('gallery/project-folders.json')?JSON.parse(fs.readFileSync('gallery/project-folders.json','utf8')):null;
const registry = {version:1,projects:[],newProjects:previousRegistry?.newProjects||[1,2].map(n => ({id:`new-project-0${n}`,originals:`${sourceRoot}/NEW-0${n}_新規施工事例`}))};
for(const p of projects){
  const id = path.basename(p.file,'.shtml');
  const previous = previousRegistry?.projects.find(entry=>entry.id===id);
  const folder = sourceFolders.find(name => name.startsWith(id+'_'));
  const originals = previous?.originals || (folder && `${sourceRoot}/${folder}`);
  if(!originals||!fs.existsSync(originals)) throw Error(`Missing original-photo folder for ${id}`);
  registry.projects.push({id,file:p.file,title:p.title,area:p.area,originals,web:`img/gallery/houses/${id}`});
  register(p.thumbnail,id,'cover');
  p.photos.forEach((photo,i) => register(photo,id,`photo-${String(i+1).padStart(2,'0')}`));
}
const mappingFile = 'gallery/image-paths.json';
const mappings = fs.existsSync(mappingFile)?JSON.parse(fs.readFileSync(mappingFile,'utf8')).paths:{};
const copies = [];
for(const [source,owner] of owners){
  if(!used.has(source)||source.startsWith('img/gallery/houses/')) continue;
  if(!fs.existsSync(source)) throw Error(`Missing image: ${source}`);
  const bytes = fs.readFileSync(source),hash = crypto.createHash('sha256').update(bytes).digest('hex').slice(0,10);
  const destination = `img/gallery/houses/${owner.id}/${owner.label}${owner.width?'-'+owner.width:''}-${hash}${path.extname(source).toLowerCase()}`;
  if(!path.resolve(destination).startsWith(path.join(root,'img','gallery','houses')+path.sep)) throw Error('Unsafe destination');
  copies.push({source,destination,bytes}); mappings[source] = destination;
}
console.log(`${apply?'Organizing':'Preview'}: ${copies.length} referenced images; ${registry.projects.length} project folders.`);
if(!apply){console.log('Run with --apply to copy images and update public references. No files changed.');process.exit(0);}
for(const {source,destination,bytes} of copies){
  fs.mkdirSync(path.dirname(destination),{recursive:true});
  if(fs.existsSync(destination)){if(!fs.readFileSync(destination).equals(bytes))throw Error('Destination mismatch: '+destination);}
  else fs.copyFileSync(source,destination);
  if(!fs.readFileSync(destination).equals(bytes)) throw Error('Image copy verification failed');
  if(fs.existsSync('dist')){const packaged=path.join('dist',destination);fs.mkdirSync(path.dirname(packaged),{recursive:true});fs.copyFileSync(destination,packaged);}
}
const replacements = Object.entries(mappings).sort((a,b)=>b[0].length-a[0].length);
const replace = text => {for(const [from,to] of replacements)text=text.split(from).join(to);return text;};
let changed=0;
for(const [file,text] of texts){const next=replace(text);if(next!==text){fs.writeFileSync(file,next);changed++;}}
if(fs.existsSync('dist')){
  const visit=dir=>{for(const e of fs.readdirSync(dir,{withFileTypes:true})){if(e.isSymbolicLink()||['mailformpro','mfp.statics','originals'].includes(e.name))continue;const f=path.join(dir,e.name);if(e.isDirectory())visit(f);else if(/\.(html|shtml|css|js|mjs|json)$/.test(f)){const text=fs.readFileSync(f,'utf8'),next=replace(text);if(text!==next)fs.writeFileSync(f,next);}}};
  visit('dist');
}
fs.writeFileSync(mappingFile,JSON.stringify({version:1,paths:mappings},null,2)+'\n');
fs.writeFileSync('gallery/project-folders.json',JSON.stringify(registry,null,2)+'\n');
console.log(`Updated ${changed} source files. Image bytes are unchanged; legacy assets are retained for compatibility.`);
