import assert from 'node:assert/strict';
import fs from 'node:fs';
import puppeteer from 'puppeteer-core';

const paths=['','concept/','staff/','policy/','renovation/','performance/','cost/','aftercare/','consultation/','contact/','land-info/','shikkui/','process/','loan-simulation/','gallery/','gallery/uozu-inner-garage-house.shtml','staffblog/','staffblog/2019-07-16-自由と企画-post-4.shtml','eventinfo/','eventinfo/open-house/','plans/hiraya/','plans/two-story/','plans/custom/','plans/products/simply/','plans/products/pretty/','plans/products/healthy/','plans/products/smart/','plans/products/cute/','plans/products/premium/','plans/products/hirayahouse/','videos/','videos/modern-hiraya-black-wood/'];
const base=process.env.PREVIEW_URL||'http://127.0.0.1:5501/';
const browser=await puppeteer.launch({executablePath:process.env.CHROME_BINARY||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
fs.mkdirSync('tmp/mobile-project',{recursive:true});
try{
 const page=await browser.newPage();
 await page.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);
 for(const width of [320,390,768]){
  await page.setViewport({width,height:844,isMobile:width<768,hasTouch:true});
  for(const path of paths){
   const response=await page.goto(new URL(path,base).href,{waitUntil:'load'});
   assert.equal(response.status(),200,path);await page.evaluate(()=>document.fonts.ready);
   await page.evaluate(async()=>{
    const height=document.documentElement.scrollHeight;
    for(let top=0;top<height;top+=700){window.scrollTo({top,behavior:'instant'});await new Promise(resolve=>requestAnimationFrame(resolve));}
    window.scrollTo({top:0,behavior:'instant'});
   });
   const result=await page.evaluate(()=>{
    const outside=[],clipped=[],small=[],inputs=[];
    const visible=e=>e.checkVisibility({checkOpacity:true,checkVisibilityCSS:true})&&!e.closest('[aria-hidden="true"]');
    for(const e of document.querySelectorAll('main :is(h1,h2,h3,p,table,figure,img,form,input,select,textarea,button,summary,a)')){
     if(!visible(e))continue;const r=e.getBoundingClientRect();if(r.width<1||r.height<1)continue;
     let inScroller=false;
     for(let a=e.parentElement;a&&a!==document.body;a=a.parentElement){if(['auto','scroll'].includes(getComputedStyle(a).overflowX)&&a.scrollWidth>a.clientWidth){inScroller=true;break;}}
     const name=e.tagName+'.'+e.className;
     if(!inScroller&&(r.left< -2||r.right>innerWidth+2))outside.push(name);
     if(['H1','H2','H3','P'].includes(e.tagName)&&e.scrollWidth>e.clientWidth+3)clipped.push(name+': '+e.textContent.slice(0,40));
     if(['BUTTON','SUMMARY'].includes(e.tagName)&&r.height<44)small.push(name);
     if(['INPUT','SELECT','TEXTAREA'].includes(e.tagName)&&!['checkbox','radio','hidden'].includes(e.type)&&parseFloat(getComputedStyle(e).fontSize)<16)inputs.push(name);
    }
    return {overflow:document.documentElement.scrollWidth>innerWidth,outside,clipped,small,inputs};
   });
   assert.equal(result.overflow,false,`${path} ${width}`);
   for(const key of ['outside','clipped','small','inputs'])assert.deepEqual(result[key],[],`${path||'homepage'} ${width}px ${key}`);
   if(width===390&&['plans/hiraya/','plans/products/simply/','performance/','loan-simulation/','gallery/'].includes(path)){
    await page.screenshot({path:`tmp/mobile-project/${path.replaceAll('/','-')}.png`});
   }
  }
  console.log(`${width}px: ${paths.length} page samples passed overflow, heading, touch-target and form-size checks.`);
 }
 await page.setViewport({width:390,height:844,isMobile:true,hasTouch:true});
 for(const path of ['','staffblog/','plans/hiraya/','contact/']){
  await page.goto(new URL(path,base).href,{waitUntil:'networkidle0'});
  await page.click('.shared-header__toggle');
  assert.equal(await page.$eval('[data-shared-header]',e=>e.hasAttribute('data-menu-open')),true);
  await page.keyboard.press('Escape');
  assert.equal(await page.$eval('[data-shared-header]',e=>e.hasAttribute('data-menu-open')),false);
 }
 await page.goto(new URL('performance/',base).href,{waitUntil:'networkidle0'});
 const client=await page.createCDPSession();
 const {nodes}=await client.send('Accessibility.getFullAXTree');
 assert.ok(nodes.some(n=>n.role?.value==='table'),'Specification table semantics retained');
 assert.ok(nodes.some(n=>n.role?.value==='rowheader'),'Row labels remain table headers');
 assert.equal(await page.$eval('.evidence-table tr',e=>getComputedStyle(e).gridTemplateColumns.split(' ').length),1);
 await page.goto(new URL('loan-simulation/',base).href,{waitUntil:'networkidle0'});
 await page.evaluate(()=>{
  for(const [id,value] of [['loan-building','3000'],['loan-rate','1.5']]){
   const input=document.getElementById(id);input.value=value;input.dispatchEvent(new Event('input',{bubbles:true}));
  }
 });
 await page.click('.loan-form button[type="submit"]');
 assert.ok(await page.$eval('.loan-result',e=>e.checkVisibility()),'Loan results still appear on mobile');
 await page.setJavaScriptEnabled(false);
 await page.goto(new URL('plans/hiraya/',base).href,{waitUntil:'networkidle0'});
 assert.ok(await page.$eval('main h1',e=>e.getBoundingClientRect().height>0));
 console.log('Mobile menu/Escape, accessible specification tables, loan calculation and no-JS content passed.');
}finally{await browser.close();}
