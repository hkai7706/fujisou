import {readFile,writeFile} from "node:fs/promises";
import {transform} from "lightningcss";
import {PurgeCSS} from "purgecss";
const css = await readFile("stylesheet/fujisou-ainos.css");
const markup = (await readFile('index.html', 'utf8')).replace(/<style\b[^>]*>[\s\S]*?<\/style>/g, '');
const [{ css: homepageCss }] = await new PurgeCSS().purge({
  content: [{raw:markup,extension:'html'}, "include/header.shtml", "include/footer.shtml", "script/fujisou-ainos.js"],
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

console.log("Homepage stylesheet rebuilt.");
