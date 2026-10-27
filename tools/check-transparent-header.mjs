import assert from 'node:assert/strict';
import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({executablePath:process.env.CHROME_BINARY || 'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try {
 const page = await browser.newPage();
 await page.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);
 const state = () => page.$eval('[data-shared-header]', el => ({background:getComputedStyle(el).backgroundColor,top:el.getBoundingClientRect().top,filter:getComputedStyle(el.querySelector('img')).filter}));
 for (const width of [320,390,430,768,1440]) {
  await page.setViewport({width,height:900});
  await page.goto('http://127.0.0.1:5501/',{waitUntil:'networkidle0'});
  assert.equal((await state()).background,'rgba(0, 0, 0, 0)');
  assert.notEqual((await state()).filter,'none');
  if (width<=760) {
   const layout=await page.evaluate(()=>({
    logo:document.querySelector('.shared-header__brand').getBoundingClientRect().width,
    toggle:document.querySelector('.shared-header__toggle').getBoundingClientRect().width,
    signature:getComputedStyle(document.querySelector('.shared-header__signature')).display,
    overflow:document.documentElement.scrollWidth>innerWidth
   }));
   assert.ok(layout.logo>=144);
   assert.ok(layout.toggle>=44);
   assert.equal(layout.signature,'none');
   assert.equal(layout.overflow,false);
  }
  await page.evaluate(()=>window.scrollTo(0,500));
  await page.waitForFunction(()=>document.querySelector('[data-shared-header]').hasAttribute('data-scrolled'));
  assert.equal((await state()).background,'rgb(255, 255, 255)');
  assert.equal((await state()).top,0);
  assert.equal((await state()).filter,'none');
  await page.evaluate(()=>window.scrollTo(0,0));
  await page.waitForFunction(()=>!document.querySelector('[data-shared-header]').hasAttribute('data-scrolled'));
  if (width<=1120) await page.click('.shared-header__toggle');
  else await page.click('.shared-header__group > summary');
  assert.equal((await state()).background,'rgb(255, 255, 255)');
  await page.keyboard.press('Escape');
  assert.equal((await state()).background,'rgba(0, 0, 0, 0)');
  console.log(`${width}px: transparent, scrolled, and open-menu states passed.`);
 }
 await page.goto('http://127.0.0.1:5501/renovation/',{waitUntil:'networkidle0'});
 assert.equal((await state()).background,'rgb(255, 255, 255)');
 await page.setJavaScriptEnabled(false);
 await page.goto('http://127.0.0.1:5501/',{waitUntil:'networkidle0'});
 assert.equal((await state()).background,'rgb(255, 255, 255)');
 console.log('Interior and no-JavaScript headers remain solid.');
} finally {await browser.close();}
