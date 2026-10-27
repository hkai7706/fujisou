import fs from 'node:fs';
import path from 'node:path';
import {ConsultationBanner,banners} from '../include/consultation-banners.mjs';

const project=path.resolve(import.meta.dirname,'..');
const root=process.argv[2]?path.resolve(process.argv[2]):project;
if(root!==project&&root!==path.join(project,'dist'))throw Error('Unsupported consultation banner output');
const file=path.join(root,'index.html');
let html=fs.readFileSync(file,'utf8');
for(const [index,banner] of banners.entries()){
 const number=String(index+1).padStart(2,'0');
 const pattern=new RegExp(`<!-- BEGIN CONSULTATION BANNER ${number} -->[\\s\\S]*?<!-- END CONSULTATION BANNER ${number} -->`);
 if(!pattern.test(html))throw Error(`Missing consultation banner ${number} marker`);
 html=html.replace(pattern,`<!-- BEGIN CONSULTATION BANNER ${number} -->${ConsultationBanner(banner)}<!-- END CONSULTATION BANNER ${number} -->`);
}
fs.writeFileSync(file,html);
console.log('Approved consultation banners regenerated from shared configuration.');
