/* Movable Type publishes these static fragments alongside each section.
   Existing HTML remains available if publishing/hosting is unavailable. */
(() => {
 const section=document.querySelector('#journal-preview');
 const track=section?.querySelector('.news-preview__grid');
 if(!track)return;
 const root=new URL('./',document.querySelector('.shared-header__brand')?.href||document.baseURI);
 const paths={blog:'staffblog/',event:'eventinfo/'};
 let pending=false;
 const text=(node,selector)=>node.querySelector(selector)?.textContent.trim()||'';
 function url(value,prefix){
  try{const u=new URL(value,root);if(u.origin!==root.origin||!u.pathname.startsWith(root.pathname+prefix))return null;return u.href;}catch{return null;}
 }
 const element=(tag,className,value)=>{const node=document.createElement(tag);if(className)node.className=className;if(value)node.textContent=value;return node;};
 async function update(kind){
  const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),5000);
  try{
   const response=await fetch(new URL(paths[kind]+'latest-cards.inc',root),{cache:'no-cache',signal:controller.signal});
   if(!response.ok)return;
   const body=await response.text();if(body.length>150000)return;
   const parsed=new DOMParser().parseFromString(body,'text/html');
   const feed=parsed.querySelector(`[data-ainos-feed="${kind}"]`);if(!feed)return;
   const candidates=[...feed.querySelectorAll(`a[data-news-category="${kind}"]`)].slice(0,3);
   const cards=[];
   for(const source of candidates){
    const href=url(source.getAttribute('href'),paths[kind]);
    const title=text(source,'h3'),date=source.querySelector('time')?.getAttribute('datetime');
    if(!href||!title||!/^\d{4}-\d{2}-\d{2}$/.test(date||''))return;
    const card=element('a','preview-card reveal is-visible');card.href=href;card.dataset.newsCategory=kind;
    const original=source.querySelector('img');
    if(original){
     // Build known elements only; scripts, inline handlers and arbitrary HTML
     // from an editor's template can never execute in the homepage.
     const src=url(original.getAttribute('src'),'');
     const width=Number(original.getAttribute('width')),height=Number(original.getAttribute('height'));
     if(src&&width>0&&height>0){const image=element('img','preview-card__image');image.src=src;image.alt=original.alt||title;image.width=width;image.height=height;image.loading='lazy';image.decoding='async';card.append(image);}
    }
    const meta=element('span','preview-card__meta');
    meta.append(element('span','preview-card__type',kind.toUpperCase()));
    const time=element('time','',date.replaceAll('-','.'));time.dateTime=date;meta.append(time);
    card.append(meta,element('h3','',title),element('span','preview-card__link',kind==='blog'?'記事を読む →':'詳しく見る →'));
    cards.push(card);
   }
   const existing=[...track.querySelectorAll(`[data-news-category="${kind}"]`)];
   const signature=nodes=>nodes.map(n=>[n.href,text(n,'h3'),n.querySelector('time')?.dateTime,n.querySelector('img')?.src||''].join('|')).join('\n');
   if(signature(existing)===signature(cards))return;
   // Do not remove a link while a visitor is using the keyboard on it.
   if(existing.some(card=>card.contains(document.activeElement)))return;
   const selected=section.querySelector('[data-news-tab][aria-selected="true"]')?.dataset.newsTab||'blog';
   for(const card of cards)card.hidden=selected!==kind;
   if(cards.length){const anchor=existing[0];if(anchor)anchor.before(...cards);else track.append(...cards);}
   existing.forEach(card=>card.remove());
   let empty=track.querySelector(`[data-news-empty="${kind}"]`);
   if(!cards.length){empty=empty||element('p','','現在、公開中の記事はありません。');empty.dataset.newsEmpty=kind;empty.hidden=selected!==kind;track.append(empty);}else empty?.remove();
  }catch{/* Keep server-rendered cards when offline, timed out or not yet set up. */}
  finally{clearTimeout(timeout);}
 }
 async function refresh(){if(pending)return;pending=true;await Promise.allSettled(Object.keys(paths).map(update));pending=false;}
 if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){observer.disconnect();refresh();}},{rootMargin:'300px'});observer.observe(section);}else refresh();
 section.addEventListener('click',()=>{const selected=section.querySelector('[data-news-tab][aria-selected="true"]')?.dataset.newsTab;track.querySelectorAll('[data-news-empty]').forEach(n=>n.hidden=n.dataset.newsEmpty!==selected);});
 addEventListener('pageshow',event=>{if(event.persisted)refresh();});
})();
