import test from 'node:test';
import assert from 'node:assert/strict';
import {japanDate,renderEventState} from './event-state.mjs';

test('static event state expires at Japan midnight without JavaScript',()=>{
  const html='<section data-event-end="2026-10-18" data-event-promotion><div><p data-event-active>Open</p><p data-event-closed hidden>Ended</p></div></section>';
  assert.equal(japanDate(Date.parse('2026-10-18T15:00:00Z')),'2026-10-19');
  const ended=renderEventState(html,'2026-10-19');
  assert.match(ended,/<section[^>]* hidden>/);
  assert.match(ended,/<p data-event-active hidden>/);
  assert.match(ended,/<p data-event-closed>/);
  assert.equal(renderEventState(ended,'2026-10-19'),ended);
  assert.equal(renderEventState(ended,'2026-10-18'),html);
});
test('nested event scopes, void elements and script templates do not leak state',()=>{
  const html='<section data-event-end="2026-10-18"><img src="a.webp"><div data-event-end="2027-01-01"><span data-event-active>Future</span></div><script>const template="<div data-event-active>";</script><span data-event-closed hidden>Past</span></section><p data-event-active>Unrelated</p>';
  const rendered=renderEventState(html,'2026-10-24');
  assert.match(rendered,/<span data-event-active>Future/);
  assert.match(rendered,/<span data-event-closed>Past/);
  assert.match(rendered,/<p data-event-active>Unrelated/);
  assert.ok(rendered.includes('<script>const template="<div data-event-active>";</script>'));
});
