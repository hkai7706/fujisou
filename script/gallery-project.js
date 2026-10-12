(() => {
  const dialog=document.querySelector('.work-image-dialog');
  if(!dialog||typeof dialog.showModal!=='function')return;
  const links=[...document.querySelectorAll('[data-project-photo]')];
  const image=dialog.querySelector('img');
  let active=0,opener;
  const show=index=>{
    active=(index+links.length)%links.length;
    image.src=links[active].href;
    image.alt=links[active].dataset.caption||'';
    dialog.querySelector('p').textContent=image.alt;
    dialog.querySelector('.work-image-dialog__count').textContent=`${active+1} / ${links.length}`;
  };
  links.forEach((link,index)=>link.addEventListener('click',event=>{
    if(event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
    event.preventDefault();opener=link;show(index);dialog.showModal();
  }));
  dialog.querySelector('[data-photo-prev]').addEventListener('click',()=>show(active-1));
  dialog.querySelector('[data-photo-next]').addEventListener('click',()=>show(active+1));
  dialog.querySelector('.work-image-dialog__close').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close();});
  dialog.addEventListener('keydown',event=>{if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();show(active+(event.key==='ArrowLeft'?-1:1));}});
  dialog.addEventListener('close',()=>{image.removeAttribute('src');opener?.focus();});
})();
