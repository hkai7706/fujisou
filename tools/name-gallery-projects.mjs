import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');process.chdir(root);
const names=JSON.parse(fs.readFileSync('gallery/project-renames.json','utf8')).names;
const registry=JSON.parse(fs.readFileSync('gallery/project-folders.json','utf8'));
const selected=registry.projects.filter(p=>names[p.id]);
if(!selected.length){console.log('Gallery projects already have descriptive names.');process.exit(0);}
const clean=s=>s.replace(/[<>:"/\\|?*\x00-\x1f]/g,' ').replace(/\s+/g,' ').trim().replace(/[. ]+$/,'');
const safe=(base,file)=>{const full=path.resolve(file);if(!full.startsWith(path.resolve(base)+path.sep))throw Error('Unsafe rename path: '+full);return full;};
const moves=[];
for(const p of selected){
  const id=names[p.id],folder=`${clean(p.area)||'所在地未登録'}_${[...clean(p.title)].slice(0,35).join('')}`;
  moves.push({oldId:p.id,id,oldFile:p.file,file:id+'.shtml',oldOriginals:p.originals,originals:'img/gallery/originals/'+folder,oldWeb:p.web,web:'img/gallery/houses/'+id});
}
const directoryMoves=[];
for(const m of moves){
  directoryMoves.push([safe('img/gallery/originals',m.oldOriginals),safe('img/gallery/originals',m.originals)]);
  for(const prefix of ['', 'dist/'])if(fs.existsSync(prefix+m.oldWeb))directoryMoves.push([safe(prefix+'img/gallery/houses',prefix+m.oldWeb),safe(prefix+'img/gallery/houses',prefix+m.web)]);
  if(!fs.existsSync('gallery/'+m.oldFile)||fs.existsSync('gallery/'+m.file))throw Error('Article rename conflict: '+m.oldFile);
}
if(new Set(directoryMoves.map(([,to])=>to)).size!==directoryMoves.length)throw Error('Duplicate destination folder');
for(const [from,to]of directoryMoves)if(!fs.existsSync(from)||fs.existsSync(to)||fs.lstatSync(from).isSymbolicLink())throw Error('Folder rename conflict: '+from);
console.log(`Prepared ${moves.length} descriptive article names and ${directoryMoves.length} folder renames.`);
if(!process.argv.includes('--apply')){for(const m of moves)console.log(m.oldFile+' -> '+m.file);console.log('Run with --apply to rename.');process.exit(0);}
const backup='tmp/gallery-renames/'+new Date().toISOString().replace(/[:.]/g,'-');fs.mkdirSync(backup,{recursive:true});
for(const file of ['gallery/projects.json','gallery/project-folders.json','gallery/project-facts.json','.htaccess'])fs.copyFileSync(file,path.join(backup,path.basename(file)));
// All absolute rename targets were checked above before the first mutation.
for(const [from,to]of directoryMoves)fs.renameSync(from,to);
for(const m of moves){fs.renameSync('gallery/'+m.oldFile,'gallery/'+m.file);if(fs.existsSync('dist/gallery/'+m.oldFile))fs.renameSync('dist/gallery/'+m.oldFile,'dist/gallery/'+m.file);}
const excluded=new Set(['.git','node_modules','backup','tmp','.tmp','output','dist','cms','tools','docs','originals','mailformpro','mfp.statics','iplogs']);
const rewrite=(text,galleryLocal)=>{
 for(const m of moves){
  text=text.split(m.oldOriginals).join(m.originals).split(m.oldWeb+'/').join(m.web+'/');
  text=text.split('gallery/'+m.oldFile).join('gallery/'+m.file);
  if(galleryLocal)text=text.split('"'+m.oldFile+'"').join('"'+m.file+'"').split("'"+m.oldFile+"'").join("'"+m.file+"'");
 }
 return text;
};
const walk=(dir,packaged=false)=>{for(const e of fs.readdirSync(dir,{withFileTypes:true})){if(e.isSymbolicLink()||excluded.has(e.name))continue;const file=path.join(dir,e.name);if(e.isDirectory()){walk(file,packaged);continue;}if(!/\.(?:html|shtml|css|js|mjs|json|xml)$/.test(e.name)||e.name==='project-renames.json')continue;const before=fs.readFileSync(file,'utf8'),local=file.replaceAll('\\','/').startsWith((packaged?'dist/':'')+'gallery/'),after=rewrite(before,local);if(before!==after)fs.writeFileSync(file,after);}};
walk('.');if(fs.existsSync('dist'))walk('dist',true);
const projects=JSON.parse(fs.readFileSync('gallery/projects.json','utf8'));
for(const p of projects){const m=moves.find(m=>m.file===p.file);if(m){p.legacyFile=m.oldFile;p.source='https://www.fujisou-ainos.com/gallery/'+m.file;}}
for(const p of registry.projects){const m=moves.find(m=>m.oldId===p.id);if(m)Object.assign(p,{id:m.id,file:m.file,originals:m.originals,web:m.web,legacyId:m.oldId,legacyFile:m.oldFile});}
fs.writeFileSync('gallery/projects.json',JSON.stringify(projects,null,2)+'\n');
fs.writeFileSync('gallery/project-folders.json',JSON.stringify(registry,null,2)+'\n');
// Preserve phrase breaks from the original articles under their new filenames.
const generator='tools/build-gallery-projects.mjs';fs.writeFileSync(generator,rewrite(fs.readFileSync(generator,'utf8'),true));
const csv=rows=>'\ufeff'+rows.map(row=>row.map(v=>'"'+String(v??'').replaceAll('"','""')+'"').join(',')).join('\r\n')+'\r\n';
const rows=[['フォルダー名','施工事例名','地域','ページ','公開画像フォルダー','旧ページ（転送用）']];
for(const p of registry.projects){
 rows.push([path.basename(p.originals),p.title,p.area,'gallery/'+p.file,p.web,p.legacyFile||'']);
 for(const name of fs.readdirSync(p.originals)){if(!/\.(?:json|txt|csv)$/.test(name))continue;const f=path.join(p.originals,name),before=fs.readFileSync(f,'utf8'),after=rewrite(before,true);if(before!==after)fs.writeFileSync(f,after);}
}
for(const p of registry.newProjects||[])rows.push([path.basename(p.originals),'新規施工事例','','','','']);
fs.writeFileSync('img/gallery/originals/施工事例フォルダー一覧.csv',csv(rows));
fs.writeFileSync('img/gallery/originals/はじめに.txt','\ufeff施工事例名で原本写真を整理しています。\r\n各フォルダー名は「地域_施工事例名」です。\r\n公開用画像は img/gallery/houses/家の特徴を表す英語名/ にあります。\r\n更新手順は docs/IMAGE_UPDATES.md、対応表は gallery/project-folders.json をご覧ください。\r\nNEW-01 / NEW-02 は、新しい施工事例の写真・名前が決まるまでの受付用です。\r\n');
console.log(`Renamed ${moves.length} articles and their folders. Original data backup: ${backup}`);
