import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const hashes=new Map();
const skip=new Set(['backup','dist','tmp','.git','node_modules','tools','server']);
let changed=0;
function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){if(skip.has(e.name))continue;const file=path.join(dir,e.name);if(e.isDirectory())walk(file);else if(/\.(html|shtml)$/.test(e.name)){const original=fs.readFileSync(file,'utf8');const updated=original.replace(/((?:href|src)="([^"?]+\.(?:css|js)))(?:\?[^"\s]*)?"/g,(all,prefix,url)=>{if(/^(?:https?:|\/\/)/.test(url))return all;const asset=path.resolve(url.startsWith('/')?'.':path.dirname(file),url.replace(/^\//,''));if(!fs.existsSync(asset))return all;if(!hashes.has(asset))hashes.set(asset,crypto.createHash('sha256').update(fs.readFileSync(asset)).digest('hex').slice(0,10));return `${prefix}?v=${hashes.get(asset)}"`;});if(updated!==original){fs.writeFileSync(file,updated);changed++;}}}}
walk('.');console.log(`Cache versions refreshed in ${changed} pages.`);
