import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const root=path.resolve(import.meta.dirname,'..');
const esc=value=>String(value).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
export function updateHomeVideos(videos){
  const file=path.join(root,'index.html');
  let html=fs.readFileSync(file,'utf8');
  const latest=videos[0];
  const thumbnail=latest?`https://i.ytimg.com/vi/${latest.youtubeId}/${latest.highResolutionThumbnail?'maxresdefault':'hqdefault'}.jpg`:'';
  const section=latest?`<!-- BEGIN HOME VIDEOS -->
    <section class="home-videos" aria-labelledby="home-videos-title">
      <div class="home-videos__intro"><p class="home-videos__eyebrow">動画のご案内</p><h2 id="home-videos-title">動画で、<br>住まいを体感する。</h2><p>ルームツアーや家づくりの様子を、動画でご紹介します。<br>空間の広がりや素材の表情を、ご覧ください。</p><a class="home-videos__all" href="videos/">動画一覧を見る <span aria-hidden="true">→</span></a></div>
      <article class="home-videos__latest"><a href="videos/${latest.slug}/"><div class="home-videos__thumbnail"><img src="${thumbnail}" ${latest.highResolutionThumbnail?`srcset="https://i.ytimg.com/vi/${latest.youtubeId}/hqdefault.jpg 480w, ${thumbnail} 1280w" sizes="(max-width:760px) calc(100vw - 40px), 560px"`:''} alt="" width="${latest.highResolutionThumbnail?1280:480}" height="${latest.highResolutionThumbnail?720:360}" loading="lazy" decoding="async" referrerpolicy="strict-origin-when-cross-origin"><span class="home-videos__play" aria-hidden="true">▶</span><span class="home-videos__watch">動画を見る <span aria-hidden="true">↗</span></span></div><div class="home-videos__meta"><span>最新の動画 / ${esc(latest.category)}</span><time datetime="${latest.publishedAt}">${latest.publishedAt.replaceAll('-','.')}</time></div><h3>${esc(latest.title)}</h3></a></article>
    </section>
    <!-- END HOME VIDEOS -->`:'';
  const marker=/<!-- BEGIN HOME VIDEOS -->[\s\S]*?<!-- END HOME VIDEOS -->/;
  if(marker.test(html))html=html.replace(marker,section);
  else if(latest){if(!html.includes('<section class="home-selector"'))throw Error('Homepage video insertion point missing');html=html.replace('<section class="home-selector"',section+'\n<section class="home-selector"');}
  html=html.replace(/<link\b[^>]*href="[^\"]*home-videos\.css[^\"]*"[^>]*>/g,'');
  if(latest){const hash=crypto.createHash('sha256').update(fs.readFileSync(path.join(root,'stylesheet/home-videos.css'))).digest('hex').slice(0,10);html=html.replace('</head>',`<link rel="stylesheet" href="stylesheet/home-videos.css?v=${hash}"></head>`);}
  fs.writeFileSync(file,html);
}
