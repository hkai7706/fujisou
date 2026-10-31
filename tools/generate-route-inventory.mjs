import fs from 'node:fs';
import path from 'node:path';

const project=path.resolve(import.meta.dirname,'..');
const dist=path.join(project,'dist');
const output=path.join(project,'docs','ROUTE_INVENTORY.csv');
if(!fs.existsSync(dist)||fs.realpathSync(dist)!==dist)throw Error('dist is missing or is not a real directory');

const pages=[];
function walk(dir){
  for(const item of fs.readdirSync(dir,{withFileTypes:true})){
    if(item.isSymbolicLink())throw Error('Symlink found in dist');
    const file=path.join(dir,item.name);
    if(item.isDirectory())walk(file);
    else if(/\.(?:html|shtml)$/i.test(item.name))pages.push(file);
  }
}
walk(dist);

const slash=value=>value.replaceAll('\\','/');
const csv=value=>`"${String(value??'').replaceAll('"','""')}"`;
function publicRoute(relative){
  if(relative==='index.html'||relative==='index.shtml')return '/';
  if(/\/(?:index\.html|index\.shtml)$/i.test(relative))return '/'+relative.replace(/(?:index\.html|index\.shtml)$/i,'');
  return '/'+relative;
}
function category(relative,html){
  if(relative==='404.html')return 'utility';
  if(html.includes('data-legacy-redirect'))return 'legacy redirect';
  if(relative.startsWith('staffblog/'))return 'blog';
  if(relative.startsWith('eventinfo/'))return 'event';
  if(relative.startsWith('gallery/'))return 'construction example';
  if(relative.startsWith('plans/'))return 'house plan';
  return 'maintained page';
}

const rows=pages.map(file=>{
  const relative=slash(path.relative(dist,file));
  const html=fs.readFileSync(file,'utf8');
  const canonical=html.match(/<link\b[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)/i)?.[1]||'';
  const refresh=html.match(/<meta\b[^>]*http-equiv=["']refresh["'][^>]*content=["'][^;]+;\s*url=([^"']+)/i)?.[1]||'';
  const redirect=refresh?new URL(refresh,'https://www.fujisou-ainos.com'+publicRoute(relative)).pathname:'';
  const ssi=html.includes('<!--#include virtual="/include/header.shtml" -->')&&html.includes('<!--#include virtual="/include/footer.shtml" -->');
  return [publicRoute(relative),relative,category(relative,html),canonical,redirect,ssi?'yes':'no'];
}).sort((a,b)=>a[0].localeCompare(b[0],'ja'));

const header=['Public route','File path inside upload folder','Page type','Canonical URL','Redirect target','SSI header/footer'];
fs.writeFileSync(output,[header,...rows].map(row=>row.map(csv).join(',')).join('\r\n')+'\r\n');
console.log(`Wrote ${rows.length} routes to ${path.relative(project,output)}.`);
