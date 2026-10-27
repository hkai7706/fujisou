import assert from 'node:assert/strict';
import fs from 'node:fs';
import puppeteer from 'puppeteer-core';
const base=process.env.PREVIEW_URL||'http://127.0.0.1:5501/';
fs.mkdirSync('tmp/approved-consultation',{recursive:true});
const browser=await puppeteer.launch({executablePath:process.env.CHROME_BINARY||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try{
 const page=await browser.newPage();
 await page.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);
 for(const width of [320,390,768,1440]){
  await page.setViewport({width,height:1000});
  await page.goto(base,{waitUntil:'networkidle0'});
  await page.evaluate(()=>document.fonts.ready);
  assert.equal(await page.$$('base').then(els=>els.length),0,'No preview-only base tag');
  assert.equal(await page.$$('.consultation-banner').then(els=>els.length),2);
  assert.equal(await page.$$('.mobile-contact-bar').then(els=>els.length),1);
  assert.equal(await page.$eval('.shared-header__contact',e=>new URL(e.href).pathname.endsWith('/consultation/')),true);
  const heroNote=await page.$eval('.hybrid-hero__consultation-note',e=>{
   const r=e.getBoundingClientRect(),hero=e.closest('.hybrid-hero').getBoundingClientRect(),controls=e.closest('.hybrid-hero').querySelector('.hybrid-hero__controls').getBoundingClientRect();
   return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,heroTop:hero.top,heroBottom:hero.bottom,overlapsControls:r.left<controls.right&&r.right>controls.left&&r.top<controls.bottom&&r.bottom>controls.top};
  });
  assert.ok(heroNote.left>=0&&heroNote.right<=width&&heroNote.top>=heroNote.heroTop&&heroNote.bottom<=heroNote.heroBottom,JSON.stringify(heroNote));
  assert.equal(heroNote.overlapsControls,false,'Offer note must not cover the slide controls');
  for(const id of ['banner-01','banner-02']){
   await page.$eval('#'+id,e=>e.scrollIntoView());
   await new Promise(resolve=>setTimeout(resolve,100));
   const result=await page.$eval('#'+id,e=>{
    const r=e.getBoundingClientRect(),image=e.querySelector('img'),photo=image.getBoundingClientRect();
    return {height:r.height,clipped:[...e.querySelectorAll('h2,p,a')].filter(t=>{const b=t.getBoundingClientRect();return b.left<r.left-1||b.right>r.right+1||b.top<r.top-1||b.bottom>r.bottom+1}).map(t=>t.textContent),
     tap:e.querySelector('a').getBoundingClientRect().height,natural:image.naturalWidth,ratio:photo.width/photo.height,naturalRatio:image.naturalWidth/image.naturalHeight,
     before:e.previousElementSibling.className,after:e.nextElementSibling.className,destination:new URL(e.querySelector('a').href).pathname};
   });
   assert.deepEqual(result.clipped,[],`${id} ${width}`);assert.ok(result.tap>=44);assert.ok(result.natural>0);
   assert.ok(Math.abs(result.ratio-result.naturalRatio)<.01,'Keep full photo proportions');
   assert.ok(result.destination.endsWith('/consultation/'));
   if(id==='banner-01'){assert.ok(result.before.includes('value-story'));assert.ok(result.after.includes('exterior-works'));}
   else {assert.ok(result.before.includes('house-guide'));assert.ok(result.after.includes('planning-support'));}
   if([390,1440].includes(width))await(await page.$('#'+id)).screenshot({path:`tmp/approved-consultation/${id}-${width}.png`});
  }
  assert.equal(await page.$eval('.contact-card--phone',e=>e.getAttribute('href')),'tel:08002002661');
  assert.equal(await page.$eval('.contact-card--email',e=>e.getAttribute('href')),'mailto:info@ainos.biz');
  await page.$eval('#journal-preview',e=>e.scrollIntoView());
  await new Promise(resolve=>setTimeout(resolve,150));
  if(width<=760){
   const result=await page.$eval('.news-preview__grid',track=>{
    const card=track.querySelector('.preview-card:not([hidden])'),photo=card.querySelector('img').getBoundingClientRect(),title=card.querySelector('h3').getBoundingClientRect(),link=card.querySelector('.preview-card__link').getBoundingClientRect();
    return {card:card.getBoundingClientRect().width,photo:photo.width,titleTop:title.top,photoBottom:photo.bottom,linkWidth:link.width,linkHeight:link.height,scrollable:track.scrollWidth>track.clientWidth};
   });
   assert.ok(Math.abs(result.card-result.photo)<1);assert.ok(result.titleTop>result.photoBottom);assert.ok(result.linkWidth>result.linkHeight);assert.equal(result.scrollable,true);
   await page.$eval('.news-preview__grid',e=>e.scrollTo({left:e.scrollWidth,behavior:'instant'}));
   await new Promise(resolve=>setTimeout(resolve,100));
   assert.ok(await page.$eval('.news-preview__grid',e=>e.scrollLeft>0));
   await page.$eval('.news-preview__grid',e=>e.scrollTo({left:0,behavior:'instant'}));
  }else{
   const cards=await page.$$eval('.news-preview .preview-card:not([hidden])',els=>els.map(e=>{
    const box=e.getBoundingClientRect(),photo=e.querySelector('img').getBoundingClientRect(),title=e.querySelector('h3').getBoundingClientRect(),link=e.querySelector('.preview-card__link').getBoundingClientRect();
    return {left:box.left,top:box.top,width:box.width,photoWidth:photo.width,photoBottom:photo.bottom,titleTop:title.top,linkWidth:link.width,linkHeight:link.height};
   }));
   for(const card of cards){assert.ok(Math.abs(card.width-card.photoWidth)<1);assert.ok(card.titleTop>card.photoBottom);assert.ok(card.linkWidth>card.linkHeight);}
   assert.ok(cards[1].left>cards[0].left);
   if(width>=1024)assert.ok(Math.abs(cards[2].top-cards[0].top)<1,'Three cards must share a desktop row');
   else assert.ok(cards[2].top>cards[0].top,'Tablet must use two columns');
  }
  await page.click('#news-tab-event');
  assert.equal(await page.$$eval('[data-news-category="blog"]',els=>els.every(e=>e.hidden)),true);
  assert.ok((await page.$eval('[data-news-more]',e=>e.href)).endsWith('/eventinfo/'));
  assert.ok((await page.$eval('[data-news-category="event"]',e=>e.textContent)).includes('開催終了'));
  await page.click('#news-tab-blog');
  assert.equal(await page.$$eval('[data-news-category="blog"]',els=>els.filter(e=>!e.hidden).length),3);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  if(width===390)await page.screenshot({path:'tmp/approved-consultation/journal-mobile.png'});
  if(width===1440)await(await page.$('#journal-preview')).screenshot({path:'tmp/approved-consultation/journal-desktop.png'});
  console.log(`${width}px: banner placement, photos, CTA targets, contact channels and journal passed.`);
 }
 await page.goto(new URL('consultation/',base).href,{waitUntil:'networkidle0'});
 const href=await page.$eval('.consultation-actions a',e=>e.href);
 await page.goto(href,{waitUntil:'networkidle0'});
 assert.ok(await page.$('#mailformpro'));
 assert.equal(await page.$eval('#contact-topic',e=>e.selectedIndex),1);
 console.log('Consultation form navigation passed without submitting or changing mail behavior.');
}finally{await browser.close();}
