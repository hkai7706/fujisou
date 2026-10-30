import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

export function removeInquiries(source) {
  const count=(source.match(/<!-- SECTION INQUIRY -->/g)||[]).length;
  const html=source
    .replace(/\r?\n?<!-- SECTION INQUIRY -->[\s\S]*?<!-- END SECTION INQUIRY -->\r?\n?/g,'\n')
    .replace(/<link\b[^>]*data-section-inquiries[^>]*>\s*/g,'')
    .replace(/\n{3,}/g,'\n\n');
  return {html,count};
}

export function build(root) {
  const skip=new Set(['.git','node_modules','tools','docs','source','dist','backup','tmp','.tmp','output','cms','mailformpro','mfp.statics','iplogs','originals']);
  let pages=0,actions=0;
  function walk(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
    if(skip.has(entry.name))continue;
    const file=path.join(dir,entry.name);
    if(entry.isDirectory()){walk(file);continue;}
    if(!/\.(html|shtml)$/.test(entry.name))continue;
    const source=fs.readFileSync(file,'utf8'),result=removeInquiries(source);
    if(result.count){pages++;actions+=result.count;}
    if(source!==result.html)fs.writeFileSync(file,result.html);
  }}
  walk(root);
  console.log(`Removed ${actions} generated section inquiry actions from ${pages} pages.`);
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))build(path.resolve(process.argv[2]||path.join(import.meta.dirname,'..')));
