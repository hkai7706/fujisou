import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import sharp from 'sharp';
const root='https://www.fujisou-ainos.com';
const latest=process.argv.includes('--latest');
const cache='tmp/blog-import';fs.mkdirSync(cache,{recursive:true});fs.mkdirSync('img/staffblog/articles',{recursive:true});
const existing=JSON.parse(fs.readFileSync('staffblog/posts.json','utf8'));
const existingBySource=new Map(existing.map(p=>[p.source,p]));
const failures=[];const mediaFailures=[];const mediaTasks=new Map();
const decode=s=>s.replaceAll('&amp;','&').replaceAll('&quot;','"').replaceAll('&#39;',"'").replaceAll('&nbsp;',' ').replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(Number(n))).replace(/&#x([\da-f]+);/gi,(_,n)=>String.fromCodePoint(parseInt(n,16)));
const plain=s=>decode(s.replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim());
const esc=s=>s.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
async function download(url){for(let attempt=0;attempt<3;attempt++){try{const r=await fetch(url,{signal:AbortSignal.timeout(45000)});if(!r.ok)throw Error(`${r.status} ${url}`);return Buffer.from(await r.arrayBuffer());}catch(e){if(attempt===2)throw e;await new Promise(r=>setTimeout(r,500*(attempt+1)));}}}
async function html(url){const file=path.join(cache,crypto.createHash('sha256').update(url).digest('hex')+'.html');if(!latest&&fs.existsSync(file))return fs.readFileSync(file,'utf8');const data=await download(url);fs.writeFileSync(file,data);return data.toString('utf8');}
const queue=[root+'/staffblog/archives.shtml'];const seen=new Set(queue);const entries=new Map();let cursor=0;
async function archiveWorker(){while(cursor<queue.length){const url=queue[cursor++];const text=await html(url);for(const m of text.matchAll(/href=["']([^"']*\/staffblog\/archives(?:_\d+)?\.shtml)["']/g)){const u=new URL(decode(m[1]),url).href;if(!latest&&!seen.has(u)){seen.add(u);queue.push(u);}}
 const list=text.match(/<ul\b[^>]*class="archivelist"[^>]*>([\s\S]*?)<\/ul>/)?.[1];if(!list)throw Error('Archive list missing '+url);
 for(const m of list.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/g)){const tag=m[1];const source=new URL(decode(tag.match(/href="([^"]+)"/)[1]),url).href;const title=plain(tag.match(/<h2[^>]*>([\s\S]*?)<\/h2>/)?.[1]||'');const date=plain(tag.match(/class="date"[^>]*>([\s\S]*?)<\/span>/)?.[1]||'').replaceAll('.','-');const category=plain(tag.match(/class="cat"[^>]*>([\s\S]*?)<\/span>/)?.[1]||'').replace(/^｜/,'')||'社長ブログ';entries.set(source,{source,title,date,category});}
 console.log(`Archive ${seen.size} known pages; ${entries.size} unique articles discovered`);
}}
await Promise.all(Array.from({length:4},archiveWorker));
fs.writeFileSync('staffblog/'+(latest?'latest-discovery.json':'archive-discovery.json'),JSON.stringify({archives:[...seen],articles:[...entries.values()]},null,2));
console.log(`Discovery complete: ${seen.size} archive pages, ${entries.size} articles.`);
function extract(text){const marker=text.match(/<div\b[^>]*class=["']postbody["'][^>]*>/i);if(!marker)throw Error('Missing article body');const start=marker.index+marker[0].length;const tokens=/<\/?div\b[^>]*>/gi;tokens.lastIndex=start;let depth=1,m;while((m=tokens.exec(text))){depth+=/^<\//.test(m[0])?-1:1;if(!depth)return text.slice(start,m.index);}throw Error('Unclosed article body');}
function media(url){if(mediaTasks.has(url))return mediaTasks.get(url);const task=(async()=>{const hash=crypto.createHash('sha256').update(url).digest('hex').slice(0,16);let extension=path.extname(new URL(url).pathname).toLowerCase();if(!['.gif','.svg'].includes(extension))extension='.webp';const file=`img/staffblog/articles/${hash}${extension}`;
 if(!fs.existsSync(file)){const data=await download(url);if(extension==='.webp')await sharp(data).rotate().resize({width:1600,withoutEnlargement:true}).webp({quality:85}).toFile(file);else fs.writeFileSync(file,data);}
 const info=await sharp(file).metadata();return{image:'../'+file,imageWidth:info.width||800,imageHeight:info.height||600};})();mediaTasks.set(url,task);return task;}
const all=[...entries.values()];const posts=[];let next=0,done=0;
async function articleWorker(){while(next<all.length){const entry=all[next++];try{
 if(existingBySource.has(entry.source)){posts.push(existingBySource.get(entry.source));done++;continue;}
 const text=await html(entry.source);let body=extract(text);body=body.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi,'').replace(/<!--[\s\S]*?-->/g,'');
 body=body.replace(/<div\b([^>]*\bstyle="[^"]*"[^>]*)>/gi,(tag,attrs)=>/display\s*:\s*(?:flex|grid)/i.test(attrs)?'<div class="blog-entry__columns">':/background\s*:/i.test(attrs)?'<div class="blog-entry__callout">':tag).replace(/\s(?:style|on\w+)=(?:"[^"]*"|'[^']*')/gi,'').replace(/<h1\b/g,'<h2').replace(/<\/h1>/g,'</h2>');
 const post={...entry};post.title=plain(text.match(/<h2\b[^>]*class="blogtitle"[^>]*>([\s\S]*?)<\/h2>/)?.[1]||entry.title);
 const oldFile=decodeURIComponent(new URL(entry.source).pathname.split('/').pop());const slug=post.title.normalize('NFKC').replace(/[^\p{L}\p{N}]+/gu,'-').replace(/^-|-$/g,'').slice(0,28).replace(/-$/,'');post.file=`${entry.date}-${slug||'article'}-${oldFile.replace(/\.shtml$/,'')}.shtml`;post.legacyFile=oldFile;post.permalink=root+'/staffblog/'+encodeURIComponent(post.file);
 let lead;for(const m of [...body.matchAll(/<img\b[^>]*>/gi)]){const tag=m[0];const src=tag.match(/\bsrc=["']([^"']+)["']/i)?.[1];if(!src)continue;try{const info=await media(new URL(decode(src),entry.source).href);if(!lead)lead=info;const alt=plain(tag.match(/\balt=["']([^"']*)["']/i)?.[1]||post.title);body=body.replace(tag,`<img src="${esc(info.image)}" alt="${esc(alt)}" width="${info.imageWidth}" height="${info.imageHeight}" loading="lazy" decoding="async">`);}catch(e){mediaFailures.push({article:entry.source,image:src,error:e.message});body=body.replace(tag,`<p class="blog-image-unavailable">${esc(plain(tag.match(/\balt=["']([^"']*)["']/i)?.[1]||'元の記事の画像'))}（元サイトの画像を取得できませんでした）</p>`);}}
 if(!lead){const og=text.match(/<meta\b[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i)?.[1];if(og&&!/ogp\.|logo/i.test(og)){try{lead=await media(new URL(decode(og),entry.source).href);}catch{}}}
 if(lead)Object.assign(post,lead);else{post.image=null;post.imageWidth=0;post.imageHeight=0;}
 post.body=body.trim();post.excerpt=plain(body).slice(0,110);if(!post.body)throw Error('Empty article');posts.push(post);done++;
 if(done%20===0){fs.writeFileSync(path.join(cache,'import-progress.json'),JSON.stringify(posts));console.log(`Imported ${done}/${all.length}; media issues ${mediaFailures.length}`);}
 }catch(e){failures.push({source:entry.source,error:e.message});console.log(`FAILED ${entry.source}: ${e.message}`);}}
}
await Promise.all(Array.from({length:4},articleWorker));
for(const post of existing){if(!posts.some(p=>p.source===post.source))posts.push(post);}
const urls=new Map(posts.map(p=>[p.source,p.file]));
const localRoutes={'/contact/':'../contact/index.html','/concept/':'../concept/index.html','/staff/':'../staff/index.html','/gallery/':'../gallery/index.html','/eventinfo/':'../eventinfo/index.html','/staffblog/':'index.html','/':'../index.html'};
for(const p of posts){p.body=p.body.replace(/href=["']([^"']+)["']/g,(tag,value)=>{if(/^(?:#|tel:|mailto:|data:)/i.test(value))return tag;let url;try{url=new URL(decode(value),p.source);}catch{return tag;}if(urls.has(url.href))return`href="${esc(urls.get(url.href))}"`;if(url.origin===root&&localRoutes[url.pathname])return`href="${localRoutes[url.pathname]}${esc(url.hash)}"`;if(!/^https?:/i.test(value))return`href="${esc(url.href)}"`;return tag;});}
posts.sort((a,b)=>b.date.localeCompare(a.date)||a.source.localeCompare(b.source));posts.forEach((p,i)=>p.index=i+1);
fs.writeFileSync('staffblog/posts.json',JSON.stringify(posts,null,2)+'\n');fs.writeFileSync('staffblog/'+(latest?'latest-import-report.json':'import-report.json'),JSON.stringify({discovered:all.length,imported:posts.length,archivePages:seen.size,failures,mediaFailures},null,2)+'\n');
console.log(`Saved ${posts.length} articles; ${failures.length} failed pages; ${mediaFailures.length} unavailable images.`);
if(failures.length)process.exitCode=1;
