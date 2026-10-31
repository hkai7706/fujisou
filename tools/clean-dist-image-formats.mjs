import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import {replaceAssetReference} from './deploy-url.mjs';

const root=path.resolve(import.meta.dirname,'../dist');
if(!fs.existsSync(root)||fs.realpathSync(root)!==root)throw Error('dist must be a real project directory');
const files=[];
function walk(dir){for(const item of fs.readdirSync(dir,{withFileTypes:true})){if(item.isSymbolicLink())throw Error('Symlink in deployment');const file=path.join(dir,item.name);item.isDirectory()?walk(file):files.push(file);}}
walk(root);
const images=files.filter(file=>/\.(?:png|gif)$/i.test(file));
const replacements=[];
sharp.cache(false);
sharp.concurrency(1);

for(const [index,file] of images.entries()){
  if(!fs.realpathSync(file).startsWith(root+path.sep))throw Error('Image escaped dist');
  const relative=path.relative(root,file).replaceAll('\\','/');
  const target=file.replace(/\.(?:png|gif)$/i,'.deploy.webp');
  const extension=path.extname(file).toLowerCase();
  const image=sharp(fs.readFileSync(file),{animated:extension==='.gif',limitInputPixels:268402689});
  const buffer=await image.webp({quality:84,alphaQuality:100,effort:4}).toBuffer();
  const temporary=target+'.format-tmp';
  fs.writeFileSync(temporary,buffer);
  fs.renameSync(temporary,target);
  replacements.push([relative,path.relative(root,target).replaceAll('\\','/')]);
  if((index+1)%25===0)console.log(`Converted ${index+1}/${images.length}`);
}

const textFiles=files.filter(file=>/\.(?:html|shtml|inc|css|js|mjs|json|xml|txt)$/i.test(file));
for(const file of textFiles){
  let text=fs.readFileSync(file,'utf8'),original=text;
  for(const [old,next] of replacements){
    const oldFile=path.join(root,old),nextFile=path.join(root,next);
    const relativeOld=path.relative(path.dirname(file),oldFile).replaceAll('\\','/');
    const relativeNext=path.relative(path.dirname(file),nextFile).replaceAll('\\','/');
    for(const [from,to] of [[old,next],[relativeOld,relativeNext],[encodeURI(old),encodeURI(next)],[encodeURI(relativeOld),encodeURI(relativeNext)]])text=replaceAssetReference(text,from,to);
  }
  text=text.replace(/(<link\b[^>]*href=["'][^"']+\.deploy\.webp["'][^>]*type=["'])image\/(?:png|gif)(["'])/gi,'$1image/webp$2');
  if(text!==original)fs.writeFileSync(file,text);
}

for(const [old] of replacements){
  const file=path.join(root,old);
  if(!fs.realpathSync(file).startsWith(root+path.sep))throw Error('Removal escaped dist');
  fs.unlinkSync(file);
}

console.log(`Converted and removed ${replacements.length} PNG/GIF deployment assets.`);
