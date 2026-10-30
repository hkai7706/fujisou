import assert from 'node:assert/strict';
import fs from 'node:fs';
import puppeteer from 'puppeteer-core';
fs.mkdirSync('tmp/exterior-slider',{recursive:true});
const browser=await puppeteer.launch({executablePath:process.env.CHROME_BINARY||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try{
 const page=await browser.newPage(),errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);
 for(const width of [320,390,768,1440]){
  await page.setViewport({width,height:1000});await page.goto('http://127.0.0.1:5501/#works',{waitUntil:'networkidle0'});await page.evaluate(()=>document.fonts.ready);
  await page.waitForFunction(()=>!document.querySelector('[data-exterior-controls]').hidden);
  assert.equal(await page.$$eval('.exterior-card',nodes=>nodes.length),6);
  assert.equal(await page.$eval('[data-exterior-prev]',node=>node.disabled),true);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`Page overflow at ${width}`);
  await page.click('[data-exterior-next]');await page.waitForFunction(()=>document.querySelector('[data-exterior-track]').scrollLeft>10);
  // Control state is updated in the scroll handler's next animation frame.
  await page.waitForFunction(()=>!document.querySelector('[data-exterior-prev]').disabled);
  assert.equal(await page.$eval('[data-exterior-prev]',node=>node.disabled),false);
  await page.focus('[data-exterior-track]');await page.keyboard.press('End');
  await page.waitForFunction(()=>document.querySelector('[data-exterior-next]').disabled);
  assert.match(await page.$eval('[data-exterior-count]',node=>node.textContent),/06 \/ 06$/);
  await page.keyboard.press('Home');await page.waitForFunction(()=>document.querySelector('[data-exterior-prev]').disabled);
  const box=await page.$eval('[data-exterior-track]',node=>{const r=node.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,card:node.querySelector('a').getBoundingClientRect().width};});
  await page.mouse.move(box.x+box.width*.75,box.y+70);await page.mouse.down();await page.mouse.move(box.x+box.width*.75-box.card*.8,box.y+70,{steps:12});await page.mouse.up();
  await page.waitForFunction(()=>document.querySelector('[data-exterior-track]').scrollLeft>10);
  assert.equal(new URL(page.url()).pathname,'/','Dragging must not follow a project link');
  await page.focus('[data-exterior-track]');await page.keyboard.press('Home');await page.waitForFunction(()=>document.querySelector('[data-exterior-prev]').disabled);
  await page.screenshot({path:`tmp/exterior-slider/section-${width}.png`});
  console.log(`${width}px: arrows, keyboard, dragging, boundaries and six cards passed.`);
 }
 assert.deepEqual(errors,[]);
 await page.setJavaScriptEnabled(false);await page.reload({waitUntil:'networkidle0'});
 assert.equal(await page.$eval('[data-exterior-controls]',node=>getComputedStyle(node).display),'none');
 assert.equal(await page.$eval('[data-exterior-track]',node=>node.scrollWidth>node.clientWidth),true);
 assert.equal(await page.$$eval('.exterior-card',nodes=>nodes.every(node=>node.href&&node.getClientRects().length)),true);
 console.log('No-JavaScript: all project links remain available in the native scrolling row.');
}finally{await browser.close();}
