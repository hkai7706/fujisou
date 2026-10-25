// Explicit font maintenance only; ordinary builds use committed local assets.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const root=path.resolve(import.meta.dirname,'..'),directory=path.join(root,'fonts');
fs.mkdirSync(directory,{recursive:true});
const ua='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36';
async function download(url){const response=await fetch(url,{headers:{'User-Agent':ua}});if(!response.ok)throw Error(`Font download failed: ${response.status} ${url}`);return Buffer.from(await response.arrayBuffer());}
const hannari=await download('https://raw.githubusercontent.com/google/fonts/main/ofl/hannari/Hannari-Regular.ttf');
fs.writeFileSync(path.join(directory,'hannari-regular.ttf'),hannari);
let output=`/* Self-hosted Google Fonts. Licenses and upstream sources: fonts/README.txt. */
@font-face {
  font-family: "Hannari Mincho";
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url('../fonts/hannari-regular.ttf') format('truetype');
}
`;
// A regular Japanese face matches Hannari and avoids downloading variable axes
// for every Japanese subset. Browsers can synthesize emphasis where requested.
for(const [family,name] of [['Noto+Serif+JP:wght@400','noto-serif-jp'],['Quattrocento:wght@400;700','quattrocento']]){
  let css=(await download('https://fonts.googleapis.com/css2?family='+family+'&display=swap')).toString();
  const urls=[...new Set([...css.matchAll(/https:\/\/fonts\.gstatic\.com\/[^)]+/g)].map(match=>match[0]))];
  const replacements=new Map();
  for(let start=0;start<urls.length;start+=6){await Promise.all(urls.slice(start,start+6).map(async url=>{
    const filename=name+'-'+crypto.createHash('sha256').update(url).digest('hex').slice(0,12)+'.woff2';
    fs.writeFileSync(path.join(directory,filename),await download(url));replacements.set(url,'../fonts/'+filename);
  }));}
  for(const [url,local] of replacements)css=css.replaceAll(url,local);
  output+=css+'\n';
}
for(const family of ['hannari','notoserifjp','quattrocento']){
  const license=(await download('https://raw.githubusercontent.com/google/fonts/main/ofl/'+family+'/OFL.txt')).toString().replace(/[\t ]+$/gm,'');
  fs.writeFileSync(path.join(directory,family+'-OFL.txt'),license);
}
fs.writeFileSync(path.join(root,'stylesheet/source/00-webfonts.css'),output.trimEnd()+'\n');
for(const file of fs.readdirSync(directory)){
  if(/^(?:noto-serif-jp|quattrocento)-[a-f0-9]{12}\.woff2$/.test(file)&&!output.includes('../fonts/'+file))fs.unlinkSync(path.join(directory,file));
}
fs.writeFileSync(path.join(directory,'README.txt'),`Self-hosted fonts; browser requests stay on the website's own origin.
Hannari: https://github.com/google/fonts/tree/main/ofl/hannari
Noto Serif JP: https://github.com/google/fonts/tree/main/ofl/notoserifjp
Quattrocento: https://github.com/google/fonts/tree/main/ofl/quattrocento
Each family includes its SIL Open Font License in this directory.
The Google Fonts Hannari release provides kana; Noto Serif JP supplies kanji
and other glyphs it lacks. Noto's unicode-range subsets load only when needed.
Run node tools/fetch-site-fonts.mjs only to deliberately update the font assets.
`);
console.log('Local font assets, licenses and CSS prepared.');
