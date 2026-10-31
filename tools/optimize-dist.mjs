import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import {replaceAssetReference} from './deploy-url.mjs';

const root=path.resolve(import.meta.dirname,'../dist');
if(fs.realpathSync(root)!==root)throw Error('dist must be a real project directory');
const files=[];
function walk(dir){for(const item of fs.readdirSync(dir,{withFileTypes:true})){if(item.isSymbolicLink())throw Error('Symlink in deployment');const file=path.join(dir,item.name);if(item.isDirectory())walk(file);else files.push(file);}}
walk(root);
const bytes=()=>files.filter(file=>fs.existsSync(file)).reduce((sum,file)=>sum+fs.statSync(file).size,0);
const before=bytes(),converted=new Map();let saved=0,compressed=0;
function writeImage(file,buffer){const temporary=file+'.optimize-tmp';fs.writeFileSync(temporary,buffer);fs.renameSync(temporary,file);}
const pictures=files.filter(file=>/\.(png|avif|gif|webp|jpe?g)$/i.test(file)&&!file.endsWith('.deploy.webp'));
sharp.concurrency(1);
// Release libvips' cached file handles before replacing an image on Windows.
sharp.cache(false);
let cursor=0;
async function worker(){while(cursor<pictures.length){
 const file=pictures[cursor++],extension=path.extname(file).toLowerCase(),size=fs.statSync(file).size;
 const convert=/\.(png|avif|gif)$/.test(extension);
 const normalize=/%[a-f\d]{2}/i.test(path.basename(file));
 if(!convert&&!normalize&&size<150000)continue;
 const decoded=normalize?decodeURIComponent(path.basename(file)):path.basename(file);
 if(decoded.includes('/')||decoded.includes('\\'))throw Error('Encoded path separator in image');
 const normalized=path.join(path.dirname(file),decoded);
 const target=convert?normalized.replace(/\.[^.]+$/,'.deploy.webp'):normalized;
 const input=sharp(fs.readFileSync(file),{animated:extension==='.gif',limitInputPixels:268402689});
 const output=await (/\.jpe?g$/.test(extension)?input.jpeg({quality:82,mozjpeg:true}):input.webp({quality:82,alphaQuality:100,effort:4})).toBuffer().catch(error=>{throw Error(`${path.relative(root,file)}: ${error.message}`);});
 if(convert||normalize){writeImage(target,output);converted.set(file,target);}
 else if(output.length<size*.92){writeImage(file,output);saved+=size-output.length;compressed++;}
 if(cursor%200===0)console.log(`Optimizing images: ${cursor}/${pictures.length}`);
}}
await Promise.all(Array.from({length:4},worker));

// Rewrite references before removing old formats. Include OG/schema URLs,
// responsive candidates, CSS URLs and the carousel's deferred image attributes.
const replacements=[...converted].map(([old,next])=>[path.relative(root,old).replaceAll('\\','/'),path.relative(root,next).replaceAll('\\','/')]);
for(const file of files.filter(file=>/\.(?:html|shtml|inc|css|js|mjs|json|xml|txt)$/i.test(file))){
 let text=fs.readFileSync(file,'utf8'),original=text;
 for(const [old,next] of replacements){
  const oldFile=path.join(root,old),nextFile=path.join(root,next);
  const relativeOld=path.relative(path.dirname(file),oldFile).replaceAll('\\','/'),relativeNext=path.relative(path.dirname(file),nextFile).replaceAll('\\','/');
  for(const [from,to] of [[old,next],[relativeOld,relativeNext],[encodeURI(old),encodeURI(next)],[encodeURI(relativeOld),encodeURI(relativeNext)]])text=replaceAssetReference(text,from,to);
 }
 text=text.replace(/(<link\b[^>]*href=["'][^"']+\.deploy\.webp["'][^>]*type=["'])image\/(?:png|avif|gif)(["'])/g,'$1image/webp$2');
 if(text!==original)fs.writeFileSync(file,text);
}
for(const [old] of converted){if(!fs.realpathSync(old).startsWith(root+path.sep))throw Error('Removal escaped dist');fs.unlinkSync(old);}

// Keep every published page, feed, download and required server file. Follow
// referenced runtime assets instead of shipping source configuration/modules.
const current=[...new Set(files.filter(file=>fs.existsSync(file)).concat([...converted.values()]))];
const byRelative=new Map(current.map(file=>[path.relative(root,file).replaceAll('\\','/'),file]));
const byName=new Map();for(const file of current){const name=path.basename(file);if(!byName.has(name))byName.set(name,[]);byName.get(name).push(file);}
const keep=new Set(),queue=[];
function add(file){if(file&&fs.existsSync(file)&&!keep.has(file)){keep.add(file);queue.push(file);}}
for(const file of current)if(/\.(?:html|shtml|inc|pdf|xml|txt)$/i.test(file)||path.basename(file)==='.htaccess'||file.includes(path.sep+'mailformpro'+path.sep)||file.includes(path.sep+'mfp.statics'+path.sep))add(file);
// Original public downloads may be reached from search results or external
// bookmarks even when no current page links to them. They are compatibility
// assets, not unused files, so retain them through deployment pruning.
for(const manifest of ['original-downloads.json','original-image-downloads.json']){
 const records=JSON.parse(fs.readFileSync(path.resolve(root,'../docs',manifest),'utf8'));
 for(const record of records){
  const deployed=record.file.replace(/\.(?:png|gif)$/i,'.deploy.webp');
  add(byRelative.get(record.file)||byRelative.get(deployed));
 }
}
function reference(file,value){
 value=value.replaceAll('&amp;','&');
 if(/^https?:/.test(value)){const url=new URL(value);if(url.hostname!=='www.fujisou-ainos.com'&&url.hostname!=='hkai7706.github.io')return;value=url.pathname.replace(/^\/fujisou\//,'/');}
 if(/^(?:data:|mailto:|tel:|#|\/\/)/.test(value))return;
 try{value=decodeURIComponent(value.split(/[?#]/)[0]);}catch{return;}
 for(const base of [path.dirname(file),root]){const target=path.resolve(base,value.replace(/^\//,''));if(!target.startsWith(root+path.sep))continue;add(byRelative.get(path.relative(root,target).replaceAll('\\','/')));}
 // JS may resolve a basename against the document URL rather than its script.
 if(/\.m?js$/.test(file)&&!value.includes('/'))for(const candidate of byName.get(value)||[])add(candidate);
}
while(queue.length){const file=queue.shift();if(!/\.(?:html|shtml|inc|css|js|mjs|json|xml|txt)$/i.test(file))continue;
 const text=fs.readFileSync(file,'utf8');
 for(const match of text.matchAll(/["']([^"'<>\r\n]+\.(?:avif|webp|jpe?g|png|gif|svg|ico|woff2?|ttf|otf|pdf|css|m?js|inc|json)(?:\?[^"'<>\s]*)?)["']/gi))reference(file,match[1]);
 for(const match of text.matchAll(/(?:srcset|imagesrcset|data-hero-srcset)=["']([^"']+)["']/g))for(const candidate of match[1].split(','))reference(file,candidate.trim().split(/\s+/)[0]);
 for(const match of text.matchAll(/url\(\s*["']?([^"')\s]+)["']?\s*\)/g))reference(file,match[1]);
}
let removed=0,removedBytes=0;for(const file of current){if(keep.has(file))continue;if(!fs.realpathSync(file).startsWith(root+path.sep))throw Error('Removal escaped dist');removedBytes+=fs.statSync(file).size;fs.unlinkSync(file);removed++;}
const remaining=current.filter(file=>fs.existsSync(file));
const after=remaining.reduce((sum,file)=>sum+fs.statSync(file).size,0);
const report={beforeMiB:+(before/1048576).toFixed(1),afterMiB:+(after/1048576).toFixed(1),converted:converted.size,recompressed:compressed,unusedFilesRemoved:removed,unusedMiBRemoved:+(removedBytes/1048576).toFixed(1),files:remaining.length};
fs.mkdirSync(path.resolve(root,'../tmp'),{recursive:true});fs.writeFileSync(path.resolve(root,'../tmp/dist-optimization.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
