import fs from 'node:fs';
import crypto from 'node:crypto';
import sharp from 'sharp';

const projects=JSON.parse(fs.readFileSync('gallery/projects.json','utf8'));
const images=[...new Map(projects.flatMap(p=>[...p.photos,p.thumbnail]).map(image=>[image.file,image])).values()];
const output='img/gallery/projects/enhanced';
fs.mkdirSync(output,{recursive:true});
const manifestFile='gallery/image-enhancements.json';
const manifest=fs.existsSync(manifestFile)?JSON.parse(fs.readFileSync(manifestFile,'utf8')):{method:'Lanczos3 resizing and gentle edge sharpening; lossless WebP encoding',images:{}};
const byHash=new Map();let cursor=0,done=0;
async function worker(){while(cursor<images.length){const image=images[cursor++];
  const bytes=fs.readFileSync(image.file),sha256=crypto.createHash('sha256').update(bytes).digest('hex');
  const existing=manifest.images[image.file];
  if(existing?.sourceSHA256===sha256&&existing.variants.every(v=>fs.existsSync(v.file))){done++;continue;}
  if(!byHash.has(sha256))byHash.set(sha256,(async()=>{
    const metadata=await sharp(bytes).metadata();
    const width=metadata.autoOrient?.width||metadata.width;
    // Small originals grow by at most 3×; large originals remain available untouched.
    const target=width<1800?Math.min(1800,Math.max(1280,width*2),width*3):Math.min(2200,width);
    const sizes=[...new Set([Math.min(640,target),Math.min(1280,target),target])];
    const variants=[];
    for(const size of sizes){const file=`${output}/${sha256.slice(0,20)}-${size}.webp`;
      if(!fs.existsSync(file))await sharp(bytes).rotate().resize({width:size,kernel:sharp.kernel.lanczos3}).sharpen({sigma:0.5,m1:0.45,m2:0.85}).webp({lossless:true,effort:3}).toFile(file);
      const m=await sharp(file).metadata();variants.push({file,width:m.width,height:m.height,bytes:fs.statSync(file).size});
    }
    return{sourceSHA256:sha256,sourceWidth:width,variants,full:variants.at(-1)};
  })());
  manifest.images[image.file]=await byHash.get(sha256);done++;
  if(done%20===0){fs.writeFileSync(manifestFile,JSON.stringify(manifest,null,2)+'\n');console.log(`Enhanced ${done}/${images.length} gallery images.`);}
}}
await Promise.all(Array.from({length:3},worker));
fs.writeFileSync(manifestFile,JSON.stringify(manifest,null,2)+'\n');
console.log(`Prepared all ${images.length} gallery images. Originals unchanged.`);
