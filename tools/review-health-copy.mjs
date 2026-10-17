import fs from 'node:fs';
import path from 'node:path';
const revise=text=>text
  .replaceAll('化学物質を含まない「自然素材」','漆喰や無垢材などの「自然素材」')
  .replaceAll('そんな家では病気にならないほうが不思議です。','室内環境は、材料だけでなく断熱・換気・清掃・暮らし方も合わせて考える必要があります。')
  .replaceAll('住む人を健康にする','暮らしの心地よさを考える')
  .replaceAll('医者が認める','素材と室内環境を考える');
let changed=0;
function walk(dir){for(const item of fs.readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,item.name);if(item.isDirectory())walk(file);else if(/\.(html|shtml|fragment|json)$/.test(file)){const before=fs.readFileSync(file,'utf8'),after=revise(before);if(before!==after){fs.writeFileSync(file,after);changed++;}}}}
for(const dir of ['eventinfo','staffblog'])walk(dir);
console.log(`Revised unsupported health wording in ${changed} public/source files; downloaded original untouched.`);
