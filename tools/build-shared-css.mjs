import fs from 'node:fs';
import path from 'node:path';
import {transform} from 'lightningcss';

const project=path.resolve(import.meta.dirname,'..');
const root=process.argv[2]?path.resolve(process.argv[2]):project;
if(root!==project&&root!==path.join(project,'dist'))throw Error('Unsupported CSS output');
const files=JSON.parse(fs.readFileSync(path.join(project,'stylesheet/source/order.json'),'utf8'));
const css=files.map(file=>fs.readFileSync(path.join(project,'stylesheet/source',file),'utf8').trimEnd()).join('\n\n')+'\n';
transform({filename:'fujisou-ainos.css',code:Buffer.from(css)});
const target=path.join(root,'stylesheet/fujisou-ainos.css');
if(!fs.existsSync(target)||fs.readFileSync(target,'utf8')!==css)fs.writeFileSync(target,css);
console.log(`Shared CSS assembled from ${files.length} ordered source files.`);
