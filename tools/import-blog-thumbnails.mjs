import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import sharp from 'sharp';
const root='https://www.fujisou-ainos.com';
const latest=process.argv.includes('--latest');
const posts=JSON.parse(fs.readFileSync('staffblog/posts.json','utf8'));
const bySource=new Map(posts.map(p=>[p.source,p]));
const overrides=JSON.parse(fs.readFileSync('staffblog/thumbnail-overrides.json','utf8'));
const candidates=new Map(),issues=[];
const cache='tmp/blog-thumbnail-import';fs.mkdirSync(cache,{recursive:true});fs.mkdirSync('img/staffblog/thumbnails',{recursive:true});
const decode=s=>s.replaceAll('&amp;','&').replaceAll('&quot;','"').replaceAll('&#39;',"'");
async function download(url){for(let i=0;i<3;i++){try{const r=await fetch(url,{signal:AbortSignal.timeout(30000)});if(!r.ok)throw Error('HTTP '+r.status);return Buffer.from(await r.arrayBuffer());}catch(e){if(i===2)throw e;await new Promise(r=>setTimeout(r,600));}}}
async function html(url){const file=path.join(cache,crypto.createHash('sha256').update(url).digest('hex')+'.html');if(!latest&&fs.existsSync(file))return fs.readFileSync(file,'utf8');const data=await download(url);fs.writeFileSync(file,data);return data.toString('utf8');}
const queue=[root+'/staffblog/'],seen=new Set(queue);let cursor=0,scanned=0;
async function crawl(){while(cursor<queue.length){const url=queue[cursor++];try{const text=await html(url);
 for(const m of text.matchAll(/(?:href|value)=["']([^"']+)["']/g)){let u;try{u=new URL(decode(m[1]),url);}catch{continue;}if(!latest&&u.origin===root&&/^\/staffblog\/20\d\d\/\d{2}\/(?:index(?:_\d+)?\.(?:html|shtml))?$/.test(u.pathname)&&!seen.has(u.href)){seen.add(u.href);queue.push(u.href);}}
 for(const match of text.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)){let source;try{source=new URL(decode(match[1]),url);source.hash='';}catch{continue;}if(!bySource.has(source.href)||(latest&&overrides[bySource.get(source.href).legacyFile]))continue;
  for(const im of match[2].matchAll(/<img\b[^>]*src=["']([^"']+)["'][^>]*>/gi)){const image=new URL(decode(im[1]),url).href;if(!image.startsWith(root+'/staffblog/'))continue;const size=Number(image.match(/-thumb-(\d+)x/)?.[1]||0)||1000;const old=candidates.get(source.href);if(!old||size>old.size)candidates.set(source.href,{url:image,size,alt:decode(im[0].match(/alt=["']([^"']*)/)?.[1]||bySource.get(source.href).title),listing:url});}
 }
 scanned++;if(scanned%10===0)console.log(`Scanned ${scanned}/${seen.size} listings; ${candidates.size} matched thumbnail sources.`);
 }catch(e){issues.push({listing:url,error:e.message});}}
}
// Start with the index to discover monthly archives, then fetch those in parallel.
await crawl();
console.log(`Found original thumbnails for ${candidates.size} of ${posts.length} posts across ${scanned} listings.`);
const tasks=[...candidates.entries()];let index=0,done=0,saved=0;
async function save(){while(index<tasks.length){const [source,candidate]=tasks[index++],post=bySource.get(source);try{
 let used=candidate.url;
 if(candidate.size<300)used=used.replace(/-thumb-\d+x\d+(?=-\d+\.)/,'-thumb-560xauto');
 const name=crypto.createHash('sha256').update(used).digest('hex').slice(0,20)+'.webp',file='img/staffblog/thumbnails/'+name;
 if(!fs.existsSync(file)){let data=await download(used);try{await sharp(data).metadata();}catch{used=candidate.url;data=await download(used);}await sharp(data).rotate().resize({width:1440,withoutEnlargement:true}).webp({quality:90}).toFile(file);}
 const meta=await sharp(file).metadata();if(meta.width<100||meta.height<60)throw Error('Original thumbnail too small for a usable card');
 overrides[post.legacyFile]={image:'../'+file,imageWidth:meta.width,imageHeight:meta.height,imageAlt:candidate.alt,source:used,listing:candidate.listing};if(latest&&!post.image)Object.assign(post,{image:'../'+file,imageWidth:meta.width,imageHeight:meta.height});saved++;
 }catch(e){issues.push({article:source,thumbnail:candidate.url,error:e.message});}done++;if(done%25===0){fs.writeFileSync('staffblog/thumbnail-overrides.json',JSON.stringify(overrides,null,2)+'\n');console.log(`Saved ${saved}/${tasks.length} original thumbnails; ${issues.length} issues.`);}}
}
await Promise.all(Array.from({length:4},save));
fs.writeFileSync('staffblog/thumbnail-overrides.json',JSON.stringify(overrides,null,2)+'\n');
if(latest)fs.writeFileSync('staffblog/posts.json',JSON.stringify(posts,null,2)+'\n');
const missing=posts.filter(p=>!overrides[p.legacyFile]&&!p.image).map(p=>({source:p.source,file:p.file}));
fs.writeFileSync('staffblog/'+(latest?'latest-thumbnail-import-report.json':'thumbnail-import-report.json'),JSON.stringify({scannedListings:scanned,matchedSources:candidates.size,saved,issues,withoutAvailableImage:missing},null,2)+'\n');
console.log(`Finished: ${saved} original thumbnails saved; ${missing.length} posts have no available image; ${issues.length} issues.`);
