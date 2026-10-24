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
    if(width<820){
      assert.equal(await page.$$eval('.reveal',nodes=>nodes.filter(node=>node.offsetWidth>0).every(node=>getComputedStyle(node).opacity==='1')),true,'Mobile content must be visible without reveal-class mutations');
    }
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
  const delayed=await browser.newPage();
  await delayed.setViewport({width:390,height:900});
  await delayed.setRequestInterception(true);
  delayed.on('request',async request=>{
    if(request.url().includes('/img/home/slide1-'))await new Promise(resolve=>setTimeout(resolve,2500));
    await request.continue();
  });
  await delayed.goto('http://127.0.0.1:5501/',{waitUntil:'domcontentloaded'});
  const before=await delayed.$eval('.hybrid-hero',node=>node.getBoundingClientRect().height);
  assert.ok(before>200,'Hero must reserve its height before the photograph loads');
  await delayed.waitForNetworkIdle();
  const after=await delayed.$eval('.hybrid-hero',node=>node.getBoundingClientRect().height);
  assert.ok(Math.abs(before-after)<1,`Slow hero image shifted height: ${before} -> ${after}`);
  await delayed.close();
  console.log('Slow-image hero layout reservation passed.');
  const page=await browser.newPage();
  await page.setJavaScriptEnabled(false);
  await page.goto('http://127.0.0.1:5501/',{waitUntil:'networkidle0'});
  assert.equal(await page.$eval('.hybrid-hero',node=>node.getBoundingClientRect().height>100),true);
  assert.equal(await page.$eval('[data-event-promotion]',node=>getComputedStyle(node).display==='none'),true,'Expired promotion must stay hidden without JavaScript');
  assert.equal(await page.$$eval('.home-plan-paths a',nodes=>nodes.length),3,'All three housing categories must be directly accessible');
  await page.goto('http://127.0.0.1:5501/eventinfo/open-house/',{waitUntil:'networkidle0'});
  assert.equal(await page.$$eval('[data-event-active]',nodes=>nodes.every(node=>node.hidden&&node.getClientRects().length===0)),true,'Expired event offers must be hidden without JavaScript');
  assert.equal(await page.$$eval('[data-event-closed]',nodes=>nodes.every(node=>!node.hidden&&node.getClientRects().length>0)),true,'Expired event notices must be visible without JavaScript');
  console.log('No-JavaScript homepage styling passed.');
} finally {await browser.close();}
