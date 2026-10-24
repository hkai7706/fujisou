import fs from 'node:fs';
import path from 'node:path';
import { brand, sharingImage, pageSchema } from './seo-helpers.mjs';
const project=path.resolve(import.meta.dirname,'..');
const argument=process.argv.slice(2).find(value=>!value.startsWith('--'));
const root=argument?path.resolve(argument):project;
if(root!==project && !root.startsWith(path.join(project,'dist')+path.sep) && root!==path.join(project,'dist'))throw new Error('SEO output outside project/dist');
const production=process.argv.includes('--production');
// Source/GitHub content is public at the owner's request. Separate test-folder
// builds remain noindex unless explicitly generated as public/production.
const preview=process.argv.includes('--preview')||(!production&&!process.argv.includes('--public')&&root!==project);
if(process.argv.includes('--preview')&&(production||process.argv.includes('--public')))throw new Error('Choose either preview or public/production indexing');
const skip=new Set(['.git','node_modules','backup','tmp','.tmp','output','dist','cms','tools','docs','include','server','mailformpro','mfp.statics','iplogs', 'originals']);
const pageCopy=JSON.parse(fs.readFileSync(path.join(project,'docs/seo-pages.json'),'utf8'));
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
  if(html.includes('data-gallery-redirect'))continue;
  const relative=path.relative(root,file).replaceAll('\\','/');
  const title=pageCopy[relative]?.title||decode(html.match(/<title>([\s\S]*?)<\/title>/)?.[1]||'フジ創アイノス');
  const description=(pageCopy[relative]?.description||decode(html.match(/<meta\b[^>]*name="description"[^>]*content="([^"]*)"/)?.[1]||title)).replace(/\s+/g,' ').trim();
  html=html.replace(/<title>[\s\S]*?<\/title>/,`<title>${esc(title)}</title>`)
    .replace(/<meta\b[^>]*name="description"[^>]*>/,`<meta name="description" content="${esc(description)}">`)
    .replace(/<meta\b[^>]*name="application-name"[^>]*>/,`<meta name="application-name" content="${brand}">`)
    .replace(/<script\b[^>]*data-seo-schema[^>]*>[\s\S]*?<\/script>/g,'');
  if(!/<meta\b[^>]*name="description"/.test(html))html=html.replace('</head>',`<meta name="description" content="${esc(description)}"></head>`);
  const canonical=new URL(relative.replace(/index\.html$/,''),'https://www.fujisou-ainos.com/').href;
  const image=sharingImage(html,canonical,root);
  html=html.replace(/<meta\b(?=[^>]*data-preview-robots)[^>]*>/g,'');
  const permanentNoindex=/<meta\b[^>]*name="robots"[^>]*content="[^"]*noindex/.test(html);
  const archive=relative.startsWith('design-sample/')||archivedEvents.has(relative)||/^(staffblog|eventinfo|gallery)\/(?:category-[^/]+|page-\d+)\.html$/.test(relative)||['404.html','contact/thanks.html'].includes(relative);
  // A literal > inside a quoted description must not truncate tag removal.
  html=html.replace(/<meta\b(?:[^"'<>]|"[^"]*"|'[^']*')*>/g,tag=>/(?:property="og:|name="(?:twitter:|robots"))/.test(tag)?'':tag).replace(/<link\b[^>]*rel="canonical"[^>]*>/g,'');
  let meta=`<link rel="canonical" href="${canonical}"><meta property="og:type" content="${/^videos\/[^/]+\/index\.html$/.test(relative)?'video.other':/^(staffblog|gallery)\/.+\.shtml$/.test(relative)?'article':'website'}"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:url" content="${canonical}"><meta property="og:image" content="${esc(image)}"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(title)}"><meta name="twitter:description" content="${esc(description)}"><meta name="twitter:image" content="${esc(image)}">`;
  meta+=`<meta property="og:site_name" content="${brand}"><meta property="og:locale" content="ja_JP">`;
  if(!archive)meta+=pageSchema(html,canonical,title,description,image);
  if(archive||permanentNoindex){meta+='<meta name="robots" content="noindex,follow" data-archive-robots>';archives++;}
  else if(preview)meta+='<meta name="robots" content="noindex,follow" data-preview-robots>';
  html=html.replace('</head>',meta+'</head>').replace(/^[ \t]+$/gm,'');
  fs.writeFileSync(file,html);count++;
}}
walk(root);
if(root!==project){const ht=path.join(root,'.htaccess');let text=fs.readFileSync(ht,'utf8').replace(/\n# BEGIN PREVIEW INDEXING[\s\S]*?# END PREVIEW INDEXING\n/g,'\n');if(preview)text+='\n# BEGIN PREVIEW INDEXING\n<IfModule mod_headers.c>\nHeader always set X-Robots-Tag "noindex, follow"\n</IfModule>\n# END PREVIEW INDEXING\n';if(production&&!text.includes('# Canonical production host'))text=text.replace('RewriteEngine On','RewriteEngine On\n  # Canonical production host; test subfolder remains separate.\n  RewriteCond %{REQUEST_URI} !^/FUJISOU-NEW(?:/|$) [NC]\n  RewriteCond %{HTTP_HOST} ^(?:fujisou-ainos\\.com|fujisou-ainos\\.sub\\.jp)$ [NC]\n  RewriteRule ^ https://www.fujisou-ainos.com%{REQUEST_URI} [R=301,L,NE]\n  RewriteCond %{REQUEST_URI} !^/FUJISOU-NEW(?:/|$) [NC]\n  RewriteCond %{HTTP_HOST} ^www\\.fujisou-ainos\\.com$ [NC]\n  RewriteCond %{HTTPS} off\n  RewriteRule ^ https://www.fujisou-ainos.com%{REQUEST_URI} [R=301,L,NE]');fs.writeFileSync(ht,text);}
console.log(`Aligned metadata in ${count} pages; ${archives} archives/utility pages noindex; mode=${production?'production':preview?'preview':'public'}.`);
