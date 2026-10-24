// First-party, aggregated analytics. No form values, query strings, raw IPs or
// persistent visitor identifiers are collected. The service validates page paths.
(() => {
  const optKey='fujisou-analytics-optout';let stopped=false;
  const optedOut=()=>{try{return localStorage.getItem(optKey)==='1';}catch{return false;}};
  const button=document.querySelector('[data-analytics-optout]');
  if(button&&optedOut()){button.disabled=true;button.textContent='アクセス解析は無効です';}
  if(button)button.addEventListener('click',()=>{
    try{localStorage.setItem(optKey,'1');}catch{}
    stopped=true;button.disabled=true;button.textContent='このブラウザーのアクセス解析を無効にしました';
  });
  const config=window.FUJISOU_ANALYTICS;
  if(!config?.endpoint||optedOut()||navigator.globalPrivacyControl||navigator.doNotTrack==='1'||window.doNotTrack==='1')return;
  const site=config.sites?.find(site=>site.origin===location.origin&&location.pathname.startsWith(site.basePath));
  if(!site)return;
  let endpoint;
  try{endpoint=new URL(config.endpoint);if(endpoint.protocol!=='https:'&&!['127.0.0.1','localhost'].includes(endpoint.hostname))return;}catch{return;}
  endpoint.searchParams.set('action','collect');
  const uuid=()=>crypto.randomUUID?.()||Array.from(crypto.getRandomValues(new Uint8Array(16)),n=>n.toString(16).padStart(2,'0')).join('');
  const normalize=path=>path.replace(/\/index\.html$/,'/');
  const pagePath=()=>{try{return normalize('/'+decodeURIComponent(location.pathname.slice(site.basePath.length)));}catch{return '/';}};
  const source=()=>{try{const url=new URL(document.referrer);return url.origin===location.origin?'direct':url.origin;}catch{return 'direct';}};
  const key='fujisou-analytics-session:'+site.id;
  let session;try{session=JSON.parse(sessionStorage.getItem(key)||'null');}catch{}
  if(!session||typeof session.id!=='string'||typeof session.last!=='number'||Date.now()-session.last>1800000)session={id:uuid(),last:Date.now(),referrer:source()};
  const touch=()=>{session.last=Date.now();try{sessionStorage.setItem(key,JSON.stringify(session));}catch{}};
  const device=/iPad|Tablet/i.test(navigator.userAgent)?'tablet':/Mobi|Android/i.test(navigator.userAgent)?'mobile':'desktop';
  let queue=[],lastTick=performance.now(),active=!document.hidden&&document.hasFocus(),scroll=0,lastScroll=0;
  const base=type=>({id:uuid(),session:session.id,type,page:pagePath(),referrer:session.referrer,device});
  function send(){
    if(stopped||optedOut()){queue=[];return;}
    if(!queue.length)return;
    const events=queue.splice(0,20),body=JSON.stringify({site:site.id,events});
    try{
      if(navigator.sendBeacon?.(endpoint.href,new Blob([body],{type:'text/plain;charset=UTF-8'})))return;
      fetch(endpoint.href,{method:'POST',body,headers:{'Content-Type':'text/plain;charset=UTF-8'},credentials:'omit',keepalive:true}).catch(()=>{});
    }catch{}
  }
  function track(type,detail={}){
    if(stopped||optedOut())return;
    touch();queue.push({...base(type),...detail});
    if(queue.length>=10)send();
  }
  track('view');send();
  const placement=link=>link.closest('.shared-header')?'header':link.closest('.shared-footer')?'footer':link.closest('.mobile-contact-bar')?'mobile':'content';
  document.addEventListener('click',event=>{
    const link=event.target.closest?.('a[href]');if(!link||link.hasAttribute('data-analytics-ignore'))return;
    let url;try{url=new URL(link.href);}catch{return;}
    let target,channel;
    if(url.protocol==='tel:'){target='tel:';channel='phone';}
    else if(url.protocol==='mailto:'){target='mailto:';channel='email';}
    else if(!['http:','https:'].includes(url.protocol))return;
    else if(url.origin===location.origin){
      if(!url.pathname.startsWith(site.basePath))return;
      try{target=normalize('/'+decodeURIComponent(url.pathname.slice(site.basePath.length)));}catch{return;}
      channel=target.startsWith('/catalogs/')?'download':target==='/contact/'?'contact':'internal';
    }else{target=url.origin;channel=url.hostname==='lin.ee'?'line':'external';}
    track('link',{target,channel,placement:placement(link)});send();
  });
  window.addEventListener('inquiry_click',event=>{track('inquiry',{channel:event.detail?.channel,placement:event.detail?.placement});send();});
  window.addEventListener('inquiry_success',()=>{track('success');send();});
  window.addEventListener('scroll',()=>{
    const height=document.documentElement.scrollHeight-innerHeight;
    scroll=Math.max(scroll,height>0?Math.min(100,Math.round(scrollY/height*100)):100);
  },{passive:true});
  function heartbeat(){
    const now=performance.now(),elapsed=active?Math.min(30000,Math.max(0,Math.round(now-lastTick))):0;lastTick=now;
    active=!document.hidden&&document.hasFocus();
    if(elapsed>0)track('engagement',{engaged:elapsed,scroll});
    else if(scroll>lastScroll)track('engagement',{engaged:0,scroll});
    lastScroll=scroll;send();
  }
  setInterval(heartbeat,15000);
  document.addEventListener('visibilitychange',heartbeat);
  window.addEventListener('focus',heartbeat);window.addEventListener('blur',heartbeat);
  window.addEventListener('pagehide',()=>{heartbeat();send();});
})();
