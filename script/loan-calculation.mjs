export function calculateLoan({land=0,building=0,expenses=0,deposit=0,rate,years}) {
 const amounts=[land,building,expenses,deposit];
 if(amounts.some(v=>!Number.isFinite(v)||v<0)||!Number.isFinite(rate)||rate<0||rate>20||!Number.isInteger(years)||years<1||years>50)throw new RangeError('Invalid loan inputs');
 const budget=Math.round((land+building+expenses)*10000),cash=Math.round(deposit*10000);
 if(budget<=0||budget>1000000000||cash>budget)throw new RangeError('Invalid budget');
 const principal=budget-cash,months=years*12,r=rate/1200;
 const monthly=principal===0?0:r===0?principal/months:principal*r/(-Math.expm1(-months*Math.log1p(r)));
 const total=Math.round(monthly*months);
 return {budget,principal,deposit:cash,monthly:Math.round(monthly),annual:Math.round(monthly*12),total,interest:total-principal,outlay:total+cash,months};
}
