// Local layout fixture renderer for our small MT tag subset. This is NOT an MT
// installation or a substitute for compiling the templates on the actual CMS.
import fs from 'node:fs';
import path from 'node:path';
const directory='cms/movable-type';
const escape=s=>String(s??'').replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
function parse(source){
 const root={children:[]},stack=[root];let position=0;
 const regex=/<\$mt:(\w+)\b([\s\S]*?)\$>|<(\/?)mt:(\w+)\b([^>]*)>/gi;
 for(const m of source.matchAll(regex)){
  let parent=stack.at(-1);const children=()=>parent.useElse?parent.other:parent.children;
  children().push(source.slice(position,m.index));position=m.index+m[0].length;
  const name=m[1]||m[4],args=m[2]||m[5]||'';
  if(m[3]){if(stack.at(-1).name!==name)throw Error('Unbalanced MT tag '+name);stack.pop();continue;}
  if(name==='Else'){parent.useElse=true;continue;}
  const attrs=Object.fromEntries([...args.matchAll(/(\w+)="([^"]*)"/g)].map(a=>[a[1],a[2]]));
  const node={name,attrs,children:[],other:[]};children().push(node);
  if(!m[1]&&name!=='SetVar')stack.push(node);
 }
 if(stack.length!==1)throw Error('Unclosed MT block');
 root.children.push(source.slice(position));return root.children;
}
const ast=new Map();
export function renderMT(file,data,{root='/',origin='http://127.0.0.1:5501',monthly=false}={}){
 const vars={},initial={entry:data,entries:data.entries||[data],asset:null};
 function template(name,context){const f=path.join(directory,name);if(!ast.has(f))ast.set(f,parse(fs.readFileSync(f,'utf8')));return render(ast.get(f),context);}
 function date(value,format){const [year,month,day]=value.slice(0,10).split('-');return (format||'%Y.%m.%d').replaceAll('%Y',year).replaceAll('%m',month).replaceAll('%d',day).replaceAll('%H','09').replaceAll('%M','00').replaceAll('%S','00').replaceAll('%z','+0900');}
 function render(nodes,context){return nodes.map(n=>{
  if(typeof n==='string')return n;
  const a=n.attrs,p=context.entry||{},asset=context.asset||{};
  const child=()=>render(n.children,context);
  if(n.name==='Include')return template('modules/'+a.module+'.mtml',context);
  if(n.name==='SetVar'){vars[a.name]=a.name==='ainos_root'?root:a.name==='ainos_origin'?origin:a.value;return '';}
  if(n.name==='SetVarBlock'){vars[a.name]=child();return '';}
  if(n.name==='If'||n.name==='Unless'){
   let yes=a.tag?Boolean(p[a.tag]):Boolean(vars[a.name]);if(a.eq!==undefined)yes=String(vars[a.name])===a.eq;
   if(n.name==='Unless')yes=!yes;return render(yes?n.children:n.other,context);
  }
  if(n.name==='Entries')return context.entries.slice(0,Number(a.lastn)||context.entries.length).map(entry=>render(n.children,{...context,entry})).join('');
  if(n.name==='EntryAssets')return (p.image?[{url:p.image,label:p.imageAlt||p.title,width:p.imageWidth,height:p.imageHeight}]:[]).map(asset=>render(n.children,{...context,asset})).join('');
  if(n.name==='EntryPrevious'||n.name==='EntryNext'){const entry=p[n.name==='EntryPrevious'?'previous':'next'];return entry?render(n.children,{...context,entry}):'';}
  if(n.name==='ArchiveList')return render(n.children,context);
  let value;
  switch(n.name){
   case 'Var':value=vars[a.name]||'';break;
   case 'EntryTitle':value=p.title;break;
   case 'EntryBody':value=p.body||'';break;
   case 'EntryMore':value=p.more||'';break;
   case 'EntryExcerpt':value=p.excerpt||'本文の紹介';break;
   case 'EntryCategory':value=p.category||'';break;
   case 'EntryDate':case 'EntryModifiedDate':value=date(p.date,a.format);break;
   case 'EntryPermalink':value=new URL(p.url,origin+root).href;break;
   case 'AssetURL':value=new URL(asset.url,origin+root).href;break;
   case 'AssetLabel':value=asset.label;break;
   case 'AssetProperty':value=asset[a.property==='image_width'?'width':'height'];break;
   case 'ArchiveTitle':value='2026年10月';break;
   case 'ArchiveLink':value=origin+root+(vars.ainos_section_path||'staffblog/')+'archives/2026/10/';break;
   case 'BlogURL':value=origin+root+(vars.ainos_section_path||'staffblog/');break;
   default:throw Error('Unsupported fixture tag '+n.name);
  }
  if(a.setvar){vars[a.setvar]=value;return '';}
  if(a.remove_html)value=String(value).replace(/<[^>]*>/g,'');
  return a.encode_html?escape(value):String(value??'');
 }).join('');}
 return template(file,initial).replace(/<!--#include virtual="([^"]+)" -->/g,(directive,url)=>{
  const local=url.startsWith(root)?url.slice(root.length):null;
  if(!local||!/^include\/(?:header|footer)\.shtml$/.test(local))throw Error('Unexpected fixture SSI '+url);
  const kind=local.includes('header')?'header':'footer';
  const fragment=fs.readFileSync(local,'utf8').match(kind==='header'?/<header\b[\s\S]*?<\/header>/:/<footer\b[\s\S]*?<\/footer>/)?.[0];
  if(!fragment)throw Error('Missing fixture shared '+kind);
  return fragment.replace(/\b(href|src)="\/(?!\/)([^"]*)"/g,(_,attr,value)=>`${attr}="${root}${value}"`).replace(/srcset="([^"]+)"/g,(_,value)=>`srcset="${value.replace(/(^|,\s*)\/(?!\/)/g,'$1'+root)}"`);
 });
}
