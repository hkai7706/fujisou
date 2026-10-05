import { readFile, writeFile } from "node:fs/promises";
import sharp from "sharp";
import { transform } from "lightningcss";
import { PurgeCSS } from "purgecss";

const images = [
  ["images/ainos-bridal-house-logo.png", "images/ainos-logo-360.webp", 360, 88],
  ["images/ainos-bridal-house-logo.png", "images/ainos-logo-720.webp", 720, 88],
  ["images/slide1.jpg", "images/slide1-768.webp", 768, 82],
  ["images/slide1.jpg", "images/slide1-1440.webp", 1440, 84],
  ["images/natural-room.webp", "images/natural-room-480.webp", 480, 80],
  ["images/natural-room.webp", "images/natural-room-900.webp", 900, 82],
  ["images/footer-bg-white.jpg", "images/footer-bg-white.webp", 1600, 78],
];

await Promise.all(images.map(async ([input, output, width, quality]) => {
  await sharp(input)
    .resize({ width, withoutEnlargement: true })
    .webp({ quality, effort: 6, smartSubsample: true })
    .toFile(output);
}));

const css = await readFile("stylesheet/fujisou-ainos.css");
const [{ css: homepageCss }] = await new PurgeCSS().purge({
  content: ["index.html", "script/fujisou-ainos.js"],
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
