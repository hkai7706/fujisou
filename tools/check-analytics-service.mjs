import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import assert from 'node:assert/strict';
import {spawn,spawnSync} from 'node:child_process';
import {randomBytes,randomUUID} from 'node:crypto';
import {phpRuntime} from './php-runtime.mjs';
import puppeteer from 'puppeteer-core';
const root=path.resolve(import.meta.dirname,'..');
const build=spawnSync(process.execPath,['tools/build-analytics.mjs'],{cwd:root,stdio:'inherit'});assert.equal(build.status,0);
const php=phpRuntime(),runtime=(args,options={})=>spawnSync(php.binary,[...php.args,...args],{encoding:'utf8',...options});
for(const file of ['api.php','router.php','setup.php','private/bootstrap.php','private/config.example.php']){
  const lint=runtime(['-l',path.join(root,'analytics-service',file)]);assert.equal(lint.status,0,lint.stdout+lint.stderr);
}
assert.ok(runtime(['-r','echo implode(",", PDO::getAvailableDrivers());']).stdout.includes('sqlite'),'PDO SQLite must be enabled');
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'fujisou-analytics-'));
const password=randomBytes(24).toString('hex');
const hash=runtime(['-r','echo password_hash(getenv("TEST_PASSWORD"), PASSWORD_DEFAULT);'],{env:{...process.env,TEST_PASSWORD:password}}).stdout;
const origin='http://127.0.0.1:5501',base='http://127.0.0.1:5503';
const config={admin_name:'admin',password_hash:hash,secret:randomBytes(32).toString('hex'),data_dir:path.join(temp,'data'),portal_origins:[origin],sites:{preview:{label:'Local verification',origin,base_path:'/'},production:{label:'Production',origin:'https://www.fujisou-ainos.com',base_path:'/'}},retention_days:90};
const encoded=Buffer.from(JSON.stringify(config)).toString('base64');
fs.writeFileSync(path.join(temp,'config.php'),`<?php return json_decode(base64_decode('${encoded}'),true);`);
const server=spawn(php.binary,[...php.args,'-S','127.0.0.1:5503','-t',path.join(root,'analytics-service-dist'),path.join(root,'analytics-service-dist/router.php')],{env:{...process.env,ANALYTICS_CONFIG:path.join(temp,'config.php')},stdio:['ignore','ignore','pipe']});
let logs='';server.stderr.on('data',data=>logs+=data);
async function api(action,{method='GET',body,token,requestOrigin=origin,headers={}}={}){
  const response=await fetch(`${base}/api.php?action=${action}`,{method,headers:{Origin:requestOrigin,...(body?{'Content-Type':'application/json'}:{}),...(token?{Authorization:`Bearer ${token}`} : {}),...headers},body:typeof body==='string'?body:body?JSON.stringify(body):undefined});
  const text=await response.text();let data;try{data=JSON.parse(text);}catch{data=text;}return {status:response.status,data};
}
try{
  const setup=path.join(temp,'setup-check');fs.mkdirSync(path.join(setup,'private'),{recursive:true});
  fs.copyFileSync(path.join(root,'analytics-service/setup.php'),path.join(setup,'setup.php'));
  fs.copyFileSync(path.join(root,'analytics-service/private/config.example.php'),path.join(setup,'private/config.example.php'));
  const created=runtime([path.join(setup,'setup.php')],{input:password+'\n'+password+'\n'});assert.equal(created.status,0,created.stderr);
  const relocated=path.join(temp,'relocated-service');fs.renameSync(setup,relocated);
  const locationCheck=runtime(['-r','echo (require $argv[1])["data_dir"];',path.join(relocated,'private/config.php')]);
  assert.ok(path.normalize(locationCheck.stdout).endsWith(path.join(path.basename(temp),'relocated-service','private','data')),'Generated configuration must survive upload to another host');
  assert.equal(path.basename(locationCheck.stdout),'data');
  let ready=false;for(let i=0;i<50;i++){try{if((await api('status')).status===200){ready=true;break;}}catch{}await new Promise(resolve=>setTimeout(resolve,100));}assert.ok(ready,logs);
  assert.equal((await api('summary')).status,401);
  assert.equal((await api('status',{requestOrigin:'https://untrusted.example'})).status,403);
  assert.equal((await api('status',{method:'POST'})).status,405);
  assert.equal((await api('collect',{method:'OPTIONS'})).status,204);
  assert.equal((await api('collect',{method:'POST',body:'{bad'})).status,400);
  assert.equal((await api('collect',{method:'POST',body:'x'.repeat(17000)})).status,413);
  const event=(type,extra={})=>({id:randomUUID(),session:'local_test_session_123456',type,page:'/',referrer:'https://search.example',device:'mobile',...extra});
  const events=[event('view',{page:'/index.html'}),event('engagement',{engaged:15000,scroll:75}),event('link',{target:'tel:',channel:'phone'}),event('inquiry',{channel:'phone'})];
  assert.equal((await api('collect',{method:'POST',body:{site:'preview',events}})).data.accepted,4);
  assert.equal((await api('collect',{method:'POST',body:{site:'preview',events}})).data.accepted,0,'Events must deduplicate');
  assert.equal((await api('collect',{method:'POST',body:{site:'preview',events:[event('view',{page:'/?private=value'})]}})).data.accepted,0);
  assert.equal((await api('collect',{method:'POST',body:{site:'production',events}})).status,400);
  assert.equal((await api('collect',{method:'POST',body:{site:'preview',events:[event('view')]},headers:{'User-Agent':'Lighthouse'}})).data.accepted,0);
  for(const file of ['private/config.php','private/pages.json','private/data/traffic.sqlite','setup.php'])assert.equal((await fetch(`${base}/${file}`)).status,404);
  assert.equal((await api('login',{method:'POST',body:{username:'admin',password:'incorrect'}})).status,401);
  const login=await api('login',{method:'POST',body:{username:'admin',password}});assert.equal(login.status,200);assert.match(login.data.token,/^[a-f0-9]{64}$/);
  const token=login.data.token,today=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Tokyo',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  const report=await api(`summary&site=preview&start=${today}&end=${today}`,{token});assert.equal(report.status,200,JSON.stringify(report.data));
  assert.deepEqual(report.data.totals,{visits:1,views:1,actions:1,engaged:15000});assert.equal(report.data.links[0].target,'tel:');assert.equal(report.data.influence[0].action_visits,1);
  assert.equal((await api(`summary&site=production&start=${today}&end=${today}`,{token})).data.totals.views,0);
  assert.equal((await api('summary&site=preview&start=bad&end=bad',{token})).status,400);
  const browser=await puppeteer.launch({executablePath:process.env.CHROME_BINARY||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
  try{
    const page=await browser.newPage(),errors=[];page.on('pageerror',error=>errors.push(error.message));
    await page.goto(base+'/',{waitUntil:'networkidle0'});
    assert.equal(await page.$eval('#login-dialog',node=>node.open),true);
    await page.type('#endpoint',base+'/api.php');await page.type('#password',password);await page.click('#login-submit');
    await page.waitForFunction(()=>document.querySelector('#metric-visits').textContent==='1');
    for(const width of [390,1440]){
      await page.setViewport({width,height:900});
      for(const view of ['overview','pages','links','influence']){
        await page.click(`[data-view="${view}"]`);
        assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`Dashboard overflow: ${view} at ${width}`);
      }
    }
    assert.ok((await page.$eval('#links-body',node=>node.textContent)).includes('Phone call'));
    await page.select('#site','production');await page.waitForFunction(()=>document.querySelector('#metric-visits').textContent==='0');
    assert.ok((await page.$eval('#status',node=>node.textContent)).includes('No visits'));
    assert.equal(await page.evaluate(()=>Object.values(localStorage).some(value=>/^[a-f0-9]{64}$/.test(value))),false,'No admin token in persistent browser storage');
    await page.reload({waitUntil:'networkidle0'});assert.equal(await page.$eval('#login-dialog',node=>node.open),true);
    assert.deepEqual(errors,[],'Dashboard browser errors');
    console.log('Dashboard Chrome checks passed: login, real reports, empty state, four views, mobile/desktop layout and reload protection.');
  }finally{await browser.close();}
  assert.equal((await api('logout',{method:'POST',token})).status,200);assert.equal((await api('summary',{token})).status,401);
  for(let i=0;i<5;i++)assert.equal((await api('login',{method:'POST',body:{username:'admin',password:'wrong'}})).status,401);
  assert.equal((await api('login',{method:'POST',body:{username:'admin',password:'wrong'}})).status,429);
  console.log('Analytics PHP integration passed: authentication, collection, deduplication, privacy validation, reports, site isolation, private paths and rate limits.');
}finally{
  server.kill();await new Promise(resolve=>server.once('exit',resolve));fs.rmSync(temp,{recursive:true,force:true});
}
