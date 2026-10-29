import assert from 'node:assert/strict';
import puppeteer from 'puppeteer-core';
const browser=await puppeteer.launch({executablePath:process.env.CHROME_BINARY||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
try{
 const page=await browser.newPage();
 await page.setViewport({width:1440,height:900});
 await page.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'no-preference'}]);
 // Speed up only the production seven-second slideshow timer, keeping its
 // actual scheduling and event behavior intact for several complete cycles.
 await page.evaluateOnNewDocument(()=>{
  const original=window.setTimeout;
  window.__heroTimerRequests=0;
  window.setTimeout=function(callback,ms,...args){
   if(ms===7000){window.__heroTimerRequests++;return original(callback,120,...args);}
   return original(callback,ms,...args);
  };
 });
 await page.goto('http://127.0.0.1:5501/',{waitUntil:'networkidle0'});
 await page.evaluate(()=>{
  window.__heroChanges=[];
  new MutationObserver(()=>{
   const current=document.querySelector('[data-hybrid-dot][aria-current="true"]');
   const value=Number(current.dataset.hybridDot);
   if(window.__heroChanges.at(-1)!==value)window.__heroChanges.push(value);
  }).observe(document.querySelector('.hybrid-hero__controls'),{subtree:true,attributes:true,attributeFilter:['aria-current']});
 });
 const cycles=async()=>{
  await page.evaluate(()=>window.__heroChanges=[]);
  await page.waitForFunction(()=>window.__heroChanges.length>=7);
  const values=await page.evaluate(()=>window.__heroChanges.slice(0,7));
  for(let i=1;i<values.length;i++)assert.equal(values[i],(values[i-1]+1)%3,JSON.stringify(values));
 };
 await cycles();
 assert.ok(await page.evaluate(()=>window.__heroTimerRequests>7));
 await page.hover('.hybrid-hero');await cycles();
 await page.click('[data-hybrid-dot="2"]');await cycles();
 console.log('Automatic 1→2→3→1 looping continues over multiple cycles, on hover and after dot clicks.');
 await page.keyboard.press('Tab');
 await page.$eval('[data-hybrid-dot="0"]',e=>e.focus());
 await page.waitForFunction(()=>document.querySelector('.hybrid-hero').hasAttribute('data-paused'));
 const active=()=>page.$eval('[data-hybrid-dot][aria-current="true"]',e=>e.dataset.hybridDot);
 const focused=await active();await delay(500);assert.equal(await active(),focused);
 await page.evaluate(()=>document.activeElement.blur());await cycles();
 await page.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);
 await page.waitForFunction(()=>document.querySelector('.hybrid-hero').hasAttribute('data-paused'));
 const reduced=await active();await delay(500);assert.equal(await active(),reduced);
 await page.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'no-preference'}]);await cycles();
 // A cancelled phone gesture must never strand the timer in a paused state.
 await page.evaluate(()=>{
  const hero=document.querySelector('.hybrid-hero');
  const event=new Event('touchstart');Object.defineProperty(event,'changedTouches',{value:[{clientX:100}]});hero.dispatchEvent(event);
 });
 assert.equal(await page.$eval('.hybrid-hero',e=>e.hasAttribute('data-paused')),true);
 await page.$eval('.hybrid-hero',e=>e.dispatchEvent(new Event('touchcancel')));await cycles();
 console.log('Keyboard-focus pause/resume, reduced-motion changes and cancelled touch gestures passed.');
}finally{await browser.close();}
