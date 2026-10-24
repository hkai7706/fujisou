import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const project=path.resolve(import.meta.dirname,'..');
const root=process.argv[2]?path.resolve(process.argv[2]):project;
if(root!==project&&root!==path.join(project,'dist'))throw Error('Unsupported asset-version root');
const hashes=new Map();
const skip=new Set(['analytics-portal','analytics-service','analytics-portal-dist','analytics-service-dist','backup','dist','tmp','.git','node_modules','tools','server', 'originals']);
let changed=0;
function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){if(skip.has(e.name))continue;const file=path.join(dir,e.name);if(e.isDirectory())walk(file);else if(/\.(html|shtml)$/.test(e.name)){const original=fs.readFileSync(file,'utf8');const updated=original.replace(/((?:href|src)="([^"?]+\.(?:css|m?js)))(?:\?[^"\s]*)?"/g,(all,prefix,url)=>{if(/^(?:https?:|\/\/)/.test(url))return all;const asset=(url.startsWith('/')?path.join(root,url.slice(1)):path.resolve(path.dirname(file),url));if(!fs.existsSync(asset))return all;if(!hashes.has(asset))hashes.set(asset,crypto.createHash('sha256').update(fs.readFileSync(asset)).digest('hex').slice(0,10));return `${prefix}?v=${hashes.get(asset)}"`;});if(updated!==original){fs.writeFileSync(file,updated);changed++;}}}}
walk(root);console.log(`Cache versions refreshed in ${changed} pages.`);
