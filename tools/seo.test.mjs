import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { origin, pageSchema, sharingImage } from './seo-helpers.mjs';

const project = path.resolve(import.meta.dirname, '..');
test('breadcrumbs resolve nested links and preserve Japanese text safely', () => {
  const html = '<nav class="site-breadcrumbs"><ol><li><a href="../../../">ホーム</a></li><li> / <a href="../../hiraya/">平屋住宅</a></li><li><span>Cute &amp; 家</span></li></ol></nav>';
  const canonical = origin + 'plans/products/cute/';
  const schema = JSON.parse(pageSchema(html, canonical, 'Cute', '住まい', origin + 'image.webp').match(/>(.*)<\/script>/)[1]);
  assert.deepEqual(schema['@graph'][1].itemListElement.map(item => item.item), [origin, origin + 'plans/hiraya/', canonical]);
  assert.equal(schema['@graph'][1].itemListElement[2].name, 'Cute & 家');
});
test('missing images and directory URLs fall back to a deployed photograph', () => {
  for (const value of [origin + 'missing.jpg', origin + 'policy/', '']) {
    assert.equal(sharingImage(`<meta property="og:image" content="${value}">`, origin + 'policy/', project), origin + 'img/home/slide1-1440.webp');
  }
});
test('SEO rebuild is stable and production removes only preview noindex', () => {
  const parent = path.join(project, 'dist');
  fs.mkdirSync(parent, { recursive: true });
  const fixture = fs.mkdtempSync(path.join(parent, 'seo-test-'));
  const copy = relative => {
    const target = path.join(fixture, relative);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(path.join(project, relative), target);
  };
  try {
    for (const file of ['index.html', 'contact/thanks.html', 'img/home/slide1-1440.webp', '.htaccess']) copy(file);
    const run = production => {
      const result = spawnSync(process.execPath, [path.join(project, 'tools/prepare-seo.mjs'), fixture, ...(production ? ['--production'] : [])], { encoding: 'utf8' });
      assert.equal(result.status, 0, result.stderr);
    };
    run(false);
    const preview = fs.readFileSync(path.join(fixture, 'index.html'), 'utf8');
    assert.match(preview, /data-preview-robots/);
    run(false);
    assert.equal(fs.readFileSync(path.join(fixture, 'index.html'), 'utf8'), preview);
    run(true);
    assert.doesNotMatch(fs.readFileSync(path.join(fixture, 'index.html'), 'utf8'), /name="robots"[^>]*noindex/);
    assert.match(fs.readFileSync(path.join(fixture, 'contact/thanks.html'), 'utf8'), /data-archive-robots/);
    assert.doesNotMatch(fs.readFileSync(path.join(fixture, '.htaccess'), 'utf8'), /BEGIN PREVIEW INDEXING/);
    run(false);
    assert.match(fs.readFileSync(path.join(fixture, '.htaccess'), 'utf8'), /BEGIN PREVIEW INDEXING/);
  } finally {
    assert.ok(fixture.startsWith(parent + path.sep));
    fs.rmSync(fixture, { recursive: true });
  }
});
