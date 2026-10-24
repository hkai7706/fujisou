import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source=fs.readFileSync(new URL('../script/event-status.js',import.meta.url),'utf8');
test('event expiration follows midnight in Japan, including year rollover',()=>{
  for(const [timestamp,end,ended] of [
    ['2026-10-18T14:59:59.999Z','2026-10-18',false],
    ['2026-10-18T15:00:00.000Z','2026-10-18',true],
    ['2026-12-31T14:59:59.999Z','2026-12-31',false],
    ['2026-12-31T15:00:00.000Z','2026-12-31',true]
  ]) {
    const active={hidden:null},closed={hidden:null};
    const section={dataset:{eventEnd:end},querySelectorAll:selector=>selector==='[data-event-active]'?[active]:[closed]};
    class Clock extends Date {static now(){return Date.parse(timestamp);}}
    vm.runInNewContext(source,{Date:Clock,document:{querySelectorAll:()=>[section]}});
    assert.equal(active.hidden,ended,timestamp);
    assert.equal(closed.hidden,!ended,timestamp);
  }
});
