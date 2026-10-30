import fs from 'node:fs';
import path from 'node:path';
const project=path.resolve(import.meta.dirname,'..'),root=path.resolve(process.argv[2]||project);
const routes=JSON.parse(fs.readFileSync(path.join(project,'docs/legacy-routes.json'),'utf8'));
const skip=new Set(['.git','node_modules','tools','docs','source','dist','backup','tmp','.tmp','output','cms','mailformpro','mfp.statics','iplogs','originals','analytics-portal','analytics-service','analytics-portal-dist','analytics-service-dist']);
let count=0;
function localize(html,dir){return html.replace(/(<a\b[^>]*\bhref=)["'](https?:\/\/[^"']+)["']/gi,(all,prefix,href)=>{
 let url;try{url=new URL(href.replaceAll('&amp;','&'));}catch{return all;}
 if(!/^(?:www\.)?fujisou-ainos\.(?:com|sub\.jp)$/.test(url.hostname))return all;
 const old=decodeURI(url.pathname.slice(1)),target=routes[old]||old;
 const file=path.join(root,target.endsWith('/')?target+'index.html':target||'index.html');
 if(!fs.existsSync(file))return all;
 let relative=path.relative(dir,path.join(root,target)).split(path.sep).join('/')||'.';
 if(target.endsWith('/')||!target)relative+='/';
 count++;
 return prefix+'"'+(relative+url.search+url.hash).replaceAll('&','&amp;').replaceAll('"','&quot;')+'"';
});}
function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){
 if(skip.has(e.name)||e.isSymbolicLink())continue;
 const file=path.join(dir,e.name);if(e.isDirectory()){walk(file);continue;}
 if(!/\.(?:html|shtml|fragment)$/.test(e.name))continue;
 const source=fs.readFileSync(file,'utf8'),result=localize(source,path.dirname(file));if(result!==source)fs.writeFileSync(file,result);
}}
walk(root);
if(root===project)for(const group of ['staffblog','eventinfo']){
 const file=path.join(root,group,'posts.json'),posts=JSON.parse(fs.readFileSync(file,'utf8'));
 let changed=false;for(const p of posts){if(!p.body)continue;const body=localize(p.body,path.join(root,group));if(body!==p.body){p.body=body;changed=true;}}
 if(changed)fs.writeFileSync(file,JSON.stringify(posts,null,2)+'\n');
}
console.log(`Localized ${count} original-site links to preserved pages and downloads.`);
