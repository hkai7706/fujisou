import fs from 'node:fs';
import path from 'node:path';
const project=path.resolve(import.meta.dirname,'..'),root=path.resolve(process.argv[2]||project);
if(root!==project&&root!==path.join(project,'dist'))throw Error('Unsupported seed output');
const home=fs.readFileSync(path.join(root,'index.html'),'utf8');
let changed=0;
for(const [kind,folder] of [['blog','staffblog'],['event','eventinfo']]){
 const file=path.join(root,folder,'latest-cards.inc');
 if(fs.existsSync(file)&&!fs.readFileSync(file,'utf8').includes('data-ainos-seed="1"'))continue;
 const cards=[...home.matchAll(new RegExp('<a\\b[^>]*data-news-category="'+kind+'"[^>]*>[\\s\\S]*?<\\/a>','g'))].map(m=>m[0]);
 if(!cards.length)continue; // SSI activation has already replaced the inline slots.
 const output=`<div data-ainos-feed="${kind}" data-ainos-seed="1">\n${cards.join('\n')}\n</div>\n`;
 if(!fs.existsSync(file)||fs.readFileSync(file,'utf8')!==output){fs.writeFileSync(file,output);changed++;}
}
console.log(`Refreshed ${changed} static homepage feed seeds; CMS-owned fragments preserved.`);
