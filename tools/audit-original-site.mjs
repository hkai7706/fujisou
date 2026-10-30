import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

// Read-only public migration inventory. Never follows forms or account services.
const root='https://www.fujisou-ainos.com';
const dir='tmp/original-audit-2026-10-30';
fs.mkdirSync(dir,{recursive:true});
const queue=['/'],seen=new Set(queue),pages=[],assets=new Set(),external=new Set();
const decode=s=>s.replaceAll('&amp;','&').replaceAll('&quot;','"').replaceAll('&#39;',"'");
function resolve(value,base){try{return new URL(decode(value),base)}catch{return null}}
while(queue.length){
 const batch=queue.splice(0,4);
 const results=await Promise.all(batch.map(async pathname=>{
  const file=path.join(dir,crypto.createHash('sha256').update(pathname).digest('hex')+'.html');
  try{
   let html,status=200;
   if(fs.existsSync(file))html=fs.readFileSync(file,'utf8');
   else{const r=await fetch(root+pathname,{signal:AbortSignal.timeout(25000)});status=r.status;if(!r.ok)return{path:pathname,status};html=await r.text();fs.writeFileSync(file,html)}
   return{path:pathname,status,title:html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1],file,html};
  }catch(error){return{path:pathname,error:error.message}}
 }));
 for(const result of results){
  if(result.html){
   for(const m of result.html.matchAll(/\b(?:href|src)\s*=\s*["']([^"']+)["']/gi)){
    const u=resolve(m[1],root+result.path);if(!u||!/^https?:$/.test(u.protocol))continue;
    if(!/^(?:www\.)?fujisou-ainos\.(?:com|sub\.jp)$/.test(u.hostname)){if(m[0].startsWith('href'))external.add(u.href);continue}
    const p=u.pathname;
    if(/\.(?:pdf|zip|xlsx?|docx?)$/i.test(p))assets.add(u.href);
    if(!m[0].startsWith('href')||u.search||/\/(?:cms|mailformpro|mfp\.statics|iplogs)\//i.test(p))continue;
    if(!(/\.(?:s?html?)$/i.test(p)||p.endsWith('/')))continue;
    if(!seen.has(p)){seen.add(p);queue.push(p)}
   }
   delete result.html;
  }
  pages.push(result);
 }
 fs.writeFileSync(path.join(dir,'inventory.json'),JSON.stringify({pages,assets:[...assets],external:[...external],remaining:queue},null,2));
 if(pages.length%40<4||!queue.length)console.log(`Audited ${pages.length} original public URLs; ${queue.length} queued.`);
}
console.log(`Finished: ${pages.length} URLs, ${assets.size} downloads, ${external.size} external destinations.`);
