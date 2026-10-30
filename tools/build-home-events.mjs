import fs from 'node:fs';
import path from 'node:path';
const project=path.resolve(import.meta.dirname,'..'),root=path.resolve(process.argv[2]||project);
const posts=JSON.parse(fs.readFileSync(path.join(project,'eventinfo/posts.json'),'utf8'));
const latest=posts.find(p=>p.legacyFile==='open-house.shtml');
if(!latest)throw Error('Missing November event record');
const file=path.join(root,'index.html');let html=fs.readFileSync(file,'utf8');
const banner=`<section class="home-event" aria-labelledby="home-event-title" data-event-promotion data-event-end="2026-11-15">
<header class="home-event__heading"><div><p class="home-event__location">フジ創アイノス / 完成見学会</p><h2 id="home-event-title"><span>「ただいま」が、</span><span>楽しみになる家。</span></h2></div><p class="home-event__ended" data-event-closed hidden>開催終了</p></header>
<figure class="home-event__visual home-event__visual--photograph"><img src="img/eventinfo/november/hero.webp" alt="11月14日・15日の完成見学会：キッチンから見渡す木の床のリビングダイニング" width="1200" height="1200" loading="lazy" decoding="async"></figure>
<div class="home-event__information"><div class="home-event__schedule"><span class="home-event__year">2026</span><p class="home-event__date"><time datetime="2026-11-14">11.14<small>土</small></time><span class="home-event__dash" aria-hidden="true">—</span><time datetime="2026-11-15">11.15<small>日</small></time></p></div><div class="home-event__facts"><p>開催時間・会場はお問い合わせください</p><small>見学についての詳細をご案内いたします。</small></div><a class="home-event__link" href="eventinfo/november-open-house/"><span>見学会の詳細を見る</span><b aria-hidden="true">↗</b></a></div><p class="home-event__archive" data-event-closed hidden>この見学会は終了しました。次回の見学についてはお問い合わせください。</p></section>`;
html=html.replace(/<section class="home-event"[\s\S]*?<\/section>/,banner);
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;');
const selected=[latest,posts.find(p=>p.legacyFile==='tonami-open-house.shtml'),posts.find(p=>p.legacyFile==='kansei-kanga-kai.shtml')].filter(Boolean);
const cards=selected.map((p,i)=>`<a class="preview-card reveal" data-news-category="event" hidden href="eventinfo/${esc(p.file.replace(/index\.html$/,''))}">${p.image?`<img class="preview-card__image" src="${esc(p.image.replace(/^\.\.\//,''))}" alt="${esc(p.title)}" width="${p.imageWidth}" height="${p.imageHeight}" loading="lazy" decoding="async">`:''}<span class="preview-card__meta"><span class="preview-card__type">EVENT</span><time datetime="${p.date}">${p.date.replaceAll('-','.')}</time></span><h3>${i?'【開催終了】':''}${esc(p.title)}</h3><span class="preview-card__link">詳しく見る →</span></a>`).join('\n');
let n=0;
html=html.replace(/<a\b[^>]*data-news-category="event"[^>]*>[\s\S]*?<\/a>/g,()=>++n===1?cards:'');
if(!n)throw Error('Missing homepage event preview slot');
fs.writeFileSync(file,html);console.log('Homepage November event and journal preview synchronized.');
