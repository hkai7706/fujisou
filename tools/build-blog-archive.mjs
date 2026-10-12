import fs from 'node:fs';
import crypto from 'node:crypto';
const overrides=JSON.parse(fs.readFileSync('staffblog/thumbnail-overrides.json','utf8'));
const posts=JSON.parse(fs.readFileSync('staffblog/posts.json','utf8')).map(p=>{const image=overrides[p.legacyFile];return image?{...p,image:image.image,imageWidth:image.imageWidth,imageHeight:image.imageHeight,imageAlt:image.imageAlt}:p;}).sort((a,b)=>b.date.localeCompare(a.date)||a.source.localeCompare(b.source));
const shell=fs.readFileSync('staffblog/index.html','utf8');
const esc=value=>String(value||'').replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const size=24,total=Math.ceil(posts.length/size);
const pageHref=n=>n===1?'index.html':`page-${n}.html`;
const version=value=>crypto.createHash('sha256').update(value).digest('hex').slice(0,10);
let start=shell.slice(0,shell.indexOf('<main')).replace(/<link[^>]*href="[^\"]*blog-archive.css(?:\?[^\"]*)?"[^>]*>/g,'').replace(/<script[^>]*src="(?:search-index.js|\.\.\/script\/blog-archive.js)(?:\?[^\"]*)?"[^>]*><\/script>/g,'');
start=start.replace('</head>',`<link rel="stylesheet" href="../stylesheet/blog-archive.css?v=${version(fs.readFileSync('stylesheet/blog-archive.css'))}"></head>`);
const end=shell.slice(shell.indexOf('</main>')+7);
const card=p=>`<article class="archive-card${p.image?'':' archive-card--text'}"><a href="${esc(p.file)}">${p.image?`<figure><img src="${esc(p.image)}" alt="${esc(p.imageAlt||p.title)}" width="${p.imageWidth}" height="${p.imageHeight}" loading="lazy" decoding="async"></figure>`:''}<div><p class="archive-meta"><time datetime="${p.date}">${p.date.replaceAll('-','.')}</time>　${esc(p.category)}</p><h2>${esc(p.title)}</h2><p>${esc(p.excerpt)}</p><span class="archive-read">続きを読む →</span></div></a></article>`;
const categoryDefinitions=[['お知らせ','news'],['イベント','events'],['モデルハウス','model-houses'],['土地情報','land'],['家づくりについて','home-building'],['施工事例','projects'],['日常','daily-life'],['社長ブログ','president']];
const aliases={'土地・不動産':'土地情報','資金計画':'家づくりについて','間取り・暮らし':'家づくりについて'};
const categoriesFor=p=>[...new Set(p.category.split(/[｜|]/).map(c=>c.trim()).filter(Boolean).map(c=>aliases[c]||c))];
const collections=[{label:'すべて',slug:'',posts},...categoryDefinitions.map(([label,slug])=>({label,slug,posts:posts.filter(p=>categoriesFor(p).includes(label))}))];
for(const collection of collections){
 const currentPosts=collection.posts,total=Math.max(1,Math.ceil(currentPosts.length/size));
 const pageHref=n=>collection.slug?`category-${collection.slug}${n>1?'-'+n:''}.html`:(n===1?'index.html':`page-${n}.html`);
 const categoryDirectory=`<details class="archive-directory"><summary>テーマから記事を探す<span aria-hidden="true">＋</span></summary><nav aria-label="ブログのカテゴリー">${collections.map(c=>`<a href="${c.slug?'category-'+c.slug+'.html':'index.html'}"${c.slug===collection.slug?' aria-current="page"':''}><span>${c.slug?esc(c.label):"ブログ一覧"}</span>${c.slug?`<small>${c.posts.length}件</small>`:""}</a>`).join('')}</nav></details>`;

for(let page=1;page<=total;page++){
 const title=`${collection.slug?collection.label+" ｜ ":""}社長のブログ${page>1?` ｜ ${page}ページ`:''}｜フジ創アイノス`;
 const head=start.replace(/<title>[\s\S]*?<\/title>/,`<title>${title}</title>`).replace(/<link rel="canonical"[^>]*>/,`<link rel="canonical" href="https://www.fujisou-ainos.com/staffblog/${!collection.slug&&page===1?'':pageHref(page)}">`);
 const numbers=[...new Set([1,total,...Array.from({length:7},(_,i)=>page-3+i).filter(n=>n>0&&n<=total)])].sort((a,b)=>a-b);
 const pagination=numbers.map((n,i)=>`${i&&n>numbers[i-1]+1?'<span>…</span>':''}<a href="${pageHref(n)}"${n===page?' aria-current="page"':''}>${n}</a>`).join('');
 const main=`<main id="main" class="blog-archive"><nav class="site-breadcrumbs" aria-label="パンくずリスト"><ol><li><a href="../index.html">ホーム</a></li><li>/</li><li aria-current="page">社長のブログ</li></ol></nav><header class="archive-heading"><p>FUJISOU AINOS JOURNAL</p><h1>社長のブログ</h1><p>家づくりのこと、暮らしのこと。<br>日々の想いを、お伝えします。</p></header><p id="archive-status" aria-live="polite">${collection.slug?esc(collection.label)+" "+currentPosts.length+"件 ／ ":""}新しい記事から ${page}・${total}ページ</p><div class="archive-grid" id="archive-results">${currentPosts.slice((page-1)*size,page*size).map(card).join('')}</div><nav class="archive-pagination" aria-label="ブログ一覧のページ">${page>1?`<a href="${pageHref(page-1)}">← 前へ</a>`:''}${pagination}${page<total?`<a href="${pageHref(page+1)}">次へ →</a>`:''}</nav>${categoryDirectory}</main>`;
 fs.writeFileSync('staffblog/'+pageHref(page),head+main+end);
}
}
console.log(`Built all blog archive pages and ${categoryDefinitions.length} category collections.`);
