import assert from 'node:assert/strict';
import fs from 'node:fs';
import puppeteer from 'puppeteer-core';
fs.mkdirSync('tmp/fullscreen-hero',{recursive:true});
const browser=await puppeteer.launch({executablePath:process.env.CHROME_BINARY||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try{
 const page=await browser.newPage();await page.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);
 for(const [width,height] of [[320,568],[390,844],[430,932],[768,1024],[1440,900],[1920,1080],[844,390]]){
  await page.setViewport({width,height});await page.goto('http://127.0.0.1:5501/',{waitUntil:'networkidle0'});await page.evaluate(()=>document.fonts.ready);
  for(let slide=0;slide<3;slide++){
   await page.click(`[data-hybrid-dot="${slide}"]`);
   await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
   const result=await page.evaluate(()=>{
    const hero=document.querySelector('.hybrid-hero'),box=hero.getBoundingClientRect(),scene=hero.querySelector('.is-active'),image=scene.querySelector('img'),photo=image.getBoundingClientRect();
    return {width:box.width,height:box.height,bottom:box.bottom,photoWidth:photo.width,photoHeight:photo.height,fit:getComputedStyle(image).objectFit,overflow:document.documentElement.scrollWidth>innerWidth,
     clipped:[...scene.querySelectorAll('.hybrid-hero__copy h1,.hybrid-hero__copy h2,.hybrid-hero__copy > span,.hybrid-hero__copy a')].filter(el=>{const r=el.getBoundingClientRect();return r.left<box.left-1||r.right>box.right+1||r.top<box.top-1||r.bottom>box.bottom+1;}).map(el=>el.textContent)};
   });
   assert.ok(Math.abs(result.width-width)<1,JSON.stringify(result));assert.ok(Math.abs(result.bottom-height)<2,JSON.stringify(result));
   assert.ok(Math.abs(result.photoWidth-result.width)<1&&Math.abs(result.photoHeight-result.height)<1,JSON.stringify(result));
   assert.equal(result.fit,'cover');assert.equal(result.overflow,false);assert.deepEqual(result.clipped,[]);
   if(width<=760){
    const mobile=await page.evaluate(()=>{
     const copy=document.querySelector('.hybrid-hero__scene.is-active .hybrid-hero__copy').getBoundingClientRect();
     const controls=document.querySelector('.hybrid-hero__controls').getBoundingClientRect();
     return {copyTop:copy.top,copyBottom:copy.bottom,headerBottom:document.querySelector('[data-shared-header]').getBoundingClientRect().bottom,controlsTop:controls.top,controlsBottom:controls.bottom,barTop:document.querySelector('.mobile-contact-bar').getBoundingClientRect().top,
      targets:[...document.querySelectorAll('.hybrid-hero__scene.is-active a')].map(a=>a.getBoundingClientRect().height)};
    });
    assert.ok(mobile.copyTop>mobile.headerBottom,JSON.stringify(mobile));
    assert.ok(mobile.copyBottom<=mobile.controlsTop,JSON.stringify(mobile));
    assert.ok(mobile.controlsBottom<=mobile.barTop,JSON.stringify(mobile));
    assert.ok(mobile.targets.every(height=>height>=44),JSON.stringify(mobile));
   }
   await page.screenshot({path:`tmp/fullscreen-hero/${width}-${height}-slide-${slide+1}.png`});
  }
  console.log(`${width}×${height}: all three slides fill the screen; copy fits.`);
 }
 await page.setJavaScriptEnabled(false);await page.setViewport({width:390,height:844});await page.goto('http://127.0.0.1:5501/',{waitUntil:'networkidle0'});
 // Without JS, mobile navigation stays expanded and available above the hero.
 assert.ok(await page.$eval('.hybrid-hero',hero=>hero.getBoundingClientRect().height>400),'No-JS hero must remain visible');
}finally{await browser.close();}
