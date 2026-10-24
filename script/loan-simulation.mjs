import {calculateLoan} from './loan-calculation.mjs?v=0b59f86a29';
const form=document.querySelector('[data-loan-form]');
if(form){
 const empty=document.querySelector('[data-loan-empty]');
 const setEmpty=hidden=>{if(empty)empty.hidden=hidden;};
 const result=document.querySelector('[data-loan-result]'),error=document.querySelector('[data-loan-error]'),mode=form.elements.purpose,format=new Intl.NumberFormat('ja-JP');
 const updateMode=()=>{for(const [name,hidden] of [['land',mode.value==='build'],['building',mode.value==='land']]){const row=form.querySelector(`[data-loan-field="${name}"]`);row.hidden=hidden;form.elements[name].disabled=hidden;}result.hidden=true;setEmpty(false);error.textContent='';};
 form.querySelector('[data-loan-submit]').disabled=false;
 const requested=new URLSearchParams(location.search).get('purpose');if(['land-build','build','land'].includes(requested))mode.value=requested;updateMode();
 mode.addEventListener('change',updateMode);
 form.addEventListener('input',()=>{result.hidden=true;setEmpty(false);error.textContent='';});
 form.addEventListener('reset',()=>setTimeout(updateMode,0));
 form.addEventListener('submit',event=>{event.preventDefault();result.hidden=true;setEmpty(false);error.textContent='';if(!form.reportValidity())return;try{
 const value=name=>form.elements[name].disabled?0:Number(form.elements[name].value);
 const data=calculateLoan({land:value('land'),building:value('building'),expenses:value('expenses'),deposit:value('deposit'),rate:value('rate'),years:value('years')});
 for(const [name,amount] of Object.entries(data)){const target=result.querySelector(`[data-loan-value="${name}"]`);if(target)target.textContent=format.format(amount);}
 result.querySelector('[data-loan-assumptions]').textContent=`年利${value('rate')}％・${value('years')}年（${data.months}回）・元利均等返済・ボーナス返済なし`;
 result.hidden=false;setEmpty(true);result.focus({preventScroll:true});result.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth',block:'start'});
 }catch{error.textContent='費用の合計は0円超〜10億円以内、自己資金は費用の合計以内で入力してください。金利は0〜20％、返済期間は1〜50年で試算できます。';error.focus();}});
}
