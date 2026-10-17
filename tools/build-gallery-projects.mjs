import fs from 'node:fs';
import crypto from 'node:crypto';
import {renderProjectFacts} from './project-facts.mjs';
const projects=JSON.parse(fs.readFileSync('gallery/projects.json','utf8'));
const listingTemplate=fs.readFileSync('gallery/index.html','utf8');
const detailTemplate=fs.readFileSync('gallery/post-32.shtml','utf8');
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const plain=s=>s.replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();
const version=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex').slice(0,10);
const enhancements=fs.existsSync('gallery/image-enhancements.json')?JSON.parse(fs.readFileSync('gallery/image-enhancements.json','utf8')).images:{};
const sourceUpgrades=fs.existsSync('gallery/image-source-upgrades.json')?JSON.parse(fs.readFileSync('gallery/image-source-upgrades.json','utf8')).images:{};
const originalAssets=new Map(projects.flatMap(p=>[...p.photos,p.thumbnail]).map(image=>[image.file,image]));
const bestSource=image=>originalAssets.get(sourceUpgrades[image.file])||image;
function variants(image){
  if(enhancements[image.file])return enhancements[image.file].variants;
  const all=image.variants.map(v=>({...v,bytes:fs.statSync(v.file).size}));
  // When the original is already small, use whichever identical-size file is lighter.
  if(image.width<=1280){const original={file:image.file,width:image.width,height:image.height,bytes:fs.statSync(image.file).size};if(!all.length||original.bytes<=Math.max(...all.map(v=>v.bytes)))return[original];}
  return all;
}
function picture(image,alt,{eager=false,cover=false,thumbnail=false}={}){image=bestSource(image);const candidates=variants(image);if(cover&&image.width>candidates.at(-1).width)candidates.push({file:image.file,width:image.width,height:image.height});const largest=candidates.at(-1);return `<img src="../${largest.file}" srcset="${candidates.map(v=>`../${v.file} ${v.width}w`).join(', ')}" sizes="${thumbnail?'(max-width:600px) calc(100vw - 80px), 360px':cover?'(max-width:600px) calc(100vw - 40px), 1120px':'(max-width:600px) calc(100vw - 40px), 570px'}" alt="${esc(alt)}" width="${image.width}" height="${image.height}" ${eager?'fetchpriority="high"':'loading="lazy"'} decoding="async">`;}
const photoLink=(photo,caption,options)=>{photo=bestSource(photo);const enhanced=enhancements[photo.file];const full=enhanced&&enhanced.full.width>photo.width?enhanced.full.file:photo.file;return `<a class="project-photo-link" href="../${full}" data-project-photo data-caption="${esc(caption)}" aria-label="${esc(caption)}を拡大する">${picture(photo,caption,options)}</a>`;};
const photoCaption=(photo,p)=>photo.caption||(/\.(?:jpe?g|png|webp)$/i.test(photo.alt)?'':photo.alt)||`${p.title}の写真`;
const titleBreaks={
  'post-30.shtml':['木の香りと暮らす','癒しの畳コーナのある家'],
  'post-27.shtml':['コンパクトに','十分な暮らしを叶えた家'],
  'post-23.shtml':['将来の安心と安全を考えた','「平屋」の家'],
  'post-19.shtml':['コンパクトなゆとり空間','平家建のおうち'],
  'post-18.shtml':['ガレージのある','アウトドア好きのおうち'],
  '50-1.shtml':['築50年住宅を','"1軒まるごと" リフォームした家'],
  'post-28.shtml':['自分たちらしく','満足した日常を過ごす家'],
  'post-21.shtml':['光と風が通り抜ける','「中庭」のある平屋'],
  'post-13.shtml':['あそぶ空間 まなぶ空間','いやされる空間'],
  '2.shtml':['夫婦2人だけで','のんびり暮らせるお家'],
  'post-10.shtml':['アンティークでかわいい','自然素材のお家'],
  'post-7.shtml':['子どもも猫ものびのびと','遊べるおうち'],
  'post-5.shtml':['自然の中で暮らしているような','おうち'],
  'post-4.shtml':['家族が集い、','ゆったりと過ごすことができるおうち'],
  'post-2.shtml':['広々とした空間作りで','こだわりいっぱいのおうち'],
  'post-1.shtml':['自然素材で赤ちゃんにも','安心なおうち'],
  'post.shtml':['家事も楽々！','回遊性のある間取りのおうち']
};
function headline(p){
  const separator=p.title.match(/\s*[—｜~]\s*/);
  if(separator){const [title,subtitle]=p.title.split(separator[0]);return `<span>${esc(title)}</span><small>${subtitle.split(/(?<=、)/).map(part=>`<span>${esc(part)}</span>`).join('')}</small>`;}
  const parts=titleBreaks[p.file];return parts?parts.map(part=>`<span class="project-title-phrase">${esc(part)}</span>`).join(''):esc(p.title);
}
function setMeta(template,{title,description,canonical,image}){let html=template.replace(/<title>[\s\S]*?<\/title>/,`<title>${esc(title)}</title>`).replace(/<meta name="description"[^>]*>/,`<meta name="description" content="${esc(description)}">`).replace(/<link rel="canonical"[^>]*>/,`<link rel="canonical" href="${esc(canonical)}">`).replace(/<meta property="og:[^"]*"[^>]*>/g,'').replace(/<link rel="(?:next|prev)"[^>]*>/g,'');return html.replace('</head>',`<meta property="og:type" content="article"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:url" content="${esc(canonical)}"><meta property="og:image" content="${esc(image)}"></head>`);}
for(const [index,p]of projects.entries()){
  const cover=p.photos[0],description=plain(p.description)||`${p.area}の施工事例「${p.title}」。外観と室内の写真をご覧いただけます。`;
  const neighbours=[projects[(index+projects.length-1)%projects.length],projects[(index+1)%projects.length]];
  const originalCopy=p.description.replace(/<h1\b/gi,'<h2').replace(/<\/h1>/gi,'</h2>').replace(/<(p|h[2-6])([^>]*)>\s*(?:<br\s*\/?\s*>\s*)+/gi,'<$1$2>').replace(/(?:<br\s*\/?\s*>\s*)+(<\/(?:p|h[2-6])>)/gi,'$1').replace(/<(p|h[2-6])[^>]*>([\s\S]*?)<\/\1>/gi,(all,tag,body)=>plain(body)?all:'').replace(/href="([^"]+)"/gi,(all,value)=>{
    if(/^(?:#|tel:|mailto:)/.test(value))return all;
    if(/^javascript:/i.test(value))return '';
    const url=new URL(value.replaceAll('&amp;','&'),p.source);
    const related=projects.find(item=>new URL(item.source).pathname===url.pathname);
    if(related)return `href="${related.file}${url.hash}"`;
    const asset=p.photos.find(item=>new URL(item.source).pathname===url.pathname);
    if(asset)return `href="../${asset.file}"`;
    if(url.pathname==='/')return 'href="../index.html"';
    if(/^\/(?:contact|consultation|concept|staff|shikkui)\/?$/.test(url.pathname))return `href="..${url.pathname.replace(/\/$/,'')}/index.html"`;
    return `href="${esc(url.href)}"`;
  });
  const main=`<main id="main" class="gallery-project"><nav class="site-breadcrumbs" aria-label="パンくずリスト"><ol><li><a href="../index.html">ホーム</a></li><li> / <a href="index.html">施工事例</a></li><li> / <span aria-current="page">${esc(p.title)}</span></li></ol></nav>
  <section class="project-masthead"><p>${esc(p.area)} / 施工事例</p><h1>${headline(p)}</h1><a href="#project-photos">住まいの写真を見る <span aria-hidden="true">↓</span></a></section>
  <section class="project-cover-photo"><figure>${photoLink(cover,photoCaption(cover,p),{eager:true,cover:true})}${cover.caption?`<figcaption>${esc(cover.caption)}</figcaption>`:''}</figure></section>
  ${renderProjectFacts(p)}
  ${originalCopy?`<section class="project-original-copy" aria-label="この住まいについて">${originalCopy}</section>`:''}
  <div class="project-photo-story" id="project-photos" aria-label="${esc(p.title)}の写真一覧">${p.photos.slice(1).map((photo,i)=>{const portrait=photo.height>photo.width,wide=!portrait&&i%5===4;const caption=photoCaption(photo,p);return `<figure class="${portrait?'project-photo--portrait':wide?'project-photo--wide':''}">${photoLink(photo,caption,{cover:wide})}${photo.caption?`<figcaption>${esc(photo.caption)}</figcaption>`:''}<span class="project-photo-hint">写真を大きく見る <span aria-hidden="true">↗</span></span></figure>`;}).join('')}</div>
  <section class="project-neighbours"><h2>ほかの住まいも見る</h2><nav aria-label="前後の施工事例">${neighbours.map(n=>`<a href="${esc(n.file)}">${picture(n.thumbnail,n.title,{thumbnail:true})}<div><small>${esc(n.area)}</small><p>${esc(n.title)} <span aria-hidden="true">→</span></p></div></a>`).join('')}</nav></section>
  <section class="project-consultation"><div><h2>気になる住まいを、相談のきっかけに。</h2><p>素材や間取り、お好みの雰囲気をお聞かせください。</p></div><div><a href="../consultation/index.html">家づくり無料相談 <span aria-hidden="true">→</span></a><a href="index.html">施工事例一覧に戻る <span aria-hidden="true">→</span></a></div></section>
  <dialog class="work-image-dialog" aria-label="施工事例の写真を拡大"><div class="work-image-dialog__controls"><button type="button" data-photo-prev aria-label="前の写真">←</button><span class="work-image-dialog__count"></span><button type="button" data-photo-next aria-label="次の写真">→</button><button type="button" class="work-image-dialog__close">閉じる ×</button></div><img alt="" width="1600" height="1000"><p></p></dialog></main>`;
  const socialPhoto=bestSource(cover),socialImage=enhancements[socialPhoto.file]?.full.file||socialPhoto.file;
  let html=setMeta(detailTemplate,{title:`${p.title}｜${p.area}の施工事例｜フジ創アイノス`,description:description.slice(0,180),canonical:p.source,image:'https://www.fujisou-ainos.com/'+socialImage});
  html=html.replace(/<main\b[\s\S]*?<\/main>/,main).replace(/<body[^>]*>/,'<body class="gallery-project-page">').replace(/<link[^>]*href="[^\"]*(?:project-detail|gallery-project)\.css[^\"]*"[^>]*>/g,'').replace(/<script[^>]*src="[^\"]*gallery-project\.js[^\"]*"[^>]*><\/script>/g,'');
  html=html.replace('</head>',`<link rel="stylesheet" href="../stylesheet/gallery-project.css?v=${version('stylesheet/gallery-project.css')}"><script src="../script/gallery-project.js?v=${version('script/gallery-project.js')}" defer></script></head>`);
  fs.writeFileSync('gallery/'+p.file,html);
}
const perPage=14,totalPages=Math.ceil(projects.length/perPage);
for(let page=1;page<=totalPages;page++){
  const filename=page===1?'index.html':`page-${page}.html`,rows=projects.slice((page-1)*perPage,page*perPage);
  const cards=rows.map(p=>`<article class="work-card"><a href="${esc(p.file)}"><figure>${picture(p.thumbnail,p.title,{thumbnail:true})}</figure><div class="work-card__text"><p><span>${esc(p.area)}</span></p><h2>${esc(p.title)}</h2><b>詳しく見る <i>→</i></b></div></a></article>`).join('\n');
  const url=n=>n===1?'index.html':`page-${n}.html`;
  const pagination=`<nav class="gallery-pagination" aria-label="施工事例のページ切り替え">${page>1?`<a href="${url(page-1)}">← 前のページ</a>`:'<span></span>'}<div class="gallery-pagination__numbers">${Array.from({length:totalPages},(_,i)=>`<a href="${url(i+1)}" ${i+1===page?'aria-current="page"':''}>${i+1}</a>`).join('')}</div>${page<totalPages?`<a href="${url(page+1)}">次のページ →</a>`:'<span></span>'}</nav>`;
  let html=listingTemplate.replace(/<section class="gallery-works"[^>]*>[\s\S]*?<\/section>/,`<section class="gallery-works" aria-label="施工事例一覧">${cards}</section>`).replace(/<nav class="gallery-pagination"[\s\S]*?<\/nav>/,pagination).replace(/<body[^>]*>/,`<body class="gallery-page${page>1?' gallery-page--'+page:''}">`).replace(/<figure class="gallery-hero__visual">[\s\S]*?<\/figure>/,'').replace(/<main>/,'<main id="main">');
  html=html.replace(/<link rel="(?:next|prev)"[^>]*>/g,'').replace(/<link rel="canonical"[^>]*>/,`<link rel="canonical" href="https://www.fujisou-ainos.com/gallery/${page===1?'':`index_${page}.shtml`}">`);
  if(page>1)html=html.replace(/<title>[\s\S]*?<\/title>/,`<title>施工事例 ${page}ページ目｜フジ創アイノス</title>`);
  const socialThumbnail=bestSource(rows[0].thumbnail),socialImage=enhancements[socialThumbnail.file]?.full.file||socialThumbnail.file;
  html=html.replace(/<meta property="og:image"[^>]*>/,`<meta property="og:image" content="https://www.fujisou-ainos.com/${socialImage}">`);
  html=html.replace(/<link rel="stylesheet" href="[^\"]*gallery\.css[^\"]*">/,`<link rel="stylesheet" href="../stylesheet/gallery.css?v=${version('stylesheet/gallery.css')}">`);
  fs.writeFileSync('gallery/'+filename,html);
}
console.log(`Built ${projects.length} gallery details and ${totalPages} listing pages with local project links.`);
