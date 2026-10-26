import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import puppeteer from 'puppeteer-core';
const baseline=execFileSync('git',['show','de5e6103:index.html'],{encoding:'utf8'}),current=fs.readFileSync('index.html','utf8');
fs.mkdirSync('tmp/home-reading-trial',{recursive:true});
const browser=await puppeteer.launch({executablePath:process.env.CHROME_BINARY||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try{
 const page=await browser.newPage(),errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto('http://127.0.0.1:5501/',{waitUntil:'networkidle0'});
 const preserved=await page.evaluate(({baseline,current})=>{
  const parse=html=>new DOMParser().parseFromString(html,'text/html').querySelector('main');
  const old=parse(baseline),now=parse(current),normal=text=>text.replace(/\s+/g,' ').trim(),text=normal(now.textContent);
  const missing=[...old.querySelectorAll('p,li,h2,h3')].map(node=>normal(node.textContent)).filter(value=>value&&!text.includes(value));
  const missingLinks=[...old.querySelectorAll('a[href]')].filter(node=>![...now.querySelectorAll('a[href]')].some(link=>link.getAttribute('href')===node.getAttribute('href'))).map(node=>node.getAttribute('href'));
  const missingPhotos=[...old.querySelectorAll('img')].map(node=>node.getAttribute('src')).filter(src=>![...now.querySelectorAll('img')].some(node=>node.getAttribute('src')===src));
  return {missing,missingLinks,missingPhotos};
 },{baseline,current});
 assert.deepEqual(preserved,{missing:[],missingLinks:[],missingPhotos:[]},'Original copy, destinations and photos must remain');
 for(const width of [320,390,768,1440]){
  await page.setViewport({width,height:1000});await page.goto('http://127.0.0.1:5501/',{waitUntil:'networkidle0'});
  assert.equal(await page.$$eval('.home-reading-detail',nodes=>nodes.length),7);
  assert.equal(await page.$$eval('a .home-reading-detail',nodes=>nodes.length),0,'Expand controls must not be nested inside product links');
  for(const details of await page.$$('.home-reading-detail')){
   const summary=await details.$('summary');await summary.evaluate(node=>node.scrollIntoView({block:'center',behavior:'instant'}));await summary.focus();await page.keyboard.press('Enter');
   assert.equal(await details.evaluate(node=>node.open),true);assert.ok(await details.$eval('.home-reading-detail__body',node=>node.getBoundingClientRect().height>0));
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`Expanded overflow ${width}`);
   await summary.focus();await page.keyboard.press('Enter');assert.equal(await details.evaluate(node=>node.open),false);
  }
  assert.equal(await page.$eval('.strengths__grid small',node=>node.closest('details')===null),true,'Essential grade condition must stay visible');
  assert.equal(await page.$$eval('.home-plan-paths a',nodes=>nodes.length),3);
  for(const selector of ['#philosophy','.home-selector','.strengths','.value-story']){
   await page.$eval(selector,node=>node.scrollIntoView({behavior:'instant',block:'start'}));
   await new Promise(resolve=>setTimeout(resolve,250));
   if([390,1440].includes(width))await page.screenshot({path:`tmp/home-reading-trial/${selector.replace(/[.#]/g,'')}-${width}.png`});
  }
  console.log(`${width}px: all seven panels open/close by keyboard; copy fits.`);
 }
 assert.deepEqual(errors,[]);
 await page.setJavaScriptEnabled(false);await page.reload({waitUntil:'networkidle0'});
 await page.$eval('.home-reading-detail summary',node=>node.scrollIntoView({block:'center',behavior:'instant'}));await page.click('.home-reading-detail summary');
 assert.equal(await page.$eval('.home-reading-detail',node=>node.open),true);
 console.log('Original text, links and images preserved; native reading panels work without JavaScript.');
}finally{await browser.close();}
