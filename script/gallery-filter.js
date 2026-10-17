(() => {
 const controls=document.querySelector('[data-gallery-controls]');if(!controls)return;
 const cards=[...document.querySelectorAll('.gallery-works .work-card')],buttons=[...controls.querySelectorAll('[data-gallery-type]')],location=controls.querySelector('[data-gallery-location]');let type='';
 const render=()=>{let count=0;for(const card of cards){card.hidden=!!((type&&card.dataset.houseType!==type)||(location.value&&card.dataset.location!==location.value));if(!card.hidden)count++;}controls.querySelector('[data-gallery-count]').textContent=`${count}件の施工事例`;document.querySelector('[data-gallery-empty]').hidden=count!==0;};
 buttons.forEach(button=>{button.hidden=!!button.dataset.galleryType&&!cards.some(c=>c.dataset.houseType===button.dataset.galleryType);button.addEventListener('click',()=>{type=button.dataset.galleryType;buttons.forEach(b=>b.setAttribute('aria-pressed',String(b===button)));render();});});location.addEventListener('change',render);controls.hidden=false;render();
})();
