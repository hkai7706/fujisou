import fs from 'node:fs';import path from 'node:path';import sharp from 'sharp';import crypto from 'node:crypto';
const projects=JSON.parse(fs.readFileSync('gallery/projects.json','utf8'));
const photos=[...new Map(projects.flatMap(p=>p.photos).map(p=>[p.file,p])).values()];
const images={};let before=0,after=0;fs.mkdirSync('img/gallery/viewers',{recursive:true});
for(const photo of photos){const source=fs.readFileSync(photo.file);if(source.length<2e6)continue;const name=crypto.createHash('sha256').update(source).digest('hex').slice(0,20),file=`img/gallery/viewers/${name}-2000.webp`;if(!fs.existsSync(file))await sharp(source).rotate().resize({width:2000,height:2000,fit:'inside',withoutEnlargement:true}).webp({quality:92,effort:5}).toFile(file);const info=await sharp(file).metadata();images[photo.file]={file,width:info.width,height:info.height,bytes:fs.statSync(file).size};before+=source.length;after+=images[photo.file].bytes;}
fs.writeFileSync('gallery/viewing-images.json',JSON.stringify({images},null,2)+'\n');console.log({images:Object.keys(images).length,before,after});
