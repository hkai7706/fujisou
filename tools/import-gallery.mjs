import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import sharp from 'sharp';

const root='https://www.fujisou-ainos.com';
const cache='tmp/gallery-import';
fs.mkdirSync(cache,{recursive:true});
fs.mkdirSync('img/gallery/projects',{recursive:true});
const decode=s=>s.replaceAll('&amp;','&').replaceAll('&quot;','"').replaceAll('&#39;',"'").replaceAll('&nbsp;',' ').replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(Number(n)));
const plain=s=>decode(s.replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim());
const canonical=value=>{const u=new URL(decode(value),root);if(/fujisou-ainos\.(?:com|sub\.jp)$/.test(u.hostname)){u.protocol='https:';u.host='www.fujisou-ainos.com';}return u.href;};
const hash=value=>crypto.createHash('sha256').update(value).digest('hex');
async function download(url){let last;for(let i=0;i<3;i++){try{const r=await fetch(url,{signal:AbortSignal.timeout(30000)});if(!r.ok)throw Error(`HTTP ${r.status}`);return Buffer.from(await r.arrayBuffer());}catch(e){last=e;}}throw new Error(`${url}: ${last.message}`);}
async function html(url){const file=path.join(cache,hash(url)+'.html');if(!fs.existsSync(file))fs.writeFileSync(file,await download(url));return fs.readFileSync(file,'utf8');}
function inside(text,tag,pattern){const m=text.match(pattern);if(!m)return null;let depth=1;const start=m.index+m[0].length;const tokens=new RegExp(`<\\/?${tag}\\b[^>]*>`,'gi');tokens.lastIndex=start;let token;while((token=tokens.exec(text))){depth+=/^<\//.test(token[0])?-1:1;if(!depth)return text.slice(start,token.index);}return null;}
const queue=[root+'/gallery/'],seen=new Set(queue),entries=new Map();
for(let cursor=0;cursor<queue.length;cursor++){const url=queue[cursor],text=await html(url);for(const m of text.matchAll(/href=["']([^"']*\/gallery\/index_\d+\.shtml)["']/g)){const next=canonical(m[1]);if(!seen.has(next)){seen.add(next);queue.push(next);}}
const list=inside(text,'ul',/<ul\b[^>]*class="list"[^>]*>/i);if(!list)throw Error('Missing gallery listing '+url);
for(const m of list.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/g)){const item=m[1],href=item.match(/href="([^"]+)"/)?.[1];if(!href)continue;const source=canonical(href);const headings=[...item.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/g)].map(m=>plain(m[1]));if(!entries.has(source))entries.set(source,{source,title:headings[0]||'',area:headings[1]||'',thumbnail:new URL(decode(item.match(/<img[^>]*src="([^"]+)"/)?.[1]||''),url).href,file:new URL(source).pathname.split('/').pop()});}
}
console.log(`Found ${entries.size} projects across ${seen.size} archive pages.`);
const jobs=new Map(),issues=[],recoveredImages=[];
function media(url){url=canonical(url);if(jobs.has(url))return jobs.get(url);const job=(async()=>{const key=hash(url).slice(0,20);const metaFile=path.join(cache,key+'.json');if(fs.existsSync(metaFile)){const item=JSON.parse(fs.readFileSync(metaFile));if(fs.existsSync(item.file)&&item.variants.every(v=>fs.existsSync(v.file))){if(url.endsWith('/gallery/uploads/_APS53.jpg'))recoveredImages.push({source:url,localFile:'img/gallery/post31-11-stairs-detail.jpg'});return item;}}
let bytes=await download(url),metadata;
try{metadata=await sharp(bytes).metadata();}catch(error){
  // This original URL currently returns the homepage, but its photo exists in the project.
  if(url.endsWith('/gallery/uploads/_APS53.jpg')&&fs.existsSync('img/gallery/post31-11-stairs-detail.jpg')){
    bytes=fs.readFileSync('img/gallery/post31-11-stairs-detail.jpg');metadata=await sharp(bytes).metadata();recoveredImages.push({source:url,localFile:'img/gallery/post31-11-stairs-detail.jpg'});
  }else throw error;
}
const ext={jpeg:'jpg',png:'png',webp:'webp',gif:'gif',avif:'avif'}[metadata.format];if(!ext)throw Error('Unsupported image '+url);
const file=`img/gallery/projects/${key}.${ext}`;fs.writeFileSync(file,bytes);
const width=metadata.autoOrient?.width||metadata.width,height=metadata.autoOrient?.height||metadata.height;
const variants=[];for(const size of [...new Set([Math.min(640,width),Math.min(1280,width)])]){const output=`img/gallery/projects/${key}-${size}.webp`;if(!fs.existsSync(output))await sharp(bytes).rotate().resize({width:size,withoutEnlargement:true}).webp({lossless:true,effort:5}).toFile(output);const m=await sharp(output).metadata();variants.push({file:output,width:m.width,height:m.height});}
const item={source:url,file,width,height,bytes:bytes.length,sha256:hash(bytes),variants};fs.writeFileSync(metaFile,JSON.stringify(item));return item;})();jobs.set(url,job);return job;}
const all=[...entries.values()],projects=[],failures=[];let next=0;
async function worker(){while(next<all.length){const entry=all[next++];try{const raw=await html(entry.source),main=inside(raw,'main',/<main\b[^>]*>/i);if(!main)throw Error('Missing detail content');const clean=main.replace(/<!--[\s\S]*?-->/g,'');
const intro=inside(clean,'section',/<section\b[^>]*class="intro"[^>]*>/i)||clean;
let description=inside(intro,'div',/<div\b[^>]*class="txt"[^>]*>/i)||'';
description=description.replace(/<(script|style|form|svg|iframe)\b[^>]*>[\s\S]*?<\/\1>/gi,'').replace(/\s(?:style|on\w+)=(?:"[^"]*"|'[^']*')/gi,'').replace(/<img\b[^>]*>/gi,'').trim();
// Older articles keep photos inside the text, with an empty Fotorama container.
const photoBody=clean.split(/<nav\b/i)[0];const photos=[];
for(const m of photoBody.matchAll(/<img\b[^>]*>/gi)){const tag=m[0],src=tag.match(/(?:data-full|src)=["']([^"']+)["']/i)?.[1];if(!src||/logo|icon_|banner/i.test(src))continue;try{const image=await media(new URL(decode(src),entry.source).href),caption=plain(tag.match(/data-caption=["']([^"']*)["']/i)?.[1]||'');if(photos.some(p=>p.sha256===image.sha256&&p.caption===caption))continue;photos.push({...image,caption,alt:plain(tag.match(/alt=["']([^"']*)["']/i)?.[1]||'')});}catch(e){issues.push({project:entry.source,image:src,error:e.message});}}
if(!photos.length)throw Error('No project photos');
let thumbnail;try{thumbnail=await media(entry.thumbnail);}catch(e){issues.push({project:entry.source,image:entry.thumbnail,error:e.message});thumbnail=photos[0];}
projects.push({...entry,description,photos,thumbnail});console.log(`Imported ${entry.file}: ${photos.length} photos.`);
}catch(e){failures.push({source:entry.source,error:e.message});}}}
await Promise.all(Array.from({length:3},worker));
projects.sort((a,b)=>all.findIndex(p=>p.source===a.source)-all.findIndex(p=>p.source===b.source));
fs.writeFileSync('gallery/projects.json',JSON.stringify(projects,null,2)+'\n');
fs.writeFileSync('gallery/import-report.json',JSON.stringify({listings:[...seen],discovered:entries.size,imported:projects.length,photos:projects.reduce((n,p)=>n+p.photos.length,0),failures,imageIssues:issues,recoveredImages},null,2)+'\n');
console.log(`Imported ${projects.length} projects, ${projects.reduce((n,p)=>n+p.photos.length,0)} photos; ${failures.length} failed pages, ${issues.length} image issues.`);
if(failures.length||issues.length)process.exitCode=1;
