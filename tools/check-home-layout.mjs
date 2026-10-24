import fs from 'node:fs';
import assert from 'node:assert/strict';
import puppeteer from 'puppeteer-core';

fs.mkdirSync('tmp/pagespeed', {recursive:true});
const browser = await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try {
  for (const width of [320,390,768,1440]) {
    const page = await browser.newPage();
    await page.setViewport({width,height:900,deviceScaleFactor:1});
    const errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    await page.goto('http://127.0.0.1:5501/',{waitUntil:'networkidle0'});
    await page.screenshot({path:`tmp/pagespeed/initial-${width}.png`});
    await page.evaluate(async()=>{
      for(let y=0;y<document.body.scrollHeight;y+=700){window.scrollTo({top:y,behavior:'instant'});await new Promise(resolve=>setTimeout(resolve,100));}
      window.scrollTo({top:0,behavior:'instant'});
    });
    const result = await page.evaluate(()=>({
      overflow:document.documentElement.scrollWidth>innerWidth,
      missing:[...document.images].filter(image=>image.offsetWidth>0&&image.complete&&!image.naturalWidth).map(image=>image.src),
      styles:document.querySelectorAll('link[rel="stylesheet"]').length,
      labelColor:getComputedStyle(document.querySelector('.shared-footer__area strong')).color,
      logo:document.querySelector('.shared-header__brand img').currentSrc,
      poster:document.querySelector('.home-event__visual img').currentSrc
    }));
    assert.equal(result.overflow,false,`Overflow at ${width}`);
    assert.deepEqual(result.missing,[],`Missing images at ${width}`);
    assert.deepEqual(errors,[],`Browser errors at ${width}`);
    assert.equal(result.styles,1,'Homepage should load one combined stylesheet');
    assert.equal(result.labelColor,'rgb(115, 81, 46)');
    if(width<=768){
      await page.click('.shared-header__toggle');
      assert.equal(await page.$eval('.shared-header__toggle',node=>node.getAttribute('aria-expanded')),'true');
      await page.keyboard.press('Escape');
      assert.equal(await page.$eval('.shared-header__toggle',node=>node.getAttribute('aria-expanded')),'false');
    }
    await page.screenshot({path:`tmp/pagespeed/home-${width}.png`,fullPage:true});
    console.log(width,JSON.stringify(result));
    await page.close();
  }
  const page=await browser.newPage();
  await page.setJavaScriptEnabled(false);
  await page.goto('http://127.0.0.1:5501/',{waitUntil:'networkidle0'});
  assert.equal(await page.$eval('.hybrid-hero',node=>node.getBoundingClientRect().height>100),true);
  console.log('No-JavaScript homepage styling passed.');
} finally {await browser.close();}
