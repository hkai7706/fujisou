import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { renderBlogGraphic, addSectionGraphics } from './blog-illustrations.mjs';
const posts=JSON.parse(fs.readFileSync('staffblog/posts.json','utf8')).sort((a,b)=>b.date.localeCompare(a.date)||a.source.localeCompare(b.source));
const listingFile='staffblog/index.html';
let listing=fs.readFileSync(listingFile,'utf8');
const mainStart=listing.indexOf('<main');
const mainEnd=listing.indexOf('</main>')+7;
assert(mainStart>0&&mainEnd>mainStart);
const shellStart=listing.slice(0,mainStart).replace(/<link[^>]*href="[^\"]*blog-archive.css(?:\?[^\"]*)?"[^>]*>/g,'').replace(/<script[^>]*src="(?:search-index.js|\.\.\/script\/blog-archive.js)(?:\?[^\"]*)?"[^>]*><\/script>/g,'');
const shellEnd=listing.slice(mainEnd);
const decode=text=>text.replaceAll('&quot;','"').replaceAll('&amp;','&').replaceAll('&#39;',"'").replaceAll('&lt;','<').replaceAll('&gt;','>');
const plain=text=>decode(text.replace(/<[^>]*>/g,'').replace(/\s+/g,' ').trim());
const escape=text=>text.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
for(const [index,post] of posts.entries()){
  const bodyFile=path.join('staffblog/article-bodies',post.file.replace(/\.shtml$/,'.fragment'));
  const customBody=fs.existsSync(bodyFile);
  let body=customBody?fs.readFileSync(bodyFile,'utf8'):post.body;
  let headingNumber=0;
  const headings=[];
  body=body.replace(/<h([23])\b[^>]*>([\s\S]*?)<\/h\1>/g,(tag,level,title)=>{
    const label=plain(title);const id='article-section-'+(++headingNumber);
    if(label)headings.push({id,title:label});
    return `<h${level} id="${id}"><span>${title}</span></h${level}>`;
  });
  const description=plain(post.body).slice(0,150);
  const imageUrl=post.image?'https://www.fujisou-ainos.com/'+post.image.replace('../',''):'https://www.fujisou-ainos.com/img/ogp.jpg';
  let start=shellStart.replace(/<title>[\s\S]*?<\/title>/,`<title>${escape(decode(post.title))}｜社長のブログ｜フジ創アイノス</title>`)
    .replace(/<meta name="description"[^>]*>/,`<meta name="description" content="${escape(description)}">`)
    .replace(/<link rel="canonical"[^>]*>/,`<link rel="canonical" href="${escape(post.permalink||post.source)}">`);
  start=start.replace('class="blog-page"','class="blog-page blog-article-page"');
  start=start.replace('</head>','<link rel="stylesheet" href="../stylesheet/blog-body.css">\n</head>');
  const structured={'@context':'https://schema.org','@type':'BlogPosting',headline:decode(post.title),datePublished:post.date,image:imageUrl,author:{'@type':'Organization',name:'フジ創アイノス'},publisher:{'@type':'Organization',name:'有限会社フジ創'},mainEntityOfPage:post.permalink||post.source};
  start=start.replace('</head>',`<meta property="og:type" content="article"><meta property="og:title" content="${escape(decode(post.title))}"><meta property="og:description" content="${escape(description)}"><meta property="og:url" content="${escape(post.permalink||post.source)}"><meta property="og:image" content="${escape(imageUrl)}">\n<script type="application/ld+json">${JSON.stringify(structured).replaceAll('<','\\u003c')}</script>\n</head>`);
  if(!customBody){
    const graphic=renderBlogGraphic(post.file);
    const graphicAnchor=body.indexOf('<h2');
    body=graphicAnchor>=0?body.slice(0,graphicAnchor)+graphic+body.slice(graphicAnchor):graphic+body;
    body=addSectionGraphics(post.file,body);
  }
  const ctaFile=bodyFile.replace(/\.fragment$/,'-cta.fragment');
  const consultation=fs.existsSync(ctaFile)?fs.readFileSync(ctaFile,'utf8'):`<div><h2>家づくりについて、気になることから。</h2><p>暮らし方や土地、ご予算について、お気軽にご相談ください。</p></div><ul><li><a href="../contact/index.html">お問い合わせ<span aria-hidden="true">→</span></a></li><li><a href="tel:08002002661">0800-200-2661<span>電話で相談</span></a></li></ul>`;
  const navigation=(neighbor,label)=>neighbor?`<a href="${escape(neighbor.file)}">${neighbor.image?`<img src="${escape(neighbor.image)}" alt="" width="${neighbor.imageWidth}" height="${neighbor.imageHeight}" loading="lazy" decoding="async">`:''}<div><small>${label} <b aria-hidden="true">↗</b></small><span>${escape(decode(neighbor.title))}</span></div></a>`:'<div></div>';
  const main=`<main id="main">
<nav class="site-breadcrumbs" aria-label="パンくずリスト"><ol><li><a href="../index.html">ホーム</a></li><li aria-hidden="true">/</li><li><a href="index.html">社長のブログ</a></li><li aria-hidden="true">/</li><li><span aria-current="page">記事</span></li></ol></nav>
<article class="blog-entry">
<div class="blog-entry__opening${post.image?'':' blog-entry__opening--text'}"><header class="blog-entry__header"><p class="blog-eyebrow">社長のブログ</p><div class="blog-meta"><time datetime="${post.date}">${post.date.replaceAll('-','.')}</time><span>${escape(post.category)}</span></div><h1>${escape(decode(post.title))}</h1><a class="blog-entry__read-link" href="#article-reading">本文を読む <span aria-hidden="true">↓</span></a></header>
${post.image?`<figure class="blog-entry__visual"><img src="${escape(post.image)}" alt="${escape(decode(post.title))}" width="${post.imageWidth}" height="${post.imageHeight}" fetchpriority="high" decoding="async"></figure>`:''}</div>
<div class="blog-entry__reading" id="article-reading"><div class="blog-entry__content">${body}</div></div>
<section class="blog-entry__consultation">${consultation}</section>
<nav class="blog-entry__navigation" aria-label="前後の記事">${navigation(posts[index+1],'前の記事')}${navigation(posts[index-1],'次の記事')}</nav>
<div class="blog-entry__closing"><a class="blog-back" href="index.html">← 社長のブログ一覧へ</a><a href="../contact/index.html">家づくりについて相談する →</a></div>
</article></main>`;
  fs.writeFileSync(path.join('staffblog',post.file),start+main+shellEnd);
}
// The archive builder creates paginated listings after all articles are rendered.
for(const file of ['index.html','server/index.html']){
  let html=fs.readFileSync(file,'utf8');
  const prefix=file.startsWith('server/')?'../':'';
  html=html.replace(/<a class="preview-card[^>]*>[\s\S]*?<\/a>/g,tag=>{
    const image=tag.match(/blog-(\d+)-hd/);if(!image)return tag;
    const post=posts.find(post=>post.image?.includes('blog-'+image[1]+'-hd'));if(!post)return tag;
    return tag.replace(/href="[^"]+"/,`href="${prefix}staffblog/${post.file}"`);
  });
  fs.writeFileSync(file,html);
}
console.log(`Built ${posts.length} article pages and linked the listing/home previews.`);
await import('./build-blog-archive.mjs');
