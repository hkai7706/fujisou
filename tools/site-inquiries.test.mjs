import {test} from 'node:test';
import assert from 'node:assert/strict';
import {removeInquiries} from './build-site-inquiries.mjs';

test('generated section inquiry actions and their stylesheet are removed',()=>{
  const source='<head><link rel="stylesheet" href="section-inquiries.css" data-section-inquiries></head><main><section>Keep<!-- SECTION INQUIRY --><div class="section-inquiry"><a href="contact/">お問い合わせ</a></div><!-- END SECTION INQUIRY --></section></main>';
  const result=removeInquiries(source);
  assert.equal(result.count,1);
  assert.equal(result.html.includes('section-inquiry'),false);
  assert.match(result.html,/<section>Keep\s*<\/section>/);
  assert.equal(removeInquiries(result.html).html,result.html);
});

test('normal contact and consultation links are preserved',()=>{
  const source='<main><a href="contact/">お問い合わせ</a><a href="consultation/">無料相談</a></main>';
  assert.equal(removeInquiries(source).html,source);
});
