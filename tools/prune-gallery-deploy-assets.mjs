import fs from 'node:fs';
import path from 'node:path';
const root=fs.realpathSync('.'),dist=path.join(root,'dist');
const folder=path.join(dist,'img','gallery','projects');
if(!fs.existsSync(folder))process.exit(0);
if(!fs.realpathSync(folder).startsWith(dist+path.sep))throw Error('Gallery deployment folder escaped dist.');
const used=new Set();
function reference(file,url){
  if(/^https?:\/\//i.test(url)){const u=new URL(url);if(u.hostname!=='www.fujisou-ainos.com')return;url=u.pathname;}
  if(/^(?:mailto:|tel:|data:|#|\/\/)/i.test(url))return;
  url=url.split(/[?#]/)[0];if(!url)return;
  used.add(path.resolve(url.startsWith('/')?dist:path.dirname(file),url.replace(/^\//,'')));
}
function scan(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){if(entry.isSymbolicLink())continue;const file=path.join(dir,entry.name);if(entry.isDirectory())scan(file);else if(/\.(html|shtml|css|js)$/.test(file)){const text=fs.readFileSync(file,'utf8');for(const m of text.matchAll(/(?:src|href|content)="([^"]+)"/g))reference(file,m[1]);for(const m of text.matchAll(/(?:srcset|imagesrcset)="([^"]+)"/g))for(const v of m[1].split(','))reference(file,v.trim().split(/\s+/)[0]);for(const m of text.matchAll(/url\(["']?([^"')]+)["']?\)/g))reference(file,m[1]);}}}
scan(dist);let count=0,bytes=0;
function prune(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){if(entry.isSymbolicLink())continue;const file=path.join(dir,entry.name);if(entry.isDirectory())prune(file);else if(!used.has(file)&&/^[a-f0-9]{20}(?:-\d+)?\.(?:jpe?g|png|webp|gif|avif)$/i.test(entry.name)&&fs.existsSync(path.join(root,path.relative(dist,file)))){if(!fs.realpathSync(file).startsWith(folder+path.sep))throw Error('Generated asset escaped target folder.');bytes+=fs.statSync(file).size;fs.unlinkSync(file);count++;}}}
prune(folder);
console.log(`Removed ${count} unused gallery deployment copies (${(bytes/1024/1024).toFixed(1)} MiB). Source originals unchanged.`);
