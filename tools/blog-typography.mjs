import fs from 'node:fs';
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const fallback={
 footprint:[['','平屋','一つの階に生活空間をまとめる。'],['','二階建て','上下の階に生活空間を分ける。']],
 land:[['','整形地','土地の形と配置を確認。'],['','旗竿地','通路と建築条件を確認。'],['','三角形の土地','形状に合う設計を検討。']],
 floors:[['','共有空間','家族が集まる場所。'],['','個人の部屋','それぞれが過ごす場所。']],
 route:[['','収納','使う物をしまう場所。'],['','動線','暮らしの移動経路。']],
 family:[['','顔を合わせる','家族の接点をつくる。'],['','声を交わす','暮らしの中の会話。']],
 study:[['','机と本棚','学ぶ環境を整える。'],['','家族の近く','質問しやすい場所。']],
 envelope:[['','構造','既存の状態を確認。'],['','断熱材','改修する範囲を検討。'],['','窓','開口部の性能を確認。']],
 feet:[['','床の感触','素材を確かめる。'],['','安全への配慮','冷えやけがに注意。']],
 sound:[['','壁・天井','部屋全体の対策を検討。'],['','床','振動への対策を検討。'],['','窓・ドア','開口部にも目を向ける。']],
 soundpaths:[['','空気を伝わる音','音の経路を確認。'],['','建物を伝わる振動','対策を分けて考える。']]
};
export const graphicItems=v=>v.items?.length?v.items:(fallback[v.kind]||[['',v.title,'本文の考え方を整理。']]);
const lines=(text,max)=>{const chars=[...text];const out=[];const balanced=Math.ceil(chars.length/Math.ceil(chars.length/max));while(chars.length)out.push(chars.splice(0,balanced).join(''));return out;};
export function graphicImage(file,v,index){
 const items=graphicItems(v),title=lines(v.title,17),top=118+title.length*78,pointY=top+100,height=pointY+190;
 const count=items.length,step=1080/count,font=count>3?34:42;
 let svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 ${height}" width="1200" height="${height}" role="img"><title>${esc(v.title)}</title><rect width="1200" height="${height}" fill="#fff"/><g font-family="YuMincho, Yu Mincho, Hiragino Mincho ProN, Noto Serif CJK JP, serif" fill="#373833"><text x="60" y="55" font-size="19" letter-spacing="4" fill="#887359">家づくりの視点</text><path d="M60 78H1140" stroke="#dfe1db"/>${title.map((line,i)=>`<text x="60" y="${156+i*78}" font-size="64" letter-spacing="1">${esc(line)}</text>`).join('')}`;
 items.forEach(([,label],i)=>{const x=60+i*step;svg+=`<text x="${x}" y="${pointY-28}" font-size="21" fill="#887359" letter-spacing="3">${String(i+1).padStart(2,'0')}</text><path d="M${x} ${pointY-7}h${step-38}" stroke="#dfe1db"/>${lines(label,Math.floor((step-38)/font)).map((line,j)=>`<text x="${x}" y="${pointY+58+j*(font+13)}" font-size="${font}">${esc(line)}</text>`).join('')}`;if(i<count-1&&['sum','flow'].includes(v.kind))svg+=`<text x="${x+step-29}" y="${pointY+58}" font-size="29" fill="#887359">${v.kind==='sum'?'＋':'→'}</text>`;});
 svg+='</g></svg>';fs.mkdirSync('img/staffblog/typography',{recursive:true});const name=file.replace(/\.shtml$/,'')+`-graphic-${index+1}.svg`;fs.writeFileSync('img/staffblog/typography/'+name,svg);
 return{src:'../img/staffblog/typography/'+name,width:1200,height};
}
