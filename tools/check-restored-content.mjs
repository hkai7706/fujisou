import assert from 'node:assert/strict';
import fs from 'node:fs';
import puppeteer from 'puppeteer-core';
const latest=JSON.parse(fs.readFileSync('staffblog/posts.json','utf8')).sort((a,b)=>b.date.localeCompare(a.date)).slice(0,2);
const paths=['','process/','aftercare/','concept/',...latest.map(post=>'staffblog/'+post.file)];
const browser=await puppeteer.launch({executablePath:process.env.CHROME_BINARY||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
fs.mkdirSync('tmp/original-audit',{recursive:true});
try{
 const page=await browser.newPage(),errors=[];page.on('pageerror',error=>errors.push(error.message));
 for(const width of [320,390,1440]){
  await page.setViewport({width,height:1000});
  for(const route of paths){
   await page.goto('http://127.0.0.1:5501/'+route,{waitUntil:'networkidle0'});await page.evaluate(()=>document.fonts.ready);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`Overflow ${route} ${width}`);
   assert.ok(await page.$('.shared-footer a[href="https://fujisou-ainos.ambassador-cloud.biz/login/"]'),'Customer club must be reachable');
   assert.ok(await page.$('.shared-footer a[href="https://www.facebook.com/profile.php?id=61557082942556"]'),'Original Facebook link must be reachable');
   if(route==='')assert.deepEqual(await page.$$eval('[data-news-category="blog"] time',nodes=>nodes.map(node=>node.dateTime)),['2026-10-26','2026-10-19','2026-10-12']);
   if(route==='process/'){
    assert.equal(await page.$eval('.process-guide details',node=>node.open),false);
    await page.click('.process-guide summary');assert.equal(await page.$eval('.process-guide details',node=>node.open),true);
   }
   if(route==='concept/')for(const id of ['takaoka-office','toyama-office'])assert.ok(await page.$('#'+id),'Office link destination must exist');
   if(route.startsWith('staffblog/'))assert.equal(await page.$$eval('main h1',nodes=>nodes.length),1,'Imported article must have one main heading');
   if(width===390&&['process/','aftercare/'].includes(route))await page.screenshot({path:`tmp/original-audit/${route.replace('/','')}-${width}.png`,fullPage:true});
  }
 }
 assert.deepEqual(errors,[]);
 console.log('Restored content checks passed: latest articles, owner/Facebook links, office destinations, process details and responsive layouts.');
}finally{await browser.close();}
