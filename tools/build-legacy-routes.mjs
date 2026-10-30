import fs from 'node:fs';
import path from 'node:path';
const project=path.resolve(import.meta.dirname,'..'),root=path.resolve(process.argv[2]||project);
const routes=JSON.parse(fs.readFileSync(path.join(project,'docs/legacy-routes.json'),'utf8'));
const esc=s=>s.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;');
const rules=[];
for(const [old,target] of Object.entries(routes)){
 const file=path.join(root,old.endsWith('/')?old+'index.html':old);
 const destination=path.join(root,target.endsWith('/')?target+'index.html':target);
 if(!fs.existsSync(destination))throw Error('Missing legacy destination '+target);
 if(fs.existsSync(file)&&!fs.readFileSync(file,'utf8').includes('data-legacy-redirect'))throw Error('Refusing to replace content '+old);
 const relative=(path.relative(path.dirname(file),path.join(root,target)).split(path.sep).join('/')||'.')+(target.endsWith('/')?'/':'');
 const href=relative||'./';
 fs.mkdirSync(path.dirname(file),{recursive:true});
 fs.writeFileSync(file,`<!doctype html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>ページを移動しました｜フジ創アイノス</title><meta name="description" content="フジ創アイノスの新しいページをご案内します。"><meta name="robots" content="noindex,follow" data-archive-robots><link rel="canonical" href="https://www.fujisou-ainos.com/${esc(target)}"><meta http-equiv="refresh" content="0;url=${esc(href)}"></head><body><!-- data-legacy-redirect --><main id="main"><p><a href="${esc(href)}">新しいページを見る →</a></p></main></body></html>\n`);
 const pattern=old.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+(old.endsWith('/')?'(?:index\\.(?:html|shtml))?':'');
 rules.push(`  RewriteRule ^${pattern}$ ${encodeURI(target)} [R=301,L,NE]`);
}
const htFile=path.join(root,'.htaccess');let ht=fs.readFileSync(htFile,'utf8');const block='# BEGIN ORIGINAL SITE ROUTES\n'+rules.join('\n')+'\n  # END ORIGINAL SITE ROUTES';
const marker=/# BEGIN ORIGINAL SITE ROUTES[\s\S]*?# END ORIGINAL SITE ROUTES/;
ht=marker.test(ht)?ht.replace(marker,block):ht.replace('RewriteEngine On','RewriteEngine On\n\n  '+block);fs.writeFileSync(htFile,ht);
console.log(`Built ${rules.length} Apache redirects and static legacy entry points.`);
