import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const project=path.resolve(import.meta.dirname,'..'),root=process.argv[2]?path.resolve(process.argv[2]):project;
if(root!==project&&root!==path.join(project,'dist'))throw Error('Unsupported tracker output');
const skip=new Set(['.git','node_modules','docs','tools','source','include','dist','tmp','backup','output','originals','mailformpro','mfp.statics','iplogs','analytics-service','analytics-portal','analytics-service-dist','analytics-portal-dist']);
const hash=file=>crypto.createHash('sha256').update(fs.readFileSync(path.join(project,file))).digest('hex').slice(0,10);
let changed=0;
function walk(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
 if(skip.has(entry.name)||entry.isSymbolicLink())continue;
 const file=path.join(dir,entry.name);if(entry.isDirectory()){walk(file);continue;}
 if(!/\.(html|shtml)$/.test(file))continue;
 const original=fs.readFileSync(file,'utf8');if(!original.includes('data-shared-header')||original.includes('data-gallery-redirect'))continue;
 let html=original.replace(/<script\b[^>]*data-analytics-loader[^>]*><\/script>/g,'');
 const relative=path.relative(path.dirname(file),root).replaceAll('\\','/'),prefix=relative?relative+'/':'./';
 const scripts=['analytics-config.js','analytics.js'].map(name=>`<script src="${prefix}script/${name}?v=${hash('script/'+name)}" data-analytics-loader defer></script>`).join('');
 html=html.replace('</head>',scripts+'</head>');if(html!==original){fs.writeFileSync(file,html);changed++;}
}}
walk(root);console.log(`Analytics loader refreshed in ${changed} public pages (disabled until an endpoint is configured).`);
