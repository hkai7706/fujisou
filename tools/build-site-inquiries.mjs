import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const marker = '<!-- SECTION INQUIRY -->';
export function addInquiries(source, contactHref, cssHref) {
  let html = source.replace(/\r?\n?<!-- SECTION INQUIRY -->[\s\S]*?<!-- END SECTION INQUIRY -->\r?\n?/g, '');
  html = html.replace(/<link\b[^>]*data-section-inquiries[^>]*>\s*/g, '');
  if (!/<main\b/i.test(html) || /http-equiv=["']refresh/i.test(html)) return {html:source, count:0};
  const inserts = [], stack = [];
  let main = null, count = 0;
  const button = heading => `${marker}<div class="section-inquiry"><a href="${contactHref}"${heading ? ` aria-describedby="${heading}"` : ''}><span>お問い合わせ</span><span aria-hidden="true">→</span></a></div><!-- END SECTION INQUIRY -->`;
  // Ignore comments and raw script/style text; retain original HTML byte for byte.
  const tokens = /<!--[\s\S]*?-->|<(script|style)\b[^>]*>[\s\S]*?<\/\1\s*>|<\/?([a-z][\w:-]*)\b(?:[^>"']|"[^"]*"|'[^']*')*>/gi;
  for (const token of html.matchAll(tokens)) {
    const tag = token[2]?.toLowerCase();
    if (!tag) continue;
    if (token[0].startsWith('</')) {
      const index = stack.findLastIndex(node => node.tag === tag);
      if (index < 0) continue;
      const node = stack[index];
      if (tag === 'section' && node.eligible) {
        inserts.push({at:token.index, text:`\n${button(node.heading)}\n`});
        count++;
      }
      if (tag === 'main' && main === node) {
        if (!count) { inserts.push({at:token.index, text:`\n${button('')}\n`}); count++; }
        main = null;
      }
      stack.length = index;
      continue;
    }
    if (/^(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)$/.test(tag)) continue;
    const blocked = stack.some(node => node.blocked) || /\shidden(?:\s|=|>)/i.test(token[0]) || tag === 'form' || tag === 'template';
    const node = {tag, blocked};
    if (tag === 'main') main = node;
    if (tag === 'section' && main && !blocked && !/class="[^"]*(?:hybrid-hero|page-hero)/.test(token[0])) {
      node.eligible = true;
      node.heading = token[0].match(/aria-labelledby="([\w-]+)"/)?.[1] || '';
    }
    stack.push(node);
  }
  for (const insert of inserts.sort((a,b) => b.at-a.at)) html = html.slice(0,insert.at)+insert.text+html.slice(insert.at);
  html = html.replace(/[ \t]+(\r?\n<!-- SECTION INQUIRY -->)/g, '$1');
  if (count) html = html.replace('</head>', `<link rel="stylesheet" href="${cssHref}" data-section-inquiries>\n</head>`);
  return {html, count};
}

export function build(root) {
  const skip = new Set(['.git','node_modules','tools','docs','source','dist','backup','tmp','.tmp','output','cms','mailformpro','mfp.statics','iplogs','originals','analytics-portal','analytics-service','analytics-portal-dist','analytics-service-dist']);
  let pages=0, actions=0;
  function walk(dir) {
    for (const entry of fs.readdirSync(dir,{withFileTypes:true})) {
      if (skip.has(entry.name)) continue;
      const file=path.join(dir,entry.name);
      if (entry.isDirectory()) { walk(file); continue; }
      if (!/\.(html|shtml)$/.test(entry.name)) continue;
      // The inquiry form and its confirmation/runtime screens are destinations,
      // not places for repeated links back to themselves. Preserve them exactly.
      if (path.relative(root,file).split(path.sep)[0] === 'contact') continue;
      const source=fs.readFileSync(file,'utf8');
      const relative=target => path.relative(path.dirname(file),path.join(root,target)).split(path.sep).join('/');
      const result=addInquiries(source,relative('contact')+'/',relative('stylesheet/section-inquiries.css'));
      if (result.count) { pages++; actions+=result.count; }
      if (source!==result.html) fs.writeFileSync(file,result.html);
    }
  }
  walk(root);
  console.log(`Site inquiry actions: ${actions} content sections across ${pages} pages; contact forms preserved.`);
}
if (process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) build(path.resolve(process.argv[2] || path.join(import.meta.dirname,'..')));
