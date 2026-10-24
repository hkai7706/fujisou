(() => {
  'use strict';
  if(window.top!==window.self){document.body.textContent='Open Ainos Insights directly in its own tab.';return;}
  const $=id=>document.getElementById(id),number=value=>Number.isFinite(Number(value))?Number(value):0;
  const format=value=>new Intl.NumberFormat('en').format(number(value));
  const today=()=>new Date(Date.now()+9*3600000).toISOString().slice(0,10);
  const duration=ms=>{const seconds=Math.round(number(ms)/1000);return seconds>=60?`${Math.floor(seconds/60)}m ${seconds%60}s`:`${seconds}s`;};
  let token='',serviceURL='',sites=[],report=null,view='overview',requestID=0,expiry;
  const dialog=$('login-dialog'),status=$('status');
  const titles={overview:'Website overview',pages:'Page performance',links:'Link activity',influence:'Page influence'};
  function setView(next){
    view=titles[next]?next:'overview';$('view-title').textContent=titles[view];
    document.querySelectorAll('[data-view]').forEach(button=>{const active=button.dataset.view===view;button.classList.toggle('active',active);if(active)button.setAttribute('aria-current','page');else button.removeAttribute('aria-current');});
    document.querySelectorAll('[data-panel]').forEach(panel=>{panel.hidden=panel.dataset.panel!==view;});
  }
  document.querySelectorAll('[data-view]').forEach(button=>button.addEventListener('click',()=>setView(button.dataset.view)));
  document.querySelector('.brand').addEventListener('click',event=>{event.preventDefault();setView('overview');});
  function message(text,error=false){status.textContent=text;status.classList.toggle('error',error);}
  function dates(){
    if($('range').value!=='custom'){
      $('end').value=today();const date=new Date(today()+'T00:00:00Z');date.setUTCDate(date.getUTCDate()-(Number($('range').value)-1));$('start').value=date.toISOString().slice(0,10);
    }
    const custom=$('range').value==='custom';document.querySelectorAll('.custom-date').forEach(label=>{label.hidden=!custom;});
    $('end').max=today();$('start').max=today();
  }
  function clear(){
    report=null;requestID++;$('export').disabled=true;
    for(const metric of ['visits','views','actions','engaged']){$('metric-'+metric).textContent='—';$('delta-'+metric).textContent='No data connected';$('delta-'+metric).className='';}
    $('chart').replaceChildren(empty('Your traffic chart will appear after the first recorded visit.'));
    $('sources').replaceChildren(empty('No traffic sources yet.'));$('devices').replaceChildren(empty('No device data yet.'));
    emptyTable('pages-body',5);emptyTable('links-body',4);emptyTable('influence-body',4);$('updated').textContent='No report loaded';
  }
  function signIn(reason=''){
    token='';clearTimeout(expiry);clear();$('sign-out').disabled=true;$('refresh').disabled=true;$('site').disabled=true;
    $('connection').textContent='Not connected';$('connection').classList.remove('connected');$('password').value='';$('login-error').textContent=reason;
    if(!dialog.open)dialog.showModal();
  }
  dialog.addEventListener('cancel',event=>event.preventDefault());
  function endpoint(value){
    const url=new URL(value);
    if((url.protocol!=='https:'&&!['127.0.0.1','localhost'].includes(url.hostname))||url.username||url.password||!url.pathname.endsWith('/api.php'))throw Error('Use the HTTPS api.php URL from your analytics service.');
    url.search='';url.hash='';return url.href;
  }
  async function api(action,body,params={}){
    const url=new URL(serviceURL);url.searchParams.set('action',action);for(const [key,value]of Object.entries(params))url.searchParams.set(key,value);
    let response;
    try{response=await fetch(url,{method:body?'POST':'GET',headers:{...(body?{'Content-Type':'application/json'}:{}),...(token?{Authorization:'Bearer '+token}:{})},body:body?JSON.stringify(body):undefined,credentials:'omit',cache:'no-store',signal:AbortSignal.timeout(15000)});}catch{throw Error('Could not reach the analytics service. Check its URL, HTTPS and allowed portal origin.');}
    let data;try{data=await response.json();}catch{throw Error('The URL did not return the analytics API. GitHub Pages cannot run the PHP service.');}
    if(!response.ok){if(response.status===401&&action!=='login')signIn(data.error);throw Error(data.error||'The analytics request failed.');}
    return data;
  }
  $('login-form').addEventListener('submit',async event=>{
    event.preventDefault();$('login-submit').disabled=true;$('login-error').textContent='';
    try{
      serviceURL=endpoint($('endpoint').value.trim());
      const health=await api('status');if(health.service!=='fujisou-analytics')throw Error('This is not a Fujisou analytics service.');
      const data=await api('login',{username:$('username').value.trim(),password:$('password').value});
      token=data.token;sites=data.sites;$('password').value='';
      try{localStorage.setItem('ainos-analytics-endpoint',serviceURL);}catch{}
      $('site').replaceChildren(...sites.map(site=>new Option(site.label,site.id)));
      $('site').disabled=false;$('sign-out').disabled=false;$('refresh').disabled=false;
      $('connection').classList.add('connected');$('connection').textContent='Connected';dialog.close();
      expiry=setTimeout(()=>signIn('Your one-hour session ended. Sign in again.'),Math.max(0,data.expiresAt*1000-Date.now()));
      await load();
    }catch(error){$('login-error').textContent=error.message;if(!token&&!dialog.open)dialog.showModal();}
    finally{$('login-submit').disabled=false;}
  });
  $('sign-out').addEventListener('click',async()=>{try{await api('logout',{});}catch{}signIn();message('Signed out. Private reports have been cleared.');});
  $('range').addEventListener('change',()=>{dates();if(token&&$('range').value!=='custom')load();});
  $('site').addEventListener('change',()=>{if(token)load();});
  $('filters').addEventListener('submit',event=>{event.preventDefault();if(token)load();});
  async function load(){
    clear();
    const id=++requestID;$('refresh').disabled=true;message('Loading your report…');
    try{
      const data=await api('summary',null,{site:$('site').value,start:$('start').value,end:$('end').value});
      if(id!==requestID)return;
      report=data;render(data);$('export').disabled=false;
      const site=sites.find(site=>site.id===data.site);$('connection').textContent='Connected · '+(site?.label||data.site);
      message(number(data.totals.visits)>0?'Compared with the previous period of the same length.':'No visits recorded in this period. Enable the website tracker after configuring your service.');
      $('updated').textContent='Updated '+new Intl.DateTimeFormat('en',{timeZone:'Asia/Tokyo',hour:'2-digit',minute:'2-digit'}).format(new Date())+' JST';
    }catch(error){if(id===requestID)message(error.message,true);}
    finally{if(id===requestID)$('refresh').disabled=!token;}
  }
  function empty(text){const p=document.createElement('p');p.className='empty';p.textContent=text;return p;}
  function emptyTable(id,columns){const row=document.createElement('tr'),cell=document.createElement('td');cell.colSpan=columns;cell.className='empty';cell.textContent='No activity recorded for this period.';row.append(cell);$(id).replaceChildren(row);}
  function cell(row,text){const td=document.createElement('td');td.textContent=text;row.append(td);return td;}
  function pageCell(row,path,title){
    const td=cell(row,'');const site=sites.find(site=>site.id===report.site),name=document.createElement('span');name.textContent=title||path;
    if(site){try{const url=new URL(path.replace(/^\//,''),site.baseUrl);if(['https:','http:'].includes(url.protocol)&&url.origin===new URL(site.baseUrl).origin){const link=document.createElement('a');link.href=url.href;link.target='_blank';link.rel='noopener noreferrer';link.append(name);td.append(link);}else td.append(name);}catch{td.append(name);}}else td.append(name);
    const small=document.createElement('small');small.textContent=path;td.append(small);
  }
  function delta(current,previous){if(!previous)return current?'First activity in this comparison':'No change';return `${current>=previous?'+':''}${Math.round((current-previous)/previous*100)}% vs previous period`;}
  function render(data){
    const t=data.totals,p=data.previous;
    for(const key of ['visits','views','actions']){$('metric-'+key).textContent=format(t[key]);$('delta-'+key).textContent=delta(number(t[key]),number(p[key]));$('delta-'+key).classList.toggle('positive',number(t[key])>number(p[key]));}
    $('metric-engaged').textContent=duration(number(t.engaged)/Math.max(1,number(t.visits)));$('delta-engaged').textContent='Active time per visit';
    chart(data);breakdown('sources',data.sources,'referrer',value=>value==='direct'?'Direct / unknown':value.replace(/^https?:\/\//,''));breakdown('devices',data.devices,'device',value=>value.charAt(0).toUpperCase()+value.slice(1));
    if(!data.pages.length)emptyTable('pages-body',5);else{$('pages-body').replaceChildren();for(const item of data.pages){const row=document.createElement('tr');pageCell(row,item.page,item.title);cell(row,format(item.views));cell(row,format(item.visits));cell(row,duration(item.engaged));cell(row,number(item.scroll)+'%');$('pages-body').append(row);}}
    if(!data.links.length)emptyTable('links-body',4);else{$('links-body').replaceChildren();for(const item of data.links){const row=document.createElement('tr');cell(row,({ 'tel:':'Phone call','mailto:':'Email' })[item.target]||item.target);cell(row,item.page);cell(row,item.placement);cell(row,format(item.clicks));$('links-body').append(row);}}
    if(!data.influence.length)emptyTable('influence-body',4);else{$('influence-body').replaceChildren();for(const item of data.influence){const row=document.createElement('tr');pageCell(row,item.page,item.title);cell(row,format(item.visits));cell(row,format(item.action_visits));cell(row,Math.round(number(item.action_visits)/Math.max(1,number(item.visits))*100)+'%');$('influence-body').append(row);}}
  }
  function breakdown(id,rows,key,label){
    if(!rows.length){$(id).replaceChildren(empty('No visits recorded yet.'));return;}
    $(id).replaceChildren();const total=rows.reduce((sum,row)=>sum+number(row.visits),0);
    for(const row of rows){const div=document.createElement('div');div.className='split-row';const name=document.createElement('span'),value=document.createElement('strong'),progress=document.createElement('progress');name.textContent=label(row[key]);value.textContent=format(row.visits);progress.max=Math.max(1,total);progress.value=number(row.visits);progress.setAttribute('aria-label',name.textContent+' share');div.append(name,value,progress);$(id).append(div);}
  }
  function chart(data){
    if(!number(data.totals.views)){$('chart').replaceChildren(empty('No traffic in this date range.'));return;}
    const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg');svg.setAttribute('viewBox','0 0 960 260');svg.setAttribute('role','img');svg.setAttribute('aria-label',`Daily visits and page views from ${data.period.start} to ${data.period.end}`);
    const node=(name,attrs,text)=>{const el=document.createElementNS(ns,name);for(const[k,v]of Object.entries(attrs))el.setAttribute(k,v);if(text!==undefined)el.textContent=text;svg.append(el);return el;};
    const rows=[],map=new Map(data.daily.map(row=>[row.day,row]));for(let d=new Date(data.period.start+'T00:00:00Z');d.toISOString().slice(0,10)<=data.period.end;d.setUTCDate(d.getUTCDate()+1)){const day=d.toISOString().slice(0,10);rows.push(map.get(day)||{day,visits:0,views:0});}
    const maximum=Math.max(1,...rows.map(row=>number(row.views))),step=880/rows.length,width=Math.max(1,step*.3);
    for(let i=0;i<=4;i++){const y=215-i*47.5;node('line',{x1:45,x2:940,y1:y,y2:y,class:'axis'});node('text',{x:4,y:y+4},format(Math.round(maximum*i/4)));}
    rows.forEach((row,i)=>{const x=50+i*step;for(const [offset,key]of [[0,'visits'],[width+1,'views']]){const height=number(row[key])/maximum*190,bar=node('rect',{x:x+offset,y:215-height,width,height,class:key+' bar',tabindex:0,'aria-label':`${row.day}: ${format(row[key])} ${key}`});const title=document.createElementNS(ns,'title');title.textContent=`${row.day} · ${format(row[key])} ${key}`;bar.append(title);}if(i%Math.max(1,Math.ceil(rows.length/7))===0)node('text',{x,y:244},row.day.slice(5));});
    $('chart').replaceChildren(svg);
  }
  $('export').addEventListener('click',()=>{
    if(!report)return;
    const data=view==='links'?report.links:view==='influence'?report.influence:view==='pages'?report.pages:report.daily;
    if(!data.length){message('No rows to export in this view.');return;}
    const keys=Object.keys(data[0]),escape=value=>{let text=String(value??'');if(/^[=+@\-\t\r]/.test(text))text="'"+text;return '"'+text.replaceAll('"','""')+'"';};
    const csv='\ufeff'+[keys.map(escape).join(','),...data.map(row=>keys.map(key=>escape(row[key])).join(','))].join('\r\n');
    const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'})),link=document.createElement('a');link.href=url;link.download=`ainos-${report.site}-${view}-${report.period.start}.csv`;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  });
  try{$('endpoint').value=window.AINOS_PORTAL?.serviceUrl||localStorage.getItem('ainos-analytics-endpoint')||(!location.hostname.endsWith('github.io')&&!['127.0.0.1','localhost'].includes(location.hostname)?new URL('api.php',location.href).href:'');}catch{}
  setView('overview');dates();signIn();
})();
