import fs from 'node:fs';
import crypto from 'node:crypto';
import subsetFont from 'subset-font';
const revision='6157dfaa640ca5738b4d1a7070fe389c3036d7fc';
export async function buildHomeFonts(html){
 const text=html.replace(/<(script|style)\b[\s\S]*?<\/\1>/gi,'').replace(/<!--[\s\S]*?-->/g,'').replace(/<[^>]*>/g,'').replace(/&(?:amp|quot|lt|gt|nbsp);/g,s=>({'&amp;':'&','&quot;':'"','&lt;':'<','&gt;':'>','&nbsp;':' '})[s]).replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(Number(n)));
 const characters=[...new Set(text+Array.from({length:95},(_,i)=>String.fromCharCode(i+32)).join(''))].sort().join('');
 const key=crypto.createHash('sha256').update(revision+characters).digest('hex').slice(0,12);
 const noto=`fonts/home-noto-${key}.woff2`,hannari='fonts/hannari-regular.woff2';
 if(!fs.existsSync(hannari))fs.writeFileSync(hannari,await subsetFont(fs.readFileSync('fonts/hannari-regular.ttf'),undefined,{targetFormat:'woff2',keepAllGlyphs:true}));
 if(!fs.existsSync(noto)){
  const cache=`${import.meta.dirname}/../tmp/font-sources`;fs.mkdirSync(cache,{recursive:true});
  const file=cache+'/NotoSerifJP-'+revision+'.ttf';
  if(!fs.existsSync(file)){
   const response=await fetch(`https://raw.githubusercontent.com/google/fonts/${revision}/ofl/notoserifjp/NotoSerifJP%5Bwght%5D.ttf`);
   if(!response.ok)throw Error('Font source download failed: '+response.status);
   fs.writeFileSync(file,Buffer.from(await response.arrayBuffer()));
  }
  fs.writeFileSync(noto,await subsetFont(fs.readFileSync(file),characters,{targetFormat:'woff2',variationAxes:{wght:400}}));
 }
 const css=`@font-face{font-family:"Hannari Mincho";font-style:normal;font-weight:400;font-display:swap;src:url('../${hannari}') format('woff2')}\n@font-face{font-family:"Noto Serif JP";font-style:normal;font-weight:400;font-display:swap;src:url('../${noto}') format('woff2')}\n`;
 // Future MT titles can request missing characters without reloading the whole
 // original font family for characters already covered by the homepage subset.
 const original=fs.readFileSync(new URL('../stylesheet/source/00-webfonts.css',import.meta.url),'utf8');
 fs.writeFileSync('stylesheet/post-font-fallback.css',original.replaceAll("'Noto Serif JP'","'Noto Serif JP Fallback'").replaceAll('"Noto Serif JP"','"Noto Serif JP Fallback"').replace(/@font-face\s*\{[^}]*font-family:\s*"Hannari Mincho"[^}]*\}/g,''));
 return {css,characters,noto,hannari};
}
