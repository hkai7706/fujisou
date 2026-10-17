import fs from 'node:fs';
import path from 'node:path';
const project=path.resolve(import.meta.dirname,'..');
const argument=process.argv.slice(2).find(value=>!value.startsWith('--'));
const root=argument?path.resolve(argument):project;
if(root!==project && !root.startsWith(path.join(project,'dist')+path.sep) && root!==path.join(project,'dist'))throw new Error('SEO output outside project/dist');
const production=process.argv.includes('--production');
const skip=new Set(['.git','node_modules','backup','tmp','.tmp','output','dist','cms','tools','docs','include','mailformpro','mfp.statics','iplogs']);
const events=JSON.parse(fs.readFileSync(path.join(project,'eventinfo/posts.json'),'utf8'));
const archivedEvents=new Set(events.filter(post=>!post.existing&&post.legacyFile!=='post-16.shtml').map(post=>'eventinfo/'+post.file));
const esc=value=>String(value).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const decode=value=>value.replaceAll('&amp;','&').replaceAll('&quot;','"').replaceAll('&#39;',"'").replaceAll('&lt;','<').replaceAll('&gt;','>');
let count=0,archives=0;
function walk(directory){for(const item of fs.readdirSync(directory,{withFileTypes:true})){
  if(skip.has(item.name)||item.isSymbolicLink())continue;
  const file=path.join(directory,item.name);
  if(item.isDirectory()){walk(file);continue;}
  if(!/\.(html|shtml)$/.test(file))continue;
  let html=fs.readFileSync(file,'utf8');
  if(!html.includes('</head>'))continue;
  const relative=path.relative(root,file).replaceAll('\\','/');
  const title=decode(html.match(/<title>([\s\S]*?)<\/title>/)?.[1]||'フジ創アイノス');
  const description=decode(html.match(/<meta\b[^>]*name="description"[^>]*content="([^"]*)"/)?.[1]||title);
  const canonical=new URL(relative.replace(/index\.html$/,''),'https://www.fujisou-ainos.com/').href;
  const image=decode(html.match(/<meta\b[^>]*property="og:image"[^>]*content="([^"]+)"/)?.[1]||'https://www.fujisou-ainos.com/img/home/slide1-1440.webp');
  html=html.replace(/<meta\b(?=[^>]*data-preview-robots)[^>]*>/g,'');
  const permanentNoindex=/<meta\b[^>]*name="robots"[^>]*content="[^"]*noindex/.test(html);
  const archive=relative.startsWith('server/')||archivedEvents.has(relative)||/^(staffblog|eventinfo|gallery)\/(?:category-[^/]+|page-\d+)\.html$/.test(relative)||['404.html','contact/thanks.html'].includes(relative);
  // A literal > inside a quoted description must not truncate tag removal.
  html=html.replace(/<meta\b(?:[^"'<>]|"[^"]*"|'[^']*')*>/g,tag=>/(?:property="og:|name="(?:twitter:|robots"))/.test(tag)?'':tag).replace(/<link\b[^>]*rel="canonical"[^>]*>/g,'');
  let meta=`<link rel="canonical" href="${canonical}"><meta property="og:type" content="${/^videos\/[^/]+\/index\.html$/.test(relative)?'video.other':/^(staffblog|gallery)\/.+\.shtml$/.test(relative)?'article':'website'}"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:url" content="${canonical}"><meta property="og:image" content="${esc(image)}"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(title)}"><meta name="twitter:description" content="${esc(description)}"><meta name="twitter:image" content="${esc(image)}">`;
  if(archive||permanentNoindex){meta+='<meta name="robots" content="noindex,follow" data-archive-robots>';archives++;}
  else if(!production)meta+='<meta name="robots" content="noindex,follow" data-preview-robots>';
  html=html.replace('</head>',meta+'</head>').replace(/^[ \t]+$/gm,'');
  fs.writeFileSync(file,html);count++;
}}
walk(root);
if(root!==project){const ht=path.join(root,'.htaccess');let text=fs.readFileSync(ht,'utf8').replace(/\n# BEGIN PREVIEW INDEXING[\s\S]*?# END PREVIEW INDEXING\n/g,'\n');if(!production)text+='\n# BEGIN PREVIEW INDEXING\n<IfModule mod_headers.c>\nHeader always set X-Robots-Tag "noindex, follow"\n</IfModule>\n# END PREVIEW INDEXING\n';if(production&&!text.includes('# Canonical production host'))text=text.replace('RewriteEngine On','RewriteEngine On\n  # Canonical production host; test subfolder remains separate.\n  RewriteCond %{REQUEST_URI} !^/FUJISOU-NEW(?:/|$) [NC]\n  RewriteCond %{HTTP_HOST} ^(?:fujisou-ainos\\.com|fujisou-ainos\\.sub\\.jp)$ [NC]\n  RewriteRule ^ https://www.fujisou-ainos.com%{REQUEST_URI} [R=301,L,NE]\n  RewriteCond %{REQUEST_URI} !^/FUJISOU-NEW(?:/|$) [NC]\n  RewriteCond %{HTTP_HOST} ^www\\.fujisou-ainos\\.com$ [NC]\n  RewriteCond %{HTTPS} off\n  RewriteRule ^ https://www.fujisou-ainos.com%{REQUEST_URI} [R=301,L,NE]');fs.writeFileSync(ht,text);}
console.log(`Aligned metadata in ${count} pages; ${archives} archives/utility pages noindex; mode=${production?'production':'preview'}.`);
