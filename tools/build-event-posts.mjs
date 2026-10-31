import fs from 'node:fs';
import crypto from 'node:crypto';
const posts=JSON.parse(fs.readFileSync('eventinfo/posts.json','utf8'));
const listing=fs.readFileSync('eventinfo/index.html','utf8'),begin=listing.indexOf('<main'),end=listing.indexOf('</main>')+7;
const version=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex').slice(0,10);
const start=listing.slice(0,begin).replace(/href="\.\.\/stylesheet\/eventinfo\.css(?:\?[^\"]*)?"/g,`href="../stylesheet/eventinfo.css?v=${version('stylesheet/eventinfo.css')}"`),finish=listing.slice(end);
const esc=s=>String(s||'').replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const plain=s=>String(s||'').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();
const today=new Date(Date.now()+9*60*60*1000).toISOString().slice(0,10);
for(const [index,p] of posts.entries()){
 if(p.existing)continue;
 const customBody=`eventinfo/article-bodies/${p.legacyFile.replace(/\.shtml$/,'')}.fragment`;
 const body=fs.existsSync(customBody)?fs.readFileSync(customBody,'utf8'):p.body;
 const canonical='https://www.fujisou-ainos.com/eventinfo/'+encodeURIComponent(p.file),description=plain(body).slice(0,150);
 let head=start.replace(/<title>[\s\S]*?<\/title>/,`<title>${esc(p.title)}｜イベント情報｜フジ創アイノス</title>`).replace(/<link rel="canonical"[^>]*>/,`<link rel="canonical" href="${canonical}">`).replace(/<meta name="description"[^>]*>/,`<meta name="description" content="${esc(description)}">`).replace('class="event-list-page"','class="event-list-page event-detail-page"');
 const image=p.image?'https://www.fujisou-ainos.com/'+p.image.replace('../',''):'https://www.fujisou-ainos.com/img/ogp.jpg';
 head=head.replace('</head>',`<link rel="stylesheet" href="../stylesheet/event-detail.css?v=${version('stylesheet/event-detail.css')}"><meta property="og:type" content="article"><meta property="og:title" content="${esc(p.title)}"><meta property="og:url" content="${canonical}"><meta property="og:image" content="${image}"></head>`);
 const older=posts[index+1],newer=posts[index-1],nav=(post,label)=>post?`<a href="${esc(post.file)}">${post.image?`<img src="${esc(post.image)}" alt="" width="${post.imageWidth}" height="${post.imageHeight}" loading="lazy" decoding="async">`:''}<div><small>${label}</small><time datetime="${post.date}">${post.date.replaceAll('-','.')}</time><span>${esc(post.title)}</span><b aria-hidden="true">→</b></div></a>`:'<span></span>';
 const main=`<main id="main"><nav class="site-breadcrumbs" aria-label="パンくずリスト"><ol><li><a href="../index.html">ホーム</a></li><li> / <a href="index.html">イベント情報</a></li><li> / <span aria-current="page">${esc(p.title)}</span></li></ol></nav><article class="event-detail"><div class="event-detail__intro"><header class="event-detail__heading"><p>イベント情報</p><time datetime="${p.date}"><span>${p.date.slice(0,4)}</span><strong>${p.date.slice(5).replace('-','.')}</strong><small>掲載日</small></time><h1>${esc(p.title)}</h1><a class="event-detail__read" href="#event-content">詳しいご案内 <span aria-hidden="true">↓</span></a></header>${p.image?`<figure class="event-detail__visual"><img src="${esc(p.image)}" alt="${esc(p.title)}" width="${p.imageWidth}" height="${p.imageHeight}" fetchpriority="high" decoding="async"></figure>`:''}</div><div class="event-detail__content" id="event-content"><p class="event-detail__archive-note">日程・価格・募集内容などは、掲載当時の情報です。</p><div class="event-detail__body">${p.body.replace(/href=["']#form["']/g,'href="../contact/index.html"')}</div></div><section class="event-detail__contact"><h2>イベントや住まいについて、<br>気になることからご相談ください。</h2><a href="../contact/index.html">お問い合わせ <span aria-hidden="true">→</span></a><a href="tel:08002002661">0800-200-2661</a></section><nav class="event-detail__neighbors" aria-label="前後のお知らせ">${nav(older,'以前のお知らせ')}${nav(newer,'新しいお知らせ')}</nav><a class="event-detail__back" href="index.html">← イベント情報一覧へ</a></article></main>`;
 let rendered=main.replace(p.body.replace(/href=["']#form["']/g,'href="../contact/index.html"'),body.replace(/href=["']#form["']/g,'href="../contact/index.html"'));
 if(p.legacyFile==='kansei-kanga-kai.shtml')rendered=rendered.replace(`<h1>${esc(p.title)}</h1>`,'<h1>富山市・自然素材の平屋<br>完成見学会</h1>');
 if(p.legacyFile==='-all-styles-scoped-to-kk26-root.shtml')rendered=rendered.replace(`<h1>${esc(p.title)}</h1>`,'<h1>砺波市・自然素材の平屋<br>完成見学会</h1><p class="tonami-ended">この見学会は終了しました</p>');
 if(p.legacyFile==='-gw-holiday-notice.shtml')rendered=rendered.replace(`<h1>${esc(p.title)}</h1>`,'<h1>ゴールデンウィーク<br>休業のお知らせ</h1>');
 if(p.legacyFile==='2-315331.shtml')rendered=rendered.replace(`<h1>${esc(p.title)}</h1>`,'<h1>高岡市・全面漆喰と無垢材<br>2階建ての完成見学会</h1><p class="tonami-ended">この見学会は終了しました</p>');
 // Historical imports sometimes reused section IDs; keep the first anchor and
 // give subsequent sections unique IDs without changing their visible content.
 const ids=new Set();let duplicate=0;
 rendered=rendered.replace(/\bid="([^"]+)"/g,(attribute,id)=>{if(!ids.has(id)){ids.add(id);return attribute;}let unique;do{unique=id+'-'+(++duplicate);}while(ids.has(unique));ids.add(unique);return `id="${unique}"`;});
 fs.writeFileSync('eventinfo/'+p.file,(head+rendered+finish).replace(/[\t ]+$/gm,''));
}
const size=15,total=Math.ceil(posts.length/size);
const href=n=>n===1?'index.html':`page-${n}.html`;
const card=p=>{const ended=p.endDate&&today>p.endDate;return `<article class="event-card${ended?' event-card--ended':''}"><a href="${esc(p.file)}">${p.image?`<figure><img src="${esc(p.image)}"${p.imageSrcset?` srcset="${esc(p.imageSrcset)}" sizes="(max-width: 700px) calc(100vw - 40px), 420px"`:''} alt="${esc(p.imageAlt||p.title)}" width="${p.imageWidth}" height="${p.imageHeight}" loading="lazy" decoding="async"></figure>`:''}<div class="event-card__text"><p><span>${p.date.replaceAll('-','.')}</span>${ended?'<span class="event-card__status event-card__status--closed">開催終了</span>':''}</p><h3>${esc(p.title)}</h3><b>詳しく見る <i>→</i></b></div></a></article>`};
for(let page=1;page<=total;page++){
 let html=listing.replace(/<div class="event-collection">[\s\S]*?<\/section>/,`<div class="event-collection">${posts.slice((page-1)*size,page*size).map(card).join('')}</div><nav class="event-list-pagination" aria-label="イベント一覧のページ">${Array.from({length:total},(_,i)=>`<a href="${href(i+1)}"${i+1===page?' aria-current="page"':''}>${i+1}</a>`).join('')}</nav></section>`).replace(/href="\.\.\/stylesheet\/eventinfo\.css(?:\?[^\"]*)?"/g,`href="../stylesheet/eventinfo.css?v=${version('stylesheet/eventinfo.css')}"`);
 html=html.replace(/<link rel="canonical"[^>]*>/,`<link rel="canonical" href="https://www.fujisou-ainos.com/eventinfo/${page===1?'':href(page)}">`);
 if(page>1)html=html.replace(/<title>[\s\S]*?<\/title>/,`<title>イベント情報 ${page}ページ｜フジ創アイノス</title>`);
 fs.writeFileSync('eventinfo/'+href(page),html);
}
console.log(`Created ${posts.filter(p=>!p.existing).length} individual event pages; preserved the open-house page; built ${total} listing pages.`);
