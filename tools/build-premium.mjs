import fs from 'node:fs';import crypto from 'node:crypto';
const file='plans/products/premium/index.html',template=fs.readFileSync(fs.existsSync(file)?file:'plans/products/smart/index.html','utf8'),assets=JSON.parse(fs.readFileSync('plans/products/premium/assets.json','utf8'));
const img=(name,alt,eager=false)=>{const a=assets.find(a=>a.file.endsWith('/'+name+'.webp'));if(!a)throw Error(name);return `<img src="../../../${a.file}" alt="${alt}" width="${a.width}" height="${a.height}" ${eager?'fetchpriority="high"':'loading="lazy"'} decoding="async">`;};
const drawing=(name,alt)=>{const a=assets.find(a=>a.file.endsWith('/'+name+'.webp'));return `<a class="cute-drawing" href="../../../${a.file}" data-cute-image data-caption="${alt}">${img(name,alt)}<span>画像を大きく見る <b aria-hidden="true">↗</b></span></a>`;};
const plans=[
  {
    "id": "parallel",
    "name": "パラレル",
    "roman": "PARALLEL",
    "price": "2,270",
    "area": "29.11",
    "layout": "3LDK＋FS",
    "exterior": "1",
    "floor": "floor-plan-1",
    "room": "living-area",
    "feature": "２方向の動線と、多用途なフリースペース。",
    "title": "暮らしに合わせて使える空間。",
    "body": "玄関からLDK・洗面・トイレへ2方向にアクセスできる便利な間取り。広々脱衣室は収納力も抜群で家事分担に対応可能。2階のフリーホール・フリースペースと吹抜けで明るく多用途な空間に。"
  },
  {
    "id": "snowline",
    "name": "スノーライン",
    "roman": "SNOW LINE",
    "price": "2,295",
    "area": "29.43",
    "layout": "3LDK",
    "exterior": "2",
    "floor": "floor-plan-2",
    "room": "living-area-2",
    "feature": "独立洗面台と、カウンター付きの脱衣室。",
    "title": "美しいシルエット、使いやすい間取り。",
    "body": "美しいシルエットが魅力の新商品。広い脱衣室はカウンター・棚付きで家事やデスクワークも可能。独立洗面台とキッチン裏収納で使いやすく、吹抜けで明るい住まいに。"
  },
  {
    "id": "marine",
    "name": "マリン",
    "roman": "MARINE",
    "price": "2,422",
    "area": "31.06",
    "layout": "3LDK＋畳コーナー",
    "exterior": "3",
    "floor": "floor-plan-3",
    "room": "living-area-3",
    "feature": "キッチンから見守れる、畳コーナー。",
    "title": "家族が思い思いに過ごせる場所。",
    "body": "1階に多用途タタミコーナー、キッチンから見守れて安心。LDKにワークスペースと収納棚を備えた機能的間取り。2階に洗面台とバルコニー、晴れた日は海や山を望む快適空間。"
  },
  {
    "id": "epos",
    "name": "エポス",
    "roman": "EPOS",
    "price": "2,530",
    "area": "32.43",
    "layout": "3～4LDK",
    "exterior": "4",
    "floor": "floor-plan-4",
    "room": "living-area-4",
    "feature": "２つの玄関動線と、開放的な吹抜け。",
    "title": "光を取り込む、広々としたLDK。",
    "body": "玄関にお客様用と家族用の2つの入り口を設置。脱衣室と独立した洗面台、横並びキッチンでLDKを広く活用。2階フリーホールと大きな吹抜けで、明るく開放的な空間に。"
  },
  {
    "id": "dobby",
    "name": "ドビー",
    "roman": "DOBBY",
    "price": "2,656",
    "area": "34.06",
    "layout": "2～4LDK＋SR",
    "exterior": "5",
    "floor": "floor-plan-5",
    "room": "living-area-5",
    "feature": "アイランドキッチンと、脱衣兼サンルーム。",
    "title": "家族の変化に合わせられる住まい。",
    "body": "大きな窓で明るい日差しを取り入れたシックな人気デザイン。広々LDKにアイランドキッチンと食品庫、脱衣兼サンルームに多機能カウンター。独立洗面台横の棚や家事動線、2階フリーホールは家族に合わせて2部屋に変更可能。"
  }
];
const pdf=`<a href="../../../catalogs/two-story-plan-prices.pdf#page=2" target="_blank" rel="noopener"><span>詳しいプラン・価格を見る</span><small>2階建て価格表 PDF・新しいタブで開きます</small><b aria-hidden="true">↗</b></a>`;
const main=`<main id="main" class="cute-main premium-main"><nav class="site-breadcrumbs" aria-label="パンくずリスト"><ol><li><a href="../../../index.html">ホーム</a></li><li> / <a href="../../two-story/index.html">2階建て住宅</a></li><li> / <span aria-current="page">Ainos Premium</span></li></ol></nav>
<section class="cute-hero premium-hero"><div class="cute-hero__copy"><p>永く住み継ぐ上質な空間</p><h1>Ainos <span>Premium</span></h1><h2>光と風が、<br>心を満たす。</h2><p>大きな窓と、家族の居場所。<br>暮らしに合わせて選べる５つのプラン。</p><a href="#premium-plans">５つのプランを見る <span aria-hidden="true">↓</span></a></div><figure>${img('5','Ainos Premium ドビーの外観',true)}</figure></section>
<section class="cute-lineup premium-lineup" id="premium-plans"><div class="cute-lineup__heading"><div><p class="cute-label">暮らし方から選ぶ、５つのプラン</p><h2>Ainos Premiumのラインナップ</h2></div><a class="cute-lineup__catalogue" href="../../../catalogs/two-story-plan-prices.pdf" target="_blank" rel="noopener">2階建ての価格表を見る <small>PDF</small><b aria-hidden="true">↗</b></a></div><nav aria-label="Ainos Premiumのプラン・価格を比較する">${plans.map(p=>`<a class="cute-comparison" href="#premium-${p.id}"><div class="cute-comparison__heading"><span>${p.name}</span><small>${p.layout}</small></div>${img(p.exterior,p.name+' 外観')}<div class="cute-comparison__price"><small>本体価格（税込）</small><p><strong>${p.price}</strong><span>万円</span></p></div><div class="cute-comparison__spec"><span>${p.layout}</span><span>延床 ${p.area}坪</span></div><p class="cute-comparison__feature">${p.feature}</p><div class="cute-comparison__link">間取り・プランを見る <b aria-hidden="true">→</b></div></a>`).join('')}</nav><p class="cute-price-note">価格は掲載の2階建て住宅価格表に合わせています。本体価格以外に、仮設、付帯工事費や諸経費がかかります。仕様・総費用はご相談ください。</p></section>
${plans.map(p=>`<section class="cute-plan premium-plan" id="premium-${p.id}" aria-labelledby="premium-title-${p.id}"><header><div class="premium-plan__identity"><p class="premium-plan__name">${p.name}<small>${p.roman}</small></p><h2 id="premium-title-${p.id}">${p.title}</h2></div><div class="premium-plan__facts"><p class="premium-plan__spec">${p.area}坪・${p.layout}</p><p class="cute-plan__price"><small>本体価格（税込）</small><span><strong>${p.price}</strong>万円</span></p></div></header><div class="cute-plan__exterior">${img(p.exterior,'Ainos Premium '+p.name+' 外観')}<p>${p.body}</p></div><div class="cute-plan__drawings"><figure>${drawing(p.floor,'Ainos Premium '+p.name+' 1階・2階の間取り')}<figcaption>${p.area}坪・${p.layout}。１階と２階の動線をご覧いただけます。</figcaption></figure><figure>${drawing(p.room,'Ainos Premium '+p.name+' 室内イメージ')}<figcaption>室内イメージ</figcaption></figure></div><div class="cute-plan__pdf">${pdf}</div></section>`).join('')}
<section class="premium-related"><div><p class="cute-label">その他の２階建て住宅も</p><h2>Ainos Smart</h2><p>コンパクト・上品。賢く選ぶ丁度良い家。</p></div><a href="../smart/index.html">Smartのプランを見る <span aria-hidden="true">→</span></a></section>
<section class="cute-contact"><div><p class="cute-label">家づくり無料相談</p><h2>あなたにとって、<br>丁度良い住まいを。</h2><p>土地やご予算、家族の暮らし方からご相談ください。</p></div><div><a href="../../../consultation/index.html">家づくりの相談をする <span aria-hidden="true">→</span></a><a href="../../two-story/index.html">２階建て住宅のラインナップ <span aria-hidden="true">→</span></a></div></section>
<dialog class="cute-image-dialog" aria-label="間取り・室内イメージの拡大"><button type="button" aria-label="拡大画像を閉じる">閉じる ×</button><img alt="" width="1200" height="900"><p></p></dialog></main>`;
const hash=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex').slice(0,10);
let html=template.replace(/<main\b[\s\S]*?<\/main>/,main).replace(/class="plans-page[^"]*"/,'class="plans-page premium-page"');
html=html.replace(/<title>[\s\S]*?<\/title>/,'<title>Ainos Premium｜光と風を取り込む2階建て住宅｜フジ創アイノス</title>').replace(/<link rel="canonical"[^>]*>/,'<link rel="canonical" href="https://www.fujisou-ainos.com/premium/">').replace(/<meta name="description"[^>]*>/,'<meta name="description" content="Ainos Premiumの５つのプランをご紹介。パラレル、スノーライン、マリン、エポス、ドビーの外観・間取り・価格をご覧いただけます。">');
html=html.replace(/<link rel="stylesheet" href="\.\.\/\.\.\/\.\.\/stylesheet\/(?:cute|smart|premium)\.css[^\"]*">/g,'').replace(/<script src="\.\.\/\.\.\/\.\.\/script\/cute-gallery\.js[^\"]*" defer><\/script>/g,'').replace(/<meta property="og:[^"]*"[^>]*>/g,'');
html=html.replace('</head>',`<link rel="stylesheet" href="../../../stylesheet/cute.css?v=${hash('stylesheet/cute.css')}"><link rel="stylesheet" href="../../../stylesheet/premium.css?v=${hash('stylesheet/premium.css')}"><meta property="og:type" content="website"><meta property="og:title" content="Ainos Premium｜フジ創アイノス"><meta property="og:image" content="https://www.fujisou-ainos.com/img/plans/premium/2.webp"></head>`).replace('</body>',`<script src="../../../script/cute-gallery.js?v=${hash('script/cute-gallery.js')}" defer></script></body>`);
fs.writeFileSync(file,html);console.log('Built Ainos Premium with five plans and catalogue pricing.');
