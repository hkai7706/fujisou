import fs from 'node:fs';
import crypto from 'node:crypto';
import sharp from 'sharp';

const products=JSON.parse(fs.readFileSync('plans/products/custom-products.json','utf8'));
const esc=s=>s.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const phrases=lines=>lines.map(text=>`<span class="heading-phrase" style="--phrase-length:${text.length+0.6}">${esc(text)}</span>`).join('');
const cssVersion=crypto.createHash('sha256').update(fs.readFileSync('stylesheet/custom-products.css')).digest('hex').slice(0,10);
const image=(a,alt,eager=false)=>`<img src="../../../${a.file}" width="${a.width}" height="${a.height}" alt="${esc(alt)}" ${eager?'fetchpriority="high"':'loading="lazy"'} decoding="async">`;
for(const product of products){
  const {slug,name,tagline,features,points}=product;
  const heroFile=`img/plans/plan-${slug}-exterior-retouched-900.webp`;
  const heroMeta=await sharp(heroFile).metadata();
  const file=`plans/products/${slug}/index.html`;
  let html=fs.readFileSync(file,'utf8');
  const main=`<main id="main" class="custom-product">
  <nav class="site-breadcrumbs" aria-label="パンくずリスト"><ol><li><a href="../../../index.html">ホーム</a></li><li> / <a href="../../custom/index.html">オーダーメイド住宅</a></li><li> / <span aria-current="page">${name}</span></li></ol></nav>
  <section class="custom-product__hero"><div><p class="custom-product__label">オーダーメイド住宅</p><h1>${name}</h1><h2 class="phrase-heading">${phrases(product.heroLines)}</h2><a href="#product-points">３つのポイントを見る <span aria-hidden="true">↓</span></a></div><figure>${image({file:heroFile,width:heroMeta.width,height:heroMeta.height},name+'の住宅外観',true)}</figure></section>
  <section class="custom-product__features" aria-labelledby="features-title"><p class="custom-product__label">${name}の家づくり</p><h2 id="features-title">暮らしを支える、５つの特徴。</h2><ul>${features.map(f=>`<li>${esc(f)}</li>`).join('')}</ul></section>
  ${points.map((p,i)=>`<section class="custom-product__point" ${i===0?'id="product-points"':''} aria-labelledby="point-${i+1}"><figure>${image(p.image,name+' '+p.title+'の紹介画像')}</figure><div><p class="custom-product__label">${name}のポイント</p><h2 id="point-${i+1}" class="phrase-heading">${phrases(p.titleLines)}</h2><h3>${esc(p.subheading)}</h3>${p.paragraphs.map(text=>`<p>${esc(text)}</p>`).join('')}${p.declarations.length?`<dl class="custom-product__materials">${p.declarations.map(d=>`<div><dt>${esc(d.avoid)}</dt><dd>${esc(d.use)}</dd></div>`).join('')}</dl>`:''}</div></section>`).join('')}
  <section class="custom-product__related"><p class="custom-product__label">その他のオーダーメイド住宅</p><nav aria-label="その他の住宅スタイル">${products.filter(p=>p.slug!==slug).map(p=>`<a href="../${p.slug}/index.html">${p.name} <span aria-hidden="true">→</span></a>`).join('')}<a href="../../custom/index.html">オーダーメイド住宅一覧 <span aria-hidden="true">→</span></a></nav></section>
  <section class="custom-product__contact"><div><p class="custom-product__label">家づくり無料相談</p><h2>理想の暮らしを、お聞かせください。</h2><p>暮らしのアンケートで、家族の理想の家づくりを発見。</p></div><a href="../../../consultation/index.html">家づくりの相談をする <span aria-hidden="true">→</span></a></section>
  </main>`;
  html=html.replace(/<main\b[\s\S]*?<\/main>/,main).replace(/<link rel="stylesheet" href="[^\"]*custom-products\.css[^\"]*">/g,'');
  html=html.replace('</head>',`<link rel="stylesheet" href="../../../stylesheet/custom-products.css?v=${cssVersion}"></head>`);
  const description=`${name}のオーダーメイド住宅。${tagline}。５つの特徴と３つのポイントを、素材・性能・住まいの画像とともにご紹介します。`;
  if(/<meta name="description"/.test(html))html=html.replace(/<meta name="description"[^>]*>/,`<meta name="description" content="${esc(description)}">`);
  else html=html.replace('</head>',`<meta name="description" content="${esc(description)}"></head>`);
  if(!/<link rel="canonical"/.test(html))html=html.replace('</head>',`<link rel="canonical" href="${product.source}"></head>`);
  fs.writeFileSync(file,html);
  console.log(`Built ${name}: ${points.length} complete sections.`);
}
