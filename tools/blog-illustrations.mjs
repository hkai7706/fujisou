import fs from 'node:fs';
import { graphicImage, graphicItems } from './blog-typography.mjs';
const overview=JSON.parse(fs.readFileSync('staffblog/visuals.json','utf8'));
const sections=JSON.parse(fs.readFileSync('staffblog/section-visuals.json','utf8'));
const escape=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
function render(file,v,index){
 const asset=graphicImage(file,v,index),items=graphicItems(v);
 return `<figure class="blog-story blog-story--typography"><div class="blog-story__image"><img src="${asset.src}" alt="${escape(v.title+'。'+items.map(([,title])=>title).join('、'))}" width="${asset.width}" height="${asset.height}" loading="lazy" decoding="async"></div><figcaption><dl class="blog-type-points--${items.length}">${items.map(([,title,text])=>`<div><dt>${escape(title)}</dt><dd>${escape(text)}</dd></div>`).join('')}</dl>${v.note?`<p class="blog-story__note">${escape(v.note)}</p>`:''}</figcaption></figure>`;
}
export const renderBlogGraphic=file=>overview[file]?render(file,overview[file],0):'';
export function addSectionGraphics(file,body){for(const [index,v] of (sections[file]||[]).entries()){let matched=false;body=body.replace(/<h([23])\b[^>]*>[\s\S]*?<\/h\1>/g,tag=>{if(!matched&&tag.replace(/<[^>]*>/g,'').includes(v.anchor)){matched=true;return tag+render(file,v,index+1);}return tag;});if(!matched)throw new Error(`Graphic anchor missing: ${file} ${v.anchor}`);}return body;}
