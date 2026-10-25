import fs from 'node:fs';
import assert from 'node:assert/strict';
import puppeteer from 'puppeteer-core';
const paths=['eventinfo/','staffblog/'];
fs.mkdirSync('tmp/heroes',{recursive:true});
const browser=await puppeteer.launch({executablePath:process.env.CHROME_BINARY||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try{
  const page=await browser.newPage();
  for(const path of ['concept/','staff/','policy/','gallery/','land-info/','shikkui/','plans/hiraya/','plans/two-story/','plans/custom/','plans/products/cute/','plans/products/healthy/','videos/']){
    await page.goto('http://127.0.0.1:5501/'+path);
    assert.equal(await page.$('.page-hero'),null,'Event/blog standard must not affect '+path);
  }
  for(const width of [320,390,1440]){
    await page.setViewport({width,height:1000});
    for(const path of paths){
      await page.goto('http://127.0.0.1:5501/'+path,{waitUntil:'load'});
      await page.evaluate(async()=>{await document.fonts.ready;await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));});
      const result=await page.evaluate(()=>{
        const hero=document.querySelector('main .page-hero'),box=hero.getBoundingClientRect();
        const text=[...hero.querySelectorAll('h1,h2,p,a:not([aria-hidden]),.staff-hero__note')].filter(el=>el.getClientRects().length);
        return {width:Math.round(box.width),height:Math.round(box.height),align:getComputedStyle(hero).textAlign,overflow:document.documentElement.scrollWidth>innerWidth,
          clipped:text.filter(el=>{const r=el.getBoundingClientRect();return r.left<box.left-1||r.right>box.right+1||r.top<box.top-1||r.bottom>box.bottom+1;}).map(el=>el.textContent.trim()),
          broken:[...hero.querySelectorAll('img')].filter(img=>img.complete&&!img.naturalWidth).map(img=>img.src)};
      });
      assert.equal(result.align,'center',path);assert.equal(result.overflow,false,`Page overflow ${path} ${width}`);
      assert.deepEqual(result.clipped,[],`Clipped hero copy ${path} ${width}`);assert.deepEqual(result.broken,[],path);
      await page.screenshot({path:`tmp/heroes/${path.replaceAll('/','-')}${width}.png`});
      console.log(`${width} ${path} ${result.width}×${result.height}`);
    }
  }
}finally{await browser.close();}
