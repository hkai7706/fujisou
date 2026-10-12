import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import sharp from 'sharp';
const root='https://www.fujisou-ainos.com',cache='tmp/event-import';fs.mkdirSync(cache,{recursive:true});fs.mkdirSync('img/eventinfo/articles',{recursive:true});
const decode=s=>s.replaceAll('&amp;','&').replaceAll('&quot;','"').replaceAll('&#39;',"'").replaceAll('&nbsp;',' ');
const plain=s=>decode(s.replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim());
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
async function download(url){for(let i=0;i<3;i++){try{const r=await fetch(url,{signal:AbortSignal.timeout(30000)});if(!r.ok)throw Error('HTTP '+r.status);return Buffer.from(await r.arrayBuffer());}catch(e){if(i===2)throw e;await new Promise(r=>setTimeout(r,600));}}}
async function html(url){const file=path.join(cache,crypto.createHash('sha256').update(url).digest('hex')+'.html');if(fs.existsSync(file))return fs.readFileSync(file,'utf8');const data=await download(url);fs.writeFileSync(file,data);return data.toString('utf8');}
const canonical=value=>{const u=new URL(decode(value.trim()),root);if(/fujisou-ainos\.(?:com|sub\.jp)$/.test(u.hostname)){u.protocol='https:';u.host='www.fujisou-ainos.com';}return u.href;};
const current=fs.readFileSync('eventinfo/index.html','utf8'),knownImages=new Map();
for(const m of current.matchAll(/<article class="event-card">([\s\S]*?)<\/article>/g)){const tag=m[1],date=tag.match(/<span>(\d{4}\.\d{2}\.\d{2})<\/span>/)?.[1];const img=tag.match(/<img[^>]*src="([^"]+)"[^>]*>/)?.[0];if(date&&img)knownImages.set(date.replaceAll('.','-'),{image:img.match(/src="([^"]+)"/)[1],imageWidth:Number(img.match(/width="(\d+)"/)[1]),imageHeight:Number(img.match(/height="(\d+)"/)[1])});}
const queue=[root+'/eventinfo/'],seen=new Set(queue),entries=new Map();let cursor=0;
while(cursor<queue.length){const url=queue[cursor++],text=await html(url);for(const m of text.matchAll(/href=["']([^"']*\/eventinfo\/index_\d+\.shtml)["']/g)){const next=canonical(m[1]);if(!seen.has(next)){seen.add(next);queue.push(next);}}
const list=text.match(/<ul\b[^>]*class="list"[^>]*>([\s\S]*?)<\/ul>/)?.[1];if(!list)throw Error('Missing event list '+url);
for(const m of list.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/g)){const tag=m[1],source=canonical(tag.match(/href="([^"]+)"/)[1]),date=plain(tag.match(/class="date"[^>]*>([\s\S]*?)<\/p>/)?.[1]||'').replaceAll('.','-'),title=plain(tag.match(/<h2[^>]*>([\s\S]*?)<\/h2>/)?.[1]||'');const image=tag.match(/<img[^>]*src="([^"]*)"/)?.[1]?.trim();const entry={source,title,date,thumbnail:image?canonical(image):null};if(!entries.has(source)||date>entries.get(source).date)entries.set(source,entry);}
console.log(`Discovered ${entries.size} events across ${seen.size} listings.`);}
function divBody(text,marker){const match=text.match(marker);if(!match)return null;let depth=1;const start=match.index+match[0].length,tokens=/<\/?div\b[^>]*>/gi;tokens.lastIndex=start;let m;while((m=tokens.exec(text))){depth+=/^<\//.test(m[0])?-1:1;if(!depth)return text.slice(start,m.index);}return null;}
const mediaTasks=new Map(),issues=[];
function media(url){if(mediaTasks.has(url))return mediaTasks.get(url);const promise=(async()=>{const file='img/eventinfo/articles/'+crypto.createHash('sha256').update(url).digest('hex').slice(0,20)+'.webp';if(!fs.existsSync(file))await sharp(await download(url)).rotate().resize({width:1600,withoutEnlargement:true}).webp({quality:88}).toFile(file);const meta=await sharp(file).metadata();return{image:'../'+file,imageWidth:meta.width,imageHeight:meta.height};})();mediaTasks.set(url,promise);return promise;}
const all=[...entries.values()],posts=[],failures=[];let next=0,done=0;
async function worker(){while(next<all.length){const entry=all[next++];try{const legacyFile=new URL(entry.source).pathname.split('/').pop();if(legacyFile==='tonami-open-house.shtml'){posts.push({...entry,legacyFile,file:'open-house/index.html',existing:true,...knownImages.get(entry.date)});done++;continue;}
const text=await html(entry.source);let body=divBody(text,/<div\b[^>]*class="postbody"[^>]*>/i);
if(!body){const start=text.indexOf('</header>')+9;let end=text.search(/<nav\b[^>]*class="pagenav/);if(end<0)end=text.search(/<footer\b/i);if(start<9||end<=start)throw Error('Event content missing');body=text.slice(start,end);}
body=body.replace(/<(script|style|form|svg)\b[^>]*>[\s\S]*?<\/\1>/gi,'').replace(/<!--[\s\S]*?-->/g,'').replace(/\s(?:style|on\w+)=(?:"[^"]*"|'[^']*')/gi,'').replace(/<\/?(?:main|article)\b[^>]*>/gi,'').replace(/<h1\b/g,'<h2').replace(/<\/h1>/g,'</h2>').replace(/　{2,}/g,' ');
for(const m of [...body.matchAll(/<img\b[^>]*>/gi)]){const tag=m[0],src=tag.match(/src=["']([^"']+)["']/i)?.[1];if(!src){body=body.replace(tag,'');continue;}try{const image=await media(canonical(new URL(decode(src),entry.source).href)),alt=plain(tag.match(/alt=["']([^"']*)["']/i)?.[1]||entry.title);body=body.replace(tag,`<img src="${esc(image.image)}" alt="${esc(alt)}" width="${image.imageWidth}" height="${image.imageHeight}" loading="lazy" decoding="async">`);}catch(e){issues.push({article:entry.source,image:src,error:e.message});body=body.replace(tag,'');}}
let lead=knownImages.get(entry.date);if(!lead&&entry.thumbnail){try{lead=await media(entry.thumbnail);}catch(e){issues.push({article:entry.source,image:entry.thumbnail,error:e.message});}}
const slug=entry.title.normalize('NFKC').replace(/[^\p{L}\p{N}]+/gu,'-').replace(/^-|-$/g,'').slice(0,24).replace(/-$/,'');const file=`${entry.date}-${slug||'event'}-${legacyFile.replace(/\.shtml$/,'')}.html`;
if(!plain(body))throw Error('Empty event content');posts.push({...entry,legacyFile,file,body,...(lead||{image:null,imageWidth:0,imageHeight:0})});done++;if(done%10===0)console.log(`Imported ${done}/${all.length} event details.`);
}catch(e){failures.push({source:entry.source,error:e.message});}}
}
await Promise.all(Array.from({length:4},worker));
const urls=new Map(posts.map(p=>[p.source,p.file]));
for(const p of posts){if(!p.body)continue;p.body=p.body.replace(/href=["']([^"']*)["']/gi,(tag,value)=>{if(/^(?:#|tel:|mailto:)/i.test(value))return tag;let u;try{u=new URL(decode(value),p.source);}catch{return tag;}const key=canonical(u.href).split('#')[0];if(urls.has(key))return`href="${esc(urls.get(key)+u.hash)}"`;if(u.pathname==='/eventinfo/')return'href="index.html"';if(u.pathname==='/contact/'||/consultation|contact/.test(u.pathname))return'href="../contact/index.html"';if(u.pathname==='/')return'href="../index.html"';return`href="${esc(u.href)}"`;});}
posts.sort((a,b)=>b.date.localeCompare(a.date)||a.source.localeCompare(b.source));fs.writeFileSync('eventinfo/posts.json',JSON.stringify(posts,null,2)+'\n');fs.writeFileSync('eventinfo/import-report.json',JSON.stringify({discovered:entries.size,imported:posts.length,listings:seen.size,failures,imageIssues:issues},null,2)+'\n');console.log(`Saved ${posts.length} events; ${failures.length} failed details; ${issues.length} image issues.`);if(failures.length)process.exitCode=1;
