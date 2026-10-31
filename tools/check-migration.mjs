import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {renderEventState} from './event-state.mjs';
const root=path.resolve(process.argv[2]||'.');
const manifest=JSON.parse(fs.readFileSync('docs/original-public-inventory.json','utf8'));
const routes=JSON.parse(fs.readFileSync('docs/legacy-routes.json','utf8'));
for(const entry of manifest.entries){
 const name=decodeURI(entry.original.slice(1));
 const file=path.join(root,!name||name.endsWith('/')?name+'index.html':name);
 assert.ok(fs.existsSync(file),`Missing original entry point ${entry.original}`);
}
for(const [old,target] of Object.entries(routes)){
 const file=path.join(root,old.endsWith('/')?old+'index.html':old);
 const html=fs.readFileSync(file,'utf8');
 assert.match(html,/data-legacy-redirect/);
 const refresh=html.match(/http-equiv="refresh" content="0;url=([^"]+)"/)[1];
 const destination=new URL(refresh,'https://example.test/fujisou/'+old);
 assert.equal(decodeURI(destination.pathname),'/fujisou/'+target,`Nested static redirect ${old}`);
 assert.ok(fs.existsSync(path.join(root,target.endsWith('/')?target+'index.html':target)));
}
const downloads=[...JSON.parse(fs.readFileSync('docs/original-downloads.json','utf8')),...JSON.parse(fs.readFileSync('docs/original-image-downloads.json','utf8'))];
const access=fs.readFileSync(path.join(root,'.htaccess'),'utf8');
for(const record of downloads){
 assert.ok(!record.error,record.source||record.url);
 const original=path.join(root,record.file);
 const converted=original.replace(/\.(?:png|gif)$/i,'.deploy.webp');
 const preserved=fs.existsSync(original)||(fs.existsSync(converted)&&/RewriteRule \^\(\.\+\)\\\.\(\?:png\|gif\)\$ \/\$1\.deploy\.webp/.test(access));
 assert.ok(preserved,`Missing download or compatibility redirect ${record.file}`);
}
const home=fs.readFileSync(path.join(root,'index.html'),'utf8');
assert.match(home,/eventinfo\/november-open-house\//);
const ended=renderEventState(home,'2026-11-16');
assert.match(ended,/<section class="home-event"[^>]*\bhidden\b/,'Expired promotion must hide');
const event=fs.readFileSync(path.join(root,'eventinfo/november-open-house/index.html'),'utf8');
assert.match(event,/2026-11-14/);assert.match(event,/2026-11-15/);
assert.match(renderEventState(event,'2026-11-16'),/<p class="event-ended-note" data-event-closed>/);
assert.match(event,/href="\.\.\/\.\.\/contact\/\?topic=visit#mailformpro"/);
console.log(`Migration passed: ${manifest.entries.length} original routes, ${Object.keys(routes).length} nested-safe redirects, ${downloads.length} downloads, November event and expiry.`);
