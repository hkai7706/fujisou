import {test} from 'node:test';
import assert from 'node:assert/strict';
import {addInquiries} from './build-site-inquiries.mjs';

test('nested sections receive separate actions without editing forms or script text', () => {
  const form='<form><section><input name="email"></section></form>';
  const source=`<html><head></head><body><main><section aria-labelledby="outer"><h2 id="outer">Outer</h2><section>Inner</section>${form}</section><script>const x="<section>not markup</section>";</script></main></body></html>`;
  const result=addInquiries(source,'../../contact/','../../stylesheet/section-inquiries.css');
  assert.equal(result.count,2);
  assert.ok(result.html.includes(form));
  assert.ok(result.html.includes('const x="<section>not markup</section>";'));
  assert.equal((result.html.match(/href="\.\.\/\.\.\/contact\/"/g)||[]).length,2);
  assert.ok(result.html.includes('aria-describedby="outer"'));
  assert.equal(addInquiries(result.html,'../../contact/','../../stylesheet/section-inquiries.css').html,result.html);
});

test('archives get one action, while redirects and hidden sections are excluded', () => {
  assert.equal(addInquiries('<head></head><main><article>Archive card</article></main>','contact/','style.css').count,1);
  const result=addInquiries('<head></head><main><section hidden><section>Expired</section></section><section>Visible</section></main>','contact/','style.css');
  assert.equal(result.count,1);
  assert.ok(result.html.includes('<section hidden><section>Expired</section></section>'));
  assert.equal(addInquiries('<head><meta http-equiv="refresh" content="0;url=../"></head><main>Redirect</main>','contact/','style.css').count,0);
});
