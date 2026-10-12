import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
const directory = process.argv[2];
if (!directory) throw new Error('Supply the original house photo directory.');
const selections = [
  ['DJI_20260928181107_0224_D.JPG', 'kitchen-living', '対面キッチンと木の収納、漆喰の壁がつながる室内'],
  ['DJI_20260928181037_0222_D.JPG', 'living-room', 'キッチンからつながるリビングと木の床'],
  ['DJI_20260928180949_0218_D.JPG', 'wood-closet', '木で仕上げた収納の内部'],
  ['DJI_20260928181557_0252_D.JPG', 'plaster-counter', '漆喰の壁と木のカウンター収納'],
  ['DJI_20260928180821_0214_D.JPG', 'plaster-room', '漆喰の壁と木の床がある居室'],
  ['DJI_20260928183119_0289_D.JPG', 'staircase', '漆喰の壁に囲まれた木の階段'],
];
const output='img/eventinfo/tonami-house';fs.mkdirSync(output,{recursive:true});
const photos=[];
for(const [filename,slug,alt] of selections){
 const input=path.join(directory,filename);const meta=await sharp(input).metadata();const variants=[];
 for(const width of [768,1600,meta.width]){
   const file=`${output}/${slug}-${width}.webp`;
   // Lossless encoding of each resized image; no retouching or invented details.
   await sharp(input).rotate().resize({width,withoutEnlargement:true}).webp({lossless:true,effort:4}).toFile(file);
   const info=await sharp(file).metadata();variants.push({file,width:info.width,height:info.height});
 }
 photos.push({filename,slug,alt,variants});
}
fs.writeFileSync('eventinfo/open-house/photos.json',JSON.stringify(photos,null,2)+'\n');
console.log(`Prepared ${photos.length} original house photographs with responsive versions.`);
