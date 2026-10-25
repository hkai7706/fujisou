import assert from 'node:assert/strict';
import puppeteer from 'puppeteer-core';
const browser=await puppeteer.launch({executablePath:process.env.CHROME_BINARY||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try{
  for(const path of ['','eventinfo/','staffblog/']){
    const page=await browser.newPage(),failed=[],requests=[];
    page.on('response',response=>{if(/\.(?:woff2?|ttf)(?:\?|$)/.test(response.url())){requests.push(response.url());if(!response.ok())failed.push(response.status()+' '+response.url());}});
    page.on('requestfailed',request=>{if(/\.(?:woff2?|ttf)(?:\?|$)/.test(request.url()))failed.push(request.url());});
    await page.goto('http://127.0.0.1:5501/'+path,{waitUntil:'networkidle0'});
    await page.evaluate(()=>document.fonts.ready);
    assert.deepEqual(failed,[],'Font downloads must succeed');
    assert.ok(requests.length>0,'Webfonts must actually load');
    assert.ok(requests.every(url=>new URL(url).origin==='http://127.0.0.1:5501'),'Fonts must be self-hosted');
    const session=await page.createCDPSession();await session.send('DOM.enable');await session.send('CSS.enable');
    const {root}=await session.send('DOM.getDocument');const {nodeId}=await session.send('DOM.querySelector',{nodeId:root.nodeId,selector:'main h1'});
    const {fonts}=await session.send('CSS.getPlatformFontsForNode',{nodeId});
    assert.ok(fonts.some(font=>font.isCustomFont),'Heading must render a downloaded font');
    assert.ok(fonts.every(font=>font.isCustomFont),'Heading must not silently fall back to OS fonts: '+JSON.stringify(fonts));
    console.log(`${path||'home'}: ${fonts.map(font=>font.familyName).join(' + ')}; ${requests.length} successful local font requests`);
    await page.close();
  }
}finally{await browser.close();}
