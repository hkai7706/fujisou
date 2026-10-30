import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import puppeteer from 'puppeteer-core';
const files=[];
function walk(dir){for(const item of fs.readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,item.name);if(item.isDirectory())walk(file);else files.push(file);}}
walk('dist');
assert.deepEqual(files.filter(file=>/\.(png|gif|avif)$/i.test(file)),[],'Deployment raster photos must be WebP/JPEG');
assert.equal(fs.existsSync('dist/include/consultation-banners.mjs'),false,'Build configuration is not a runtime asset');
const browser=await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try{
 for(const [route,width] of [['',320],['',390],['',1440],...['concept/','staff/','policy/','staffblog/','eventinfo/','gallery/','renovation/','contact/'].map(route=>[route,390])]){
  const page=await browser.newPage(),errors=[];await page.setViewport({width,height:900});
  page.on('pageerror',error=>errors.push(error.message));
  page.on('response',response=>{if(response.url().startsWith('http://127.0.0.1:5506/')&&response.status()>=400&&!/\/contact\/(?:mailformpro|mfp\.statics)\//.test(response.url()))errors.push(response.status()+' '+response.url());});
  // This is a layout/asset smoke test; live GA4 traffic is checked separately.
  await page.setRequestInterception(true);page.on('request',request=>/googletagmanager\.com|doubleclick\.net/.test(request.url())?request.respond({status:200,contentType:'application/javascript',body:''}):request.continue());
  await page.goto('http://127.0.0.1:5506/'+route,{waitUntil:'networkidle0'});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`${route} ${width}: overflow`);
  if(!route){for(const index of [1,2,0]){await page.click(`[data-hybrid-dot="${index}"]`);await page.$eval('.hybrid-hero__scene.is-active img',image=>image.decode());assert.ok(await page.$eval('.hybrid-hero__scene.is-active img',image=>image.naturalWidth>3),'Carousel must display the real photo');}}
  assert.deepEqual(await page.$$eval('img',images=>images.filter(image=>image.complete&&!image.naturalWidth).map(image=>image.src)),[],`${route}: broken image`);
  assert.deepEqual(errors,[],`${route}: browser errors`);
  console.log(`${route||'home'} ${width}px: layout, images and local requests passed`);await page.close();
 }
}finally{await browser.close();}
console.log(`Lightweight deployment validated (${files.length} files; no PNG/GIF/AVIF files).`);
