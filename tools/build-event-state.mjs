import fs from 'node:fs';
import path from 'node:path';
import {japanDate,renderEventState} from './event-state.mjs';

const project=path.resolve(import.meta.dirname,'..');
const root=process.argv[2]?path.resolve(process.argv[2]):project;
if(root!==project&&root!==path.join(project,'dist'))throw Error('Unsupported event output');
const skip=new Set(['analytics-portal','analytics-service','analytics-portal-dist','analytics-service-dist','.git','node_modules','docs','tools','include','dist','tmp','backup','output','originals','source','mailformpro','mfp.statics','iplogs']);
let count=0;const date=japanDate();
function walk(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
  if(skip.has(entry.name)||entry.isSymbolicLink())continue;
  const file=path.join(dir,entry.name);
  if(entry.isDirectory()){walk(file);continue;}
  if(!/\.(html|shtml)$/.test(file))continue;
  const original=fs.readFileSync(file,'utf8');
  if(!original.includes('data-event-end'))continue;
  const rendered=renderEventState(original,date);
  if(rendered!==original){fs.writeFileSync(file,rendered);count++;}
}}
walk(root);console.log(`Event state rendered for ${date} JST in ${count} pages.`);
