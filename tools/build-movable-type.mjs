import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const dir='cms/movable-type',modules=path.join(dir,'modules');
fs.mkdirSync(modules,{recursive:true});
const write=(name,text)=>fs.writeFileSync(path.join(modules,name+'.mtml'),text+'\n');
const root='<$mt:Var name="ainos_root"$>';
const asset=file=>`${root}${file}?v=${crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex').slice(0,10)}`;
write('Ainos Settings','<mt:SetVar name="ainos_root" value="/">\n<mt:SetVar name="ainos_origin" value="https://www.fujisou-ainos.com">');
for(const name of ['Header','Footer']){
 write('Ainos '+name,`<!--#include virtual="${root}include/${name.toLowerCase()}.shtml" -->`);
}
write('Ainos Head',`<!doctype html><html lang="ja"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<mt:If name="ainos_listing">
<title><$mt:Var name="ainos_section" encode_html="1"$>｜フジ創アイノス</title>
<link rel="canonical" href="<$mt:Var name="ainos_listing_url" encode_html="1"$>">
<meta name="description" content="フジ創アイノスの<$mt:Var name="ainos_section" encode_html="1"$>をご案内します。">
<meta property="og:title" content="<$mt:Var name="ainos_section" encode_html="1"$>｜フジ創アイノス">
<meta property="og:url" content="<$mt:Var name="ainos_listing_url" encode_html="1"$>">
<meta property="og:type" content="website">
<mt:Else>
<title><$mt:EntryTitle encode_html="1"$>｜<$mt:Var name="ainos_section" encode_html="1"$>｜フジ創アイノス</title>
<link rel="canonical" href="<$mt:EntryPermalink encode_html="1"$>">
<meta name="description" content="<$mt:EntryExcerpt remove_html="1" encode_html="1"$>">
<meta property="og:title" content="<$mt:EntryTitle encode_html="1"$>">
<meta property="og:description" content="<$mt:EntryExcerpt remove_html="1" encode_html="1"$>">
<meta property="og:url" content="<$mt:EntryPermalink encode_html="1"$>">
<meta property="og:type" content="article">
</mt:If>
<meta property="og:site_name" content="フジ創アイノス"><meta property="og:locale" content="ja_JP"><meta name="twitter:card" content="summary_large_image">
<mt:SetVar name="ainos_cover_url" value="">
<mt:Unless name="ainos_listing"><mt:EntryAssets type="image" lastn="1" sort_by="created_on" sort_order="ascend"><$mt:AssetURL setvar="ainos_cover_url"$></mt:EntryAssets></mt:Unless>
<mt:If name="ainos_cover_url"><meta property="og:image" content="<$mt:Var name="ainos_cover_url" encode_html="1"$>"><mt:Else><meta property="og:image" content="<$mt:Var name="ainos_origin"$>${root}img/ogp.jpg"></mt:If>
<link rel="icon" href="${root}favicon.ico">
${['fujisou-ainos.css','breadcrumbs.css','staffblog.css','page-start.css','blog-body.css','event-detail.css','blog-archive.css','shared-chrome.min.css','inquiry-journey.css','site-design.css','mt-posting.css'].map(file=>`<link rel="stylesheet" href="${asset('stylesheet/'+file)}">`).join('\n')}
<script src="${asset('script/shared-chrome.js')}" defer></script>
</head>`);
write('Ainos Breadcrumbs',`<nav class="site-breadcrumbs" aria-label="パンくずリスト"><ol><li><a href="${root}">ホーム</a></li><li aria-hidden="true">/</li><li><a href="${root}<$mt:Var name="ainos_section_path"$>"><$mt:Var name="ainos_section" encode_html="1"$></a></li><li aria-hidden="true">/</li><li><span aria-current="page">記事</span></li></ol></nav>`);
write('Ainos Listing Card',`<article class="archive-card"><a href="<$mt:EntryPermalink encode_html="1"$>"><mt:EntryAssets type="image" lastn="1" sort_by="created_on" sort_order="ascend"><figure><img src="<$mt:AssetURL encode_html="1"$>" alt="<$mt:AssetLabel encode_html="1"$>" width="<$mt:AssetProperty property="image_width"$>" height="<$mt:AssetProperty property="image_height"$>" loading="lazy" decoding="async"></figure></mt:EntryAssets><div><p class="archive-meta"><time datetime="<$mt:EntryDate format="%Y-%m-%d"$>"><$mt:EntryDate format="%Y.%m.%d"$></time>　<$mt:EntryCategory encode_html="1"$></p><h2><$mt:EntryTitle encode_html="1"$></h2><p><$mt:EntryExcerpt remove_html="1" encode_html="1"$></p><span class="archive-read">詳しく見る →</span></div></a></article>`);
write('Ainos Listing',`<$mt:Include module="Ainos Head"$><body class="blog-page mt-posting-page" data-site-design="interior"><$mt:Include module="Ainos Header"$><main id="main" class="blog-archive"><nav class="site-breadcrumbs" aria-label="パンくずリスト"><ol><li><a href="${root}">ホーム</a></li><li>/</li><li><$mt:Var name="ainos_section" encode_html="1"$></li></ol></nav><header class="archive-heading page-hero"><p>FUJISOU AINOS</p><h1><$mt:Var name="ainos_section" encode_html="1"$></h1><mt:If name="ainos_monthly"><p><$mt:ArchiveTitle encode_html="1"$></p></mt:If></header><div class="archive-grid"><mt:If name="ainos_monthly"><mt:Entries lastn="99999" sort_by="authored_on" sort_order="descend"><$mt:Include module="Ainos Listing Card"$></mt:Entries><mt:Else><mt:Entries lastn="24" sort_by="authored_on" sort_order="descend"><$mt:Include module="Ainos Listing Card"$></mt:Entries></mt:If></div><nav class="archive-directory" aria-label="月別アーカイブ"><h2>月別アーカイブ</h2><mt:ArchiveList archive_type="Monthly"><a href="<$mt:ArchiveLink encode_html="1"$>"><$mt:ArchiveTitle encode_html="1"$></a></mt:ArchiveList><p><a href="${root}<$mt:Var name="ainos_section_path"$>legacy-archive.html">以前の記事一覧を見る →</a></p></nav></main><$mt:Include module="Ainos Footer"$></body></html>`);
for(const [kind,folder] of [['blog','staffblog'],['event','eventinfo']]){
 for(const monthly of [false,true]){
  const label=kind==='blog'?'社長のブログ':'イベント情報';
  fs.writeFileSync(path.join(dir,`${kind}-${monthly?'monthly':'index'}.mtml`),`<$mt:Include module="Ainos Settings"$>\n<mt:SetVar name="ainos_kind" value="${kind}">\n<mt:SetVar name="ainos_section" value="${label}">\n<mt:SetVar name="ainos_section_path" value="${folder}/">\n<mt:SetVar name="ainos_listing" value="1">\n<mt:SetVar name="ainos_monthly" value="${monthly?'1':''}">\n<mt:SetVarBlock name="ainos_listing_url"><$mt:${monthly?'ArchiveLink':'BlogURL'}$></mt:SetVarBlock>\n<$mt:Include module="Ainos Listing"$>\n`);
 }
 const template=`<$mt:Include module="Ainos Settings"$>
<div data-ainos-feed="${kind}">
<mt:Entries lastn="3" sort_by="authored_on" sort_order="descend">
<a class="preview-card reveal" data-news-category="${kind}"${kind==='event'?' hidden':''} href="<$mt:EntryPermalink encode_html="1"$>">
<mt:EntryAssets type="image" lastn="1" sort_by="created_on" sort_order="ascend"><img class="preview-card__image" src="<$mt:AssetURL encode_html="1"$>" alt="<$mt:AssetLabel encode_html="1"$>" width="<$mt:AssetProperty property="image_width"$>" height="<$mt:AssetProperty property="image_height"$>" loading="lazy" decoding="async"></mt:EntryAssets>
<span class="preview-card__meta"><span class="preview-card__type">${kind.toUpperCase()}</span><time datetime="<$mt:EntryDate format="%Y-%m-%d"$>"><$mt:EntryDate format="%Y.%m.%d"$></time></span>
<h3><$mt:EntryTitle encode_html="1"$></h3><span class="preview-card__link">${kind==='blog'?'記事を読む':'詳しく見る'} →</span></a>
</mt:Entries></div>`;
 fs.writeFileSync(path.join(dir,`${kind}-home-cards.mtml`),template+'\n');
 // Seed static hosting only once; actual publishing owns this file after launch.
 const feed=path.join(folder,'latest-cards.inc');
 if(!fs.existsSync(feed)){
  const home=fs.readFileSync('index.html','utf8');
  const cards=[...home.matchAll(new RegExp('<a\\b[^>]*data-news-category="'+kind+'"[^>]*>[\\s\\S]*?<\\/a>','g'))].map(m=>m[0]);
  fs.writeFileSync(feed,`<div data-ainos-feed="${kind}" data-ainos-seed="1">\n${cards.join('\n')}\n</div>\n`);
 }
 const archive=path.join(folder,'legacy-archive.html');
 if(!fs.existsSync(archive)){
  let html=fs.readFileSync(path.join(folder,'index.html'),'utf8');
  html=html.replace(/<link rel="canonical"[^>]*>/,`<link rel="canonical" href="https://www.fujisou-ainos.com/${folder}/legacy-archive.html">`).replace(/href="index\.html"/g,'href="legacy-archive.html"').replace('</head>','<meta name="robots" content="noindex,follow" data-archive-robots></head>');
  fs.writeFileSync(archive,html);
 }
}
console.log('Prepared Movable Type modules, standard articles, homepage feeds and preserved archive entry points.');
