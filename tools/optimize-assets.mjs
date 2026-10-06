import { readFile, writeFile } from "node:fs/promises";
import sharp from "sharp";
import { transform } from "lightningcss";
import { PurgeCSS } from "purgecss";

const images = [
  ["img/common/ainos-bridal-house-logo.png", "img/common/ainos-logo-360.webp", 360, 88],
  ["img/common/ainos-bridal-house-logo.png", "img/common/ainos-logo-720.webp", 720, 88],
  ["img/home/slide1.jpg", "img/home/slide1-768.webp", 768, 82],
  ["img/home/slide1.jpg", "img/home/slide1-1440.webp", 1440, 84],
  ["img/home/natural-room.webp", "img/home/natural-room-480.webp", 480, 80],
  ["img/home/natural-room.webp", "img/home/natural-room-720.webp", 720, 81],
  ["img/home/natural-room.webp", "img/home/natural-room-900.webp", 900, 82],
  ["img/common/footer-bg-white.jpg", "img/common/footer-bg-white.webp", 1600, 78],
];

await Promise.all(images.map(async ([input, output, width, quality]) => {
  await sharp(input)
    .resize({ width, withoutEnlargement: true })
    .webp({ quality, effort: 6, smartSubsample: true })
    .toFile(output);
}));

const css = await readFile("stylesheet/fujisou-ainos.css");
const [{ css: homepageCss }] = await new PurgeCSS().purge({
  content: ["index.html", "include/header.shtml", "include/footer.shtml", "script/fujisou-ainos.js"],
  css: [{ raw: css.toString(), extension: "css" }],
  safelist: {
    greedy: [/^is-/, /^has-/, /^js$/, /^no-scroll$/],
  },
  keyframes: true,
  fontFace: true,
});
const homepageMinified = transform({
  filename: "fujisou-ainos.home.css",
  code: Buffer.from(homepageCss),
  minify: true,
  sourceMap: false,
});
await writeFile("stylesheet/fujisou-ainos.home.min.css", homepageMinified.code);

console.log("Responsive images and minified CSS generated.");
