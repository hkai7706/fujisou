import fs from 'node:fs';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import puppeteer from 'puppeteer-core';
import {renderMT} from './mt-template-fixture.mjs';
const base='http://127.0.0.1:5501';
fs.mkdirSync('tmp/movable-type',{recursive:true});
const posts=JSON.parse(fs.readFileSync('staffblog/posts.json','utf8'));
const event=JSON.parse(fs.readFileSync('eventinfo/posts.json','utf8')).find(p=>p.legacyFile==='post-16.shtml');
const escape=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
function fixture(p,kind,image=true){return {title:p.title,date:p.date,category:kind==='blog'?'家づくりについて':'イベント情報',image:image?p.image?.replace(/^\.\.\//,'/'):null,imageWidth:p.imageWidth,imageHeight:p.imageHeight,url:`${kind==='blog'?'staffblog':'eventinfo'}/entries/900001/`,body:'<h2>暮らしを考える</h2><p>この部分に、記事ごとの本文や写真を入力します。</p>',more:'<h2>さらに詳しく</h2><p>続きの本文も、同じ記事の中に表示されます。</p>',excerpt:'記事の概要です。'};}
const browser=await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try{
 for(const width of [320,390,768,1440])for(const [kind,p] of [['blog',posts[0]],['event',event]]){
  const data=fixture(p,kind),html=renderMT(`${kind}-entry.mtml`,data);
  assert.ok(!/<\/?\$?mt:/i.test(html),'All fixture MT tags resolved');
  assert.ok(html.includes(data.body)&&html.includes(data.more),'Both editable body fields preserved');
  fs.writeFileSync(`tmp/movable-type/${kind}-standard.html`,html);
  const page=await browser.newPage();await page.setViewport({width,height:1000});
  let documentHTML=html;
  await page.setRequestInterception(true);
  page.on('request',request=>request.isNavigationRequest()&&request.url().includes('/_mt-template-fixture')?request.respond({status:200,contentType:'text/html',body:documentHTML}):request.continue());
  await page.goto(base+'/_mt-template-fixture',{waitUntil:'networkidle0'});await page.evaluate(()=>document.fonts.ready);
  const result=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,h1:document.querySelectorAll('h1').length,body:document.querySelector('[itemprop="articleBody"]').textContent,skip:!!document.querySelector('#main'),broken:[...document.images].filter(i=>i.complete&&!i.naturalWidth).map(i=>i.src)}));
  assert.equal(result.overflow,false,`${kind} ${width}`);assert.equal(result.h1,1);assert.equal(result.skip,true);assert.deepEqual(result.broken,[]);assert.ok(result.body.includes('続きの本文'));
  await page.screenshot({path:`tmp/movable-type/${kind}-${width}.png`,fullPage:true});
  const empty=renderMT(`${kind}-entry.mtml`,{...data,image:null,body:'',more:''});
  documentHTML=empty;await page.goto(base+'/_mt-template-fixture?empty=1',{waitUntil:'networkidle0'});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  assert.equal(await page.$$('.event-detail__visual,.blog-entry__visual').then(n=>n.length),0);
  assert.ok(await page.$('.blog-entry__consultation a[href="/contact/"],.event-detail__contact a[href="/contact/"]'),'Fixed inquiry remains when body is empty');
  await page.close();console.log(`${kind}: ${width}px standard and empty-body/no-photo layouts passed.`);
 }
 for(const kind of ['blog','event'])for(const mode of ['index','monthly']){
  const html=renderMT(`${kind}-${mode}.mtml`,{...fixture(posts[0],kind),entries:[fixture(posts[0],kind)]});
  assert.ok(!/<\/?\$?mt:/i.test(html));assert.ok(html.includes('legacy-archive.html'));
 }
 const fresh=kind=>renderMT(`${kind}-home-cards.mtml`,{entries:[0,1,2].map((n)=>({...fixture(posts[n],kind),title:`新しい${kind}記事 ${n+1} <>&`,url:`${kind==='blog'?'staffblog':'eventinfo'}/entries/${910000+n}/`}))});
 let mode='fresh';
 const page=await browser.newPage();await page.setViewport({width:390,height:1000});
 await page.setRequestInterception(true);
 page.on('request',request=>{
  if(!request.url().endsWith('latest-cards.inc'))return request.continue();
  const kind=request.url().includes('/staffblog/')?'blog':'event';
  if(mode==='failed')return request.respond({status:503,body:'unavailable'});
  if(mode==='empty')return request.respond({status:200,body:`<div data-ainos-feed="${kind}"></div>`});
  if(mode==='invalid')return request.respond({status:200,body:`<div data-ainos-feed="${kind}"><a data-news-category="${kind}" href="javascript:alert(1)"><h3>Invalid</h3><time datetime="2026-10-30"></time></a></div>`});
  return request.respond({status:200,contentType:'text/plain',body:fresh(kind)+'<script>window.feedExecuted=true</script>'});
 });
 async function load(){await page.goto(base,{waitUntil:'networkidle0'});await page.$eval('#journal-preview',n=>n.scrollIntoView());await new Promise(r=>setTimeout(r,500));}
 await load();
 await page.waitForFunction(()=>document.querySelector('[data-news-category="blog"] h3')?.textContent.startsWith('新しいblog'));
 await page.click('#news-tab-event');
 assert.equal(await page.$$eval('[data-news-category]:not([hidden])',ns=>ns.length),3);
 assert.ok(await page.$eval('[data-news-category="event"] h3',n=>n.textContent.endsWith('<>&')),'Titles remain plain text');
 assert.equal(await page.evaluate(()=>window.feedExecuted),undefined,'Feed scripts cannot execute');
 await page.click('#news-tab-blog');assert.equal(await page.$$eval('[data-news-category="blog"]',ns=>ns.every(n=>!n.hidden)),true);
 for(const failure of ['failed','invalid']){mode=failure;await load();assert.equal(await page.$$eval('[data-news-category="blog"]',ns=>ns.length),3);assert.ok(!(await page.$eval('[data-news-category="blog"] h3',n=>n.textContent)).startsWith('新しいblog'));}
 mode='empty';await load();await page.waitForSelector('[data-news-empty="blog"]');
 assert.equal(await page.$$('[data-news-category]').then(n=>n.length),0);
 await page.click('#news-tab-event');assert.equal(await page.$eval('[data-news-empty="event"]',n=>n.hidden),false);
 await page.close();console.log('Homepage publication, dynamic tabs, escaped titles, failed/invalid feeds and unpublishing passed.');
 const folder='tmp/movable-type/ssi';for(const kind of ['staffblog','eventinfo'])fs.mkdirSync(folder+'/'+kind,{recursive:true});
 fs.copyFileSync('index.html',folder+'/index.html');
 for(const kind of ['staffblog','eventinfo'])fs.copyFileSync(kind+'/latest-cards.inc',folder+'/'+kind+'/latest-cards.inc');
 execFileSync(process.execPath,['tools/enable-movable-type-home.mjs',folder]);
 let ssi=fs.readFileSync(folder+'/index.html','utf8');
 assert.equal((ssi.match(/<!--#include virtual=/g)||[]).length,2);
 ssi=ssi.replace(/<!--#include virtual="\/([^\"]+)" -->/g,(_,file)=>fs.readFileSync(file,'utf8'));
 const noJS=await browser.newPage();await noJS.setJavaScriptEnabled(false);await noJS.goto(base,{waitUntil:'domcontentloaded'});await noJS.setContent(ssi,{waitUntil:'networkidle0'});await noJS.$eval('#journal-preview',n=>n.scrollIntoView());
 assert.equal(await noJS.$$eval('[data-news-category="blog"]',nodes=>nodes.filter(n=>n.offsetWidth>0).length),3);
 assert.equal(await noJS.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await noJS.close();
 console.log('SSI fragments preserve the no-JavaScript homepage layout. Actual MT compilation still requires the target CMS.');
}finally{await browser.close();}
