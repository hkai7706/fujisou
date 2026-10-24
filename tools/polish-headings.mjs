import fs from 'node:fs';import path from 'node:path';
const skip=new Set(['analytics-portal','analytics-service','analytics-portal-dist','analytics-service-dist','backup','dist','tmp','.git','node_modules','tools','server']);const changed=[];
function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){if(skip.has(e.name))continue;const file=path.join(dir,e.name);if(e.isDirectory())walk(file);else if(e.name.endsWith('.html'))polish(file);}}
function polish(file){let html=fs.readFileSync(file,'utf8');let count=0;html=html.replace(/<main\b[\s\S]*?<\/main>/g,main=>main.replace(/<(h[12])([^>]*)>([\s\S]*?)<\/\1>/g,(original,tag,attrs,body)=>{
if(/phrase-heading|<svg|<img|<a\b/i.test(original))return original;
const plain=body.replace(/<[^>]*>/g,'').trim();if(!/[\u3040-\u9fff]/.test(plain))return original;
let parts=body.split(/<br\s*\/?\s*>/i);if(parts.length===1&& !/<[^>]+>/.test(body)&&plain.length>=13&&plain.includes('、'))parts=body.split(/(?<=、)/);
if(parts.length===1)return original;
const texts=parts.map(s=>s.replace(/<[^>]*>/g,'').trim());if(texts.some(s=>!s||s.length>20))return original;
attrs=attrs.includes('class=')?attrs.replace(/class="([^"]*)"/,'class="$1 phrase-heading"'):attrs+' class="phrase-heading"';count++;
return `<${tag}${attrs}>${parts.map((s,i)=>{const length=[...texts[i]].reduce((n,c)=>n+(/[\x00-\x7f]/.test(c)?.6:1),0);return `<span class="heading-phrase" style="--phrase-length:${(length+0.6).toFixed(1)}">${s}</span>`;}).join('')}</${tag}>`;
}));if(count){fs.writeFileSync(file,html);changed.push({file,count});}}
walk('.');fs.writeFileSync('tmp/heading-polish-report.json',JSON.stringify(changed,null,2));console.log('Updated',changed.length,'pages;',changed.reduce((n,p)=>n+p.count,0),'headings.');
const file='stylesheet/fujisou-ainos.css';let css=fs.readFileSync(file,'utf8');const marker='/* Complete Japanese heading phrases across the site. */';if(!css.includes(marker)){css+=`\n${marker}\nmain :is(h1,h2){word-break:normal;line-break:strict;text-wrap:balance}\nmain .phrase-heading{container-type:inline-size}\nmain .phrase-heading>.heading-phrase{display:block;white-space:nowrap;font-size:min(1em,calc(100cqw / var(--phrase-length)));line-height:inherit;letter-spacing:inherit}\n`;fs.writeFileSync(file,css);}
for(const p of changed){const target=path.join('dist',p.file);if(fs.existsSync(path.dirname(target)))fs.copyFileSync(p.file,target);}fs.copyFileSync(file,'dist/'+file);
