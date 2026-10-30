import fs from 'node:fs';
import path from 'node:path';

// Run after homepage section generators so inquiry links survive refresh/build.
const root = process.argv[2] || path.resolve(import.meta.dirname, '..');
const file = path.join(root, 'index.html');
let html = fs.readFileSync(file, 'utf8');
html = html.replace(/\s*<!-- SECTION INQUIRY -->[\s\S]*?<!-- END SECTION INQUIRY -->/g, '');
let count = 0;
html = html.replace(/<section\b([^>]*)>([\s\S]*?)<\/section>/g, (section, attributes, content) => {
  if (/\bhidden\b/.test(attributes) || /class="hybrid-hero"/.test(attributes)) return section;
  const heading = attributes.match(/aria-labelledby="([^"]+)"/)?.[1];
  if (!heading) throw new Error('Homepage section needs a labelled heading');
  count++;
  return `<section${attributes}>${content.trimEnd()}\n<!-- SECTION INQUIRY --><div class="section-inquiry"><a href="contact/" aria-describedby="${heading}"><span>お問い合わせ</span><span aria-hidden="true">→</span></a></div><!-- END SECTION INQUIRY -->\n</section>`;
});
// Keep the existing compact hero layout; its primary action becomes the inquiry.
html = html.replace(/<a href="consultation\/" data-consultation-location="hero">[\s\S]*?<\/a>/, '<a href="contact/" data-inquiry-location="hero">お問い合わせ →</a>');
fs.writeFileSync(file, html);
console.log(`Homepage inquiry actions: ${count} content sections plus hero.`);
