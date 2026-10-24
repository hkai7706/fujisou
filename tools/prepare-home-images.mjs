import fs from 'node:fs';
import sharp from 'sharp';

const poster = 'img/eventinfo/tonami-open-house-until-oct18.webp';
const logo = 'img/common/ainos-logo.webp';
for (const width of [420, 640, 840, 1240]) {
  await sharp(poster).resize({ width, withoutEnlargement: true }).webp({ quality: 82, effort: 6 }).toFile(poster.replace('.webp', `-display-${width}.webp`));
}
for (const width of [240, 480]) {
  await sharp(logo).resize({ width, withoutEnlargement: true }).webp({ quality: 90, smartSubsample: true, effort: 6 }).toFile(logo.replace('.webp', `-${width}.webp`));
}
// Update source fragments; the normal embed step propagates these to all pages.
for (const file of ['include/header.shtml', 'include/footer.shtml']) {
  let html = fs.readFileSync(file, 'utf8');
  html = html.replace(/<img\b[^>]*src="\/img\/common\/ainos-logo[^\"]*"[^>]*>/g, tag => {
    const sizes = file.includes('header') ? '(max-width:760px) 128px, (max-width:1120px) 205px, 260px' : '(max-width:540px) 160px, (max-width:820px) 180px, 260px';
    return tag.replace(/\s(?:srcset|sizes)="[^"]*"/g, '').replace(/src="[^"]*"/, 'src="/img/common/ainos-logo-480.webp"')
      .replace(/>$/, ` srcset="/img/common/ainos-logo-240.webp 240w, /img/common/ainos-logo-480.webp 480w, /img/common/ainos-logo.webp 720w" sizes="${sizes}">`);
  });
  fs.writeFileSync(file, html);
}
let html = fs.readFileSync('index.html', 'utf8');
html = html.replace(/<img\b[^>]*src="img\/eventinfo\/tonami-open-house-until-oct18[^\"]*"[^>]*>/g, tag => tag
  .replace(/src="[^"]*"/, 'src="img/eventinfo/tonami-open-house-until-oct18-display-840.webp"')
  .replace(/srcset="[^"]*"/, `srcset="${[420,640,840,1240].map(width => `img/eventinfo/tonami-open-house-until-oct18-display-${width}.webp ${width}w`).join(', ')}"`)
  .replace(/sizes="[^"]*"/, 'sizes="(max-width:540px) calc(100vw - 60px), (max-width:760px) 500px, (max-width:1120px) 50vw, 560px"'));
fs.writeFileSync('index.html', html);
console.log('Prepared responsive homepage images; originals preserved.');
