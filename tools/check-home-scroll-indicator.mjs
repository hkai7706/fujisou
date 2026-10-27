import assert from 'node:assert/strict';
import puppeteer from 'puppeteer-core';
const browser=await puppeteer.launch({executablePath:process.env.CHROME_BINARY||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try{
 const page=await browser.newPage();
 await page.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);
 for(const width of [390,1440]){
  await page.setViewport({width,height:900});
  await page.goto('http://127.0.0.1:5501/',{waitUntil:'networkidle0'});
  await page.evaluate(()=>document.fonts.ready);
  for(const fraction of [0,.5,1,0]){
   // Let below-fold content finish layout before checking the final distance.
   for(let pass=0;pass<3;pass++){
    await page.evaluate(f=>window.scrollTo({top:f*(document.documentElement.scrollHeight-innerHeight),behavior:'instant'}),fraction);
    await new Promise(resolve=>setTimeout(resolve,150));
   }
   await page.waitForFunction(f=>{
    const value=Number(document.querySelector('.home-scroll-status').getAttribute('aria-valuenow'));
    return Math.abs(value-f*100)<=1;
   },{},fraction);
   const result=await page.$eval('.shared-header__signature',el=>{
    const dot=getComputedStyle(el,'::before');
    return {top:parseFloat(dot.top),height:el.getBoundingClientRect().height,dot:parseFloat(dot.height),transform:dot.transform};
   });
   assert.ok(Math.abs(result.top-result.height*fraction)<1,JSON.stringify(result));
   if(fraction===1){
    const offset=Number(result.transform.slice(7,-1).split(',').at(-1));
    assert.ok(Math.abs(offset+result.dot)<.1,JSON.stringify(result));
   }
  }
  if(width===390){
   await page.evaluate(()=>window.scrollTo(0,(document.documentElement.scrollHeight-innerHeight)/2));
   await page.waitForFunction(()=>document.querySelector('.home-scroll-status').getAttribute('aria-valuenow')==='50');
   await page.click('.shared-header__toggle');
   assert.equal(await page.$eval('.home-scroll-status',el=>el.getAttribute('aria-valuenow')),'50');
   await page.keyboard.press('Escape');
  }
  console.log(`${width}px: top, middle, bottom, reverse scrolling and menu position passed.`);
 }
}finally{await browser.close();}
