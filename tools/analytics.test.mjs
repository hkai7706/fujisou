import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {randomUUID} from 'node:crypto';
const code=fs.readFileSync(new URL('../script/analytics.js',import.meta.url),'utf8');
function run({endpoint='https://analytics.example/api.php',privacy=false,optout=false,path='/fujisou/index.html'}={}){
  const sent=[],listeners={},windowListeners={},stored=new Map(),local=new Map(optout?[['fujisou-analytics-optout','1']]:[]);
  const storage=map=>({getItem:key=>map.get(key)??null,setItem:(key,value)=>map.set(key,value)});
  const context={window:{FUJISOU_ANALYTICS:{endpoint,sites:[{id:'preview',origin:'https://hkai7706.github.io',basePath:'/fujisou/'}]},addEventListener:(name,fn)=>windowListeners[name]=fn},document:{querySelector:()=>null,referrer:'https://search.example/find?private=value',hidden:false,hasFocus:()=>true,addEventListener:(name,fn)=>listeners[name]=fn,documentElement:{scrollHeight:2000}},location:{origin:'https://hkai7706.github.io',pathname:path},navigator:{globalPrivacyControl:privacy,userAgent:'Mobile',sendBeacon:(url,blob)=>{sent.push(blob);return true;}},sessionStorage:storage(stored),localStorage:storage(local),crypto:{randomUUID},URL,Blob,performance:{now:()=>100},setInterval:()=>{},innerHeight:800,scrollY:0};
  vm.runInNewContext(code,context);
  return {sent,stored,listeners,windowListeners,local,events:async()=> (await Promise.all(sent.map(blob=>blob.text()))).flatMap(body=>JSON.parse(body).events)};
}
test('disabled configuration and privacy preferences create no session or traffic',()=>{
  for(const options of [{endpoint:''},{privacy:true},{optout:true},{path:'/other/'}]){
    const app=run(options);assert.equal(app.sent.length,0);assert.equal(app.stored.size,0);
  }
});
test('views normalize index paths and omit queries and full referrers',async()=>{
  const app=run(),events=await app.events();assert.equal(events.length,1);assert.equal(events[0].page,'/');assert.equal(events[0].referrer,'https://search.example');assert.equal(events[0].device,'mobile');assert.ok(!JSON.stringify(events).includes('private'));
});
test('phone clicks store a channel marker, never the phone number',async()=>{
  const app=run();const anchor={href:'tel:0123456789',hasAttribute:()=>false,closest:()=>null};
  app.listeners.click({target:{closest:()=>anchor}});
  const events=await app.events();assert.equal(events[1].target,'tel:');assert.equal(events[1].channel,'phone');assert.ok(!JSON.stringify(events).includes('0123456789'));
});
test('inquiry hooks are separate from link activity and optout stops later events',async()=>{
  const app=run();app.windowListeners.inquiry_click({detail:{channel:'line',placement:'header'}});
  assert.equal((await app.events()).filter(event=>event.type==='inquiry').length,1);
  app.local.set('fujisou-analytics-optout','1');app.windowListeners.inquiry_click({detail:{channel:'phone'}});
  assert.equal((await app.events()).length,2);
});
