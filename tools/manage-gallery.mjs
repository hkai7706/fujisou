import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import sharp from 'sharp';

const root=path.resolve(import.meta.dirname,'..');process.chdir(root);
const args=new Map(process.argv.slice(2).map(s=>{const i=s.indexOf('=');return i<0?[s,true]:[s.slice(0,i),s.slice(i+1)];}));
const value=name=>args.get('--'+name);
if(!value('project')||value('help')){
  console.log('Replace: npm run gallery:update -- --project=wakon-yosai-residence --photo=1 --file="filename.jpg" --caption="説明"\nCover: use --photo=cover\nAdd a photo: use --add instead of --photo\nNew post: --new --project=my-new-house --folder="NEW-01_新規施工事例" --title="施工事例名" --area="高岡市"\nAppend --dry-run to validate without changing files.');process.exit(0);
}
const allowed=new Set(['--project','--photo','--file','--caption','--add','--new','--folder','--title','--area','--dry-run','--make-cover','--help']);
for(const arg of args.keys())if(!allowed.has(arg))throw Error('Unknown option: '+arg);
for(const key of ['photo','file','caption','folder','title','area'])if(value(key)!==undefined&&typeof value(key)!=='string')throw Error(`--${key} requires a value`);
const id=value('project');if(typeof id!=='string'||!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id))throw Error('Use a lowercase project ID, such as wood-stove-house');
const projectsFile='gallery/projects.json',registryFile='gallery/project-folders.json';
const projects=JSON.parse(fs.readFileSync(projectsFile,'utf8')),registry=JSON.parse(fs.readFileSync(registryFile,'utf8'));
const isNew=!!value('new'),dryRun=!!value('dry-run');
let entry=registry.projects.find(p=>p.id===id),project=projects.find(p=>p.file===entry?.file);
const originalsRoot=path.resolve('img/gallery/originals');
const safeFolder=folder=>{const resolved=path.resolve(folder);if(!resolved.startsWith(originalsRoot+path.sep)||!fs.statSync(resolved).isDirectory())throw Error('Use a folder inside img/gallery/originals');return resolved;};
if(isNew){
  if(entry||projects.some(p=>p.file===id+'.shtml')||fs.existsSync('gallery/'+id+'.shtml'))throw Error('Project ID is already used or reserved by an old URL');
  if(!value('title')||!value('area')||!value('folder'))throw Error('A new post requires --title, --area and --folder');
  if(value('photo')||value('add')||value('file'))throw Error('New-post mode imports the folder. Do not combine it with photo-edit options.');
  const folder=safeFolder(path.join(originalsRoot,value('folder')));
  if(registry.projects.some(p=>path.resolve(p.originals)===folder))throw Error('That originals folder already belongs to another project');
  entry={id,file:id+'.shtml',title:value('title'),area:value('area'),originals:path.relative(root,folder).replaceAll('\\','/'),web:`img/gallery/houses/${id}`};
  project={source:`https://www.fujisou-ainos.com/gallery/${id}.shtml`,title:value('title'),area:value('area'),file:id+'.shtml',description:'',photos:[]};
}else{
  if(!entry||!project)throw Error('Unknown project. See gallery/project-folders.json');
  if(value('title')||value('area')||value('folder'))throw Error('Title, area and folder options belong to --new mode');
  if(!value('file')||(!value('add')&&!value('photo')))throw Error('Choose --photo=1, --photo=cover, or --add, and supply --file');
  if(value('add')&&value('photo'))throw Error('Choose either --add or --photo');
  if(value('make-cover')&&!value('add'))throw Error('--make-cover is supported with --add');
}
const folder=safeFolder(entry.originals);
if(entry.web!==`img/gallery/houses/${id}`)throw Error('Unexpected website image folder in project registry');
const resolvePhoto=name=>{const f=path.resolve(folder,name);if(!f.startsWith(folder+path.sep)||!fs.statSync(f).isFile()||!/\.(?:jpe?g|png|webp|tiff?)$/i.test(f))throw Error('Photo must be a JPG, PNG, WebP or TIFF inside this project folder');return f;};
let sources;
if(isNew){sources=fs.readdirSync(folder).filter(name=>/\.(?:jpe?g|png|webp|tiff?)$/i.test(name)&&!name.startsWith('表紙プレビュー')).sort((a,b)=>a.localeCompare(b,'ja',{numeric:true})).map(resolvePhoto);if(!sources.length)throw Error('The new project folder has no photos');}
else sources=[resolvePhoto(value('file'))];
const index=value('photo')==='cover'?-1:Number(value('photo'))-1;
if(!isNew&&!value('add')&&value('photo')!=='cover'&&(!Number.isInteger(index)||index<0||index>=project.photos.length))throw Error('Photo number is outside this post (first photo is 1)');
// Validate every input before writing any output or changing project records.
for(const f of sources){const metadata=await sharp(f,{failOn:'error',limitInputPixels:100000000}).metadata();if(!metadata.width||!metadata.height||metadata.pages>1)throw Error('Use a valid single-frame photograph: '+f);}
if(dryRun){console.log(JSON.stringify({dryRun:true,project:id,newPost:isNew,photos:sources.map(f=>path.basename(f)),output:entry.web},null,2));process.exit(0);}
const stamp=new Date().toISOString().replace(/[:.]/g,'-'),backup=`tmp/gallery-updates/${stamp}`;
fs.mkdirSync(backup,{recursive:true});for(const f of [projectsFile,registryFile])fs.copyFileSync(f,path.join(backup,path.basename(f)));
const prepare=async(file,label,caption)=>{
  const input=fs.readFileSync(file),hash=crypto.createHash('sha256').update(input).digest('hex').slice(0,12),variants=[];
  for(const edge of [640,1280,2000]){
    const {data,info}=await sharp(input).rotate().resize({width:edge,height:edge,fit:'inside',withoutEnlargement:true}).webp({lossless:true,effort:4}).toBuffer({resolveWithObject:true});
    if(variants.some(v=>v.width===info.width))continue;
    const destination=`${entry.web}/${label}-${hash}-${info.width}.webp`;
    fs.mkdirSync(path.dirname(destination),{recursive:true});fs.writeFileSync(destination,data);
    variants.push({file:destination,width:info.width,height:info.height,bytes:data.length});
  }
  const full=variants.at(-1);
  return {source:'https://www.fujisou-ainos.com/'+full.file,...full,sha256:crypto.createHash('sha256').update(fs.readFileSync(full.file)).digest('hex'),variants,caption,alt:caption};
};
if(isNew){
  for(const [n,f]of sources.entries())project.photos.push(await prepare(f,`photo-${String(n+1).padStart(2,'0')}`,`${project.title}の写真 ${n+1}`));
  project.thumbnail={...project.photos[0]};projects.unshift(project);registry.projects.unshift(entry);
  for(const intake of registry.newProjects||[])if(path.resolve(intake.originals)===folder)intake.assignedTo=id;
}else{
  const previous=value('photo')==='cover'?project.thumbnail:value('add')?null:project.photos[index];
  const caption=value('caption')||previous?.caption||`${project.title}の写真`;
  const label=value('photo')==='cover'?'cover':`photo-${String(value('add')?project.photos.length+1:index+1).padStart(2,'0')}`;
  const image=await prepare(sources[0],label,caption);
  if(value('photo')==='cover')project.thumbnail=image;
  else if(value('add')){project.photos.push(image);if(value('make-cover'))project.thumbnail={...image};}
  else{project.photos[index]=image;if(project.thumbnail.file===previous.file)project.thumbnail={...image};}
}
for(const [file,data]of [[projectsFile,projects],[registryFile,registry]]){fs.writeFileSync(file+'.tmp',JSON.stringify(data,null,2)+'\n');fs.renameSync(file+'.tmp',file);}
console.log(`Saved ${id}; original photographs unchanged. Previous records: ${backup}`);
await import('./rebuild-gallery.mjs');
