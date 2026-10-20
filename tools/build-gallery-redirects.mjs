import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const names=JSON.parse(fs.readFileSync(path.join(root,'gallery/project-renames.json'),'utf8')).names;
const projects=JSON.parse(fs.readFileSync(path.join(root,'gallery/projects.json'),'utf8'));
const escape=value=>String(value).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const rules=[];
for(const [oldId,id]of Object.entries(names)){
  if(!/^[a-z0-9-]+$/.test(oldId)||!/^[a-z][a-z0-9-]+$/.test(id))throw Error('Invalid gallery rename');
  const destination=id+'.shtml',legacy=oldId+'.shtml';
  if(!projects.some(p=>p.file===destination)||!fs.existsSync(path.join(root,'gallery',destination)))throw Error('Missing renamed article: '+destination);
  const stub=`<!doctype html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>施工事例のページを移動しました｜フジ創アイノス</title><meta name="description" content="施工事例の新しいページをご案内します。"><meta name="robots" content="noindex,follow" data-archive-robots><link rel="canonical" href="https://www.fujisou-ainos.com/gallery/${destination}"><meta http-equiv="refresh" content="0;url=${destination}"></head><body><!-- data-gallery-redirect --><main id="main"><p><a href="${escape(destination)}">施工事例の新しいページを見る</a></p></main></body></html>\n`;
  const file=path.join(root,'gallery',legacy);
  if(fs.existsSync(file)&&!fs.readFileSync(file,'utf8').includes('data-gallery-redirect'))throw Error('Refusing to overwrite a real article: '+legacy);
  if(!fs.existsSync(file)||fs.readFileSync(file,'utf8')!==stub)fs.writeFileSync(file,stub);
  rules.push(`  RewriteRule ^gallery/${oldId}\\.shtml$ gallery/${destination} [R=301,L]`);
}
const file=path.join(root,'.htaccess');let ht=fs.readFileSync(file,'utf8');
const block='# BEGIN GALLERY DESCRIPTIVE URLS\n'+rules.join('\n')+'\n  # END GALLERY DESCRIPTIVE URLS';
const marker=/# BEGIN GALLERY DESCRIPTIVE URLS[\s\S]*?# END GALLERY DESCRIPTIVE URLS/;
ht=marker.test(ht)?ht.replace(marker,block):ht.replace('RewriteEngine On','RewriteEngine On\n\n  '+block);
if(fs.readFileSync(file,'utf8')!==ht)fs.writeFileSync(file,ht);
console.log(`Prepared ${rules.length} Apache redirects and GitHub-compatible legacy pages.`);
