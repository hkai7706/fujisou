import assert from 'node:assert/strict';
import fs from 'node:fs';
import puppeteer from 'puppeteer-core';
fs.mkdirSync('tmp/renovation',{recursive:true});
const browser=await puppeteer.launch({executablePath:process.env.CHROME_BINARY||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try{
 const page=await browser.newPage(),errors=[];page.on('pageerror',error=>errors.push(error.message));
 for(const width of [320,390,768,1440]){
  await page.setViewport({width,height:1000});await page.goto('http://127.0.0.1:5501/renovation/',{waitUntil:'networkidle0'});await page.evaluate(()=>document.fonts.ready);
  assert.equal(await page.$$eval('main h1',nodes=>nodes.length),1);
  assert.equal(await page.$eval('.shared-header__nav a[href$="/renovation/"]',node=>node.closest('details').querySelector('summary').textContent.trim()),'家造り情報');
  assert.equal(await page.$eval('.shared-header__nav a[href$="/renovation/"]',node=>node.getAttribute('aria-current')),'page');
  for(const image of await page.$$('main img')){await image.scrollIntoView();await image.evaluate(node=>node.decode());}
  await page.click('.renovation-faq summary');assert.equal(await page.$eval('.renovation-faq details',node=>node.open),true);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`Overflow at ${width}`);
  assert.ok(await page.$('.shared-footer a[href$="/renovation/"]'));
  if(width<=768){await page.click('.shared-header__toggle');await page.waitForSelector('.shared-header[data-menu-open]');await page.keyboard.press('Escape');assert.equal(await page.$eval('.shared-header__toggle',node=>node.getAttribute('aria-expanded')),'false');}
  await page.evaluate(async()=>{document.querySelector('.shared-footer').scrollIntoView({behavior:'instant'});await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));window.scrollTo({top:0,behavior:'instant'});});
  await page.screenshot({path:`tmp/renovation/page-${width}.png`,fullPage:true});
  console.log(`Renovation page ${width}px: navigation, photos, FAQs and layout passed.`);
 }
 await page.goto('http://127.0.0.1:5501/renovation/',{waitUntil:'networkidle0'});
 await page.click('.renovation-hero__copy a');await page.waitForFunction(()=>location.pathname==='/contact/');
 assert.equal(await page.$eval('[name="お問い合わせ種別"]',node=>node.value),'家づくりのご相談');
 assert.deepEqual(errors,[]);
}finally{await browser.close();}
