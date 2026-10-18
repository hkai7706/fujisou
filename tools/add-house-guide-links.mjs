import fs from 'node:fs';import crypto from 'node:crypto';
const css='stylesheet/house-guide.css',version=crypto.createHash('sha256').update(fs.readFileSync(css)).digest('hex').slice(0,10);
const items=[['performance/','構造・断熱・仕様','耐震性や断熱、採用する材料・設備について。'],['cost/','価格と総予算','建物本体の価格と、土地・諸費用を含む資金計画。'],['aftercare/','保証・点検','保証の対象や延長条件、住み始めてからの点検について。']];
for(const [file,prefix,compact] of [['index.html','',false],['plans/hiraya/index.html','../../',true],['plans/two-story/index.html','../../',true],['plans/custom/index.html','../../',true]]){
 let s=fs.readFileSync(file,'utf8');
 const section=`<!-- BEGIN HOUSE GUIDE --><section class="house-guide${compact?' house-guide--compact':''}" aria-labelledby="house-guide-title"><div class="house-guide__inner"><header><h2 id="house-guide-title">家づくりの基本情報</h2><p>仕様や費用、完成後の保証をご確認いただけます。</p></header><nav aria-label="性能・価格・保証のご案内">${items.map(([route,title,copy])=>`<a href="${prefix}${route}"><h3>${title}</h3><p>${copy}</p><span>詳しく見る <span aria-hidden="true">→</span></span></a>`).join('')}</nav></div></section><!-- END HOUSE GUIDE -->`;
 if(s.includes('<!-- BEGIN HOUSE GUIDE -->'))s=s.replace(/<!-- BEGIN HOUSE GUIDE -->[\s\S]*?<!-- END HOUSE GUIDE -->/,section);
 else if(compact)s=s.replace('<section class="planning-contact"',section+'\n<section class="planning-contact"');
 else{s=s.replace('<section class="planning-support section"',section+'\n<section class="planning-support section"');s=s.replace(/<p class="evidence-note"><a href="performance\/">構造・断熱・標準仕様を資料で確認する →<\/a>　<a href="aftercare\/">保証・点検の条件を見る →<\/a><\/p>/,'');}
 if(!s.includes('<!-- BEGIN HOUSE GUIDE -->'))throw Error('Insertion location missing: '+file);
 s=s.replace(/<link[^>]*href="[^\"]*stylesheet\/house-guide\.css[^\"]*"[^>]*>/g,'');
 s=s.replace('</head>',`<link rel="stylesheet" href="${prefix}${css}?v=${version}"></head>`);
 fs.writeFileSync(file,s);
}
console.log('Added homepage and three plan-page links to performance, cost and aftercare.');
