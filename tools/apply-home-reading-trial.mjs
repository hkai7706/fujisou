// One-time, reversible homepage presentation trial. Does not discard source copy.
import fs from 'node:fs';
import puppeteer from 'puppeteer-core';
const file='index.html';let html=fs.readFileSync(file,'utf8');
if(html.includes('data-reading-trial=')){console.log('Homepage reading trial already applied.');process.exit(0);}
const browser=await puppeteer.launch({executablePath:process.env.CHROME_BINARY||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try{
 const page=await browser.newPage();await page.setJavaScriptEnabled(false);await page.goto('http://127.0.0.1:5501/',{waitUntil:'domcontentloaded'});
 const changed=await page.evaluate(()=>{
  function fold(container,paragraphs,summary,short){
   const detail=document.createElement('details');detail.className='home-reading-detail';
   const label=document.createElement('summary');label.textContent=summary;const body=document.createElement('div');body.className='home-reading-detail__body';
   detail.append(label,body);const brief=document.createElement('p');brief.className='home-reading-brief';brief.textContent=short;
   paragraphs[0].before(brief,detail);paragraphs.forEach(paragraph=>body.append(paragraph));
  }
  const philosophy=document.querySelector('.statement__text');
  fold(philosophy,[...philosophy.querySelectorAll(':scope>p')],'素材と家づくりへの想いを読む','無垢材と漆喰の心地よさを、毎日の暮らしに。');
  const value=document.querySelector('.value-story__copy');
  fold(value,[...value.querySelectorAll(':scope>p:not(.kicker)')],'価格に対する考え方を読む','素材も、総予算も。納得できる家づくりを。');
  const plaster=document.querySelector('.shikkui-story__copy');
  fold(plaster,[...plaster.querySelectorAll(':scope>p:not(.kicker)')],'漆喰の特徴と選ぶ理由を読む','漆喰の表情と、住まいでの生かし方を。');
  const local=document.querySelector('.local__copy');
  fold(local,[...local.querySelectorAll(':scope>p:not(.kicker)')],'対応エリアとご相談内容を見る','高岡・富山を拠点に、地域の住まいを支えます。');
  for(const card of document.querySelectorAll('.home-selector__item')){
   const list=card.querySelector('ul');if(!list)continue;
   const wrapper=document.createElement('article');wrapper.className='home-product-preview';card.before(wrapper);wrapper.append(card);
   const details=document.createElement('details');details.className='home-reading-detail';
   const summary=document.createElement('summary');summary.textContent=card.querySelector('strong').textContent+'のこだわりを見る';
   const body=document.createElement('div');body.className='home-reading-detail__body';body.append(list);details.append(summary,body);wrapper.append(details);
  }
  return ['statement','home-selector','value-story','shikkui-story','local'].map(name=>({name,html:document.querySelector('section.'+name).outerHTML}));
 });
 for(const section of changed){const start=html.indexOf('<section class="'+section.name);const end=html.indexOf('</section>',start)+10;if(start<0||end<10)throw Error('Section not found: '+section.name);html=html.slice(0,start)+section.html+html.slice(end);}
 html=html.replace('<main id="main" class="home-main">','<main id="main" class="home-main" data-reading-trial="progressive">');
 fs.writeFileSync(file,html);console.log('Trial applied: seven optional reading panels; original paragraphs and product points preserved.');
}finally{await browser.close();}
