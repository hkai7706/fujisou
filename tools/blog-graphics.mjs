import fs from 'node:fs';
const visuals=JSON.parse(fs.readFileSync('staffblog/visuals.json','utf8'));
const sectionVisuals=JSON.parse(fs.readFileSync('staffblog/section-visuals.json','utf8'));
const esc=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const paths={
 home:'M12 31L32 13L52 31M18 27V53H46V27M27 53V36H37V53',
 key:'M27 30a10 10 0 1 1 0-1M28 30L52 30M44 30V39M51 30V36',
 search:'M38 26a13 13 0 1 1-26 0a13 13 0 0 1 26 0ZM36 36L52 52',
 wallet:'M12 20H50V50H12ZM12 20L43 12V20M39 31H54V42H39ZM45 36H47',
 shield:'M32 10L49 17V32Q49 47 32 55Q15 47 15 32V17ZM23 32L29 38L42 25',
 tool:'M19 12Q12 21 20 29L43 52L51 44L28 21Q29 11 19 12ZM18 13L24 21L18 27L11 20',
 sun:'M41 32a9 9 0 1 1-18 0a9 9 0 0 1 18 0ZM32 10V16M32 48V54M10 32H16M48 32H54M16 16L20 20M44 44L48 48M16 48L20 44M44 20L48 16',
 plan:'M15 11H49V53H15ZM23 23H41M23 32H41M23 41H34',
 bed:'M10 46V25M54 46V28M10 39H54M14 28H50V39H14ZM17 23H29V28H17',
 storage:'M15 12H49V53H15ZM32 12V53M27 29V35M37 29V35',
 water:'M32 10Q16 30 16 38a16 16 0 0 0 32 0Q48 30 32 10ZM25 39Q25 46 32 46',
 heart:'M32 49L13 31C1 13 23 7 32 21C41 7 63 13 51 31Z',
 people:'M24 23a7 7 0 1 1-14 0a7 7 0 0 1 14 0ZM52 23a7 7 0 1 1-14 0a7 7 0 0 1 14 0ZM6 50V40Q6 31 17 31Q28 31 28 40V50M36 50V40Q36 31 47 31Q58 31 58 40V50',
 land:'M10 16H53L47 51H16ZM10 16L47 51M53 16L16 51',
 foot:'M27 19Q17 25 20 37Q26 44 25 51Q33 58 40 49Q44 37 36 28Q34 23 35 16M26 12V15M33 9V12M40 11V15M45 17V21M46 25V28'
};
const icon=key=>`<svg viewBox="0 0 64 64" aria-hidden="true" focusable="false"><path d="${paths[key]||paths.home}"/></svg>`;
const footprint=`<div class="blog-diagram__plots"><div><svg viewBox="0 0 240 180" role="img" aria-label="平屋の模式図。1階30坪が敷地を使う"><rect class="plot" x="10" y="10" width="220" height="160"/><rect class="house" x="40" y="40" width="160" height="100"/><text x="120" y="86">1階 30坪</text><text x="120" y="110">延床 30坪</text></svg><h3>平屋</h3><p>生活をワンフロアにまとめる</p></div><div><svg viewBox="0 0 240 180" role="img" aria-label="2階建ての模式図。1階15坪と2階15坪で延床30坪"><rect class="plot" x="10" y="10" width="220" height="160"/><rect class="house" x="35" y="65" width="95" height="75"/><rect class="upper" x="55" y="40" width="95" height="75"/><text x="102" y="78">2階 15坪</text><text x="83" y="133">1階 15坪</text><path d="M180 45V140M169 56L180 45L191 56"/></svg><h3>2階建て</h3><p>上下に分けて敷地を活用する</p></div></div>`;
const land=`<div class="blog-diagram__plots blog-diagram__plots--three">${[
 ['整形地','M32 24H188V136H32Z'],['旗竿地','M32 24H164V88H102V136H76V88H32Z'],['三角形の土地','M28 136L110 24L192 136Z']
].map(([label,d])=>`<div><svg viewBox="0 0 220 164" role="img" aria-label="${label}の模式図"><path class="house" d="${d}"/><path d="M15 150H205"/><text x="110" y="161">道路</text></svg><h3>${label}</h3></div>`).join('')}</div>`;
const sound=`<svg class="blog-diagram__room" viewBox="0 0 620 310" role="img" aria-label="防音の検討箇所：壁、天井、床、窓、ドア、換気設備"><path class="house" d="M140 75H480V245H140Z"/><path d="M155 90H465V230H155M310 117V185M297 135Q275 154 297 173M323 135Q345 154 323 173M278 122Q243 154 278 186M342 122Q377 154 342 186"/><rect x="180" y="120" width="50" height="65"/><path d="M205 120V185M180 150H230M400 245V170H445V245M422 206H427M412 98H451M412 106H451M310 75V40M310 245V275M140 175H85M180 130L90 105M445 195L535 220M440 98L520 60"/><text x="310" y="29">天井</text><text x="310" y="296">床</text><text x="62" y="181">壁</text><text x="68" y="99">窓</text><text x="562" y="229">ドア</text><text x="550" y="51">換気設備</text></svg>`;
const scene=(label,inside)=>`<svg class="blog-diagram__scene" viewBox="0 0 660 330" role="img" aria-label="${esc(label)}">${inside}</svg>`;
const scenes={
 envelope:scene('断熱の確認箇所：屋根・天井、壁、床、窓',`<path class="house" d="M180 135L330 45L480 135V270H180Z"/><path d="M180 150H480M195 150V255H465V150M195 255H465"/><rect x="220" y="170" width="65" height="60"/><rect x="375" y="170" width="65" height="60"/><path d="M330 90V20M180 200H110M330 270V304M440 185L545 140"/><text x="330" y="16">屋根・天井</text><text x="78" y="206">壁</text><text x="330" y="324">床</text><text x="576" y="138">窓</text>`),
 floors:scene('1階に共有空間、2階に個人の空間を配置する例',`<path class="house" d="M125 95L270 30L415 95V285H125Z"/><path d="M125 190H415M205 105H285V160H205M205 130H285M165 222H278V265H165M165 243H278M325 215V270M325 237H368V270"/><text x="270" y="180">2階：寝室・子ども部屋</text><text x="270" y="308">1階：LDK・水まわり</text><path d="M470 100V270M460 110L470 100L480 110M460 260L470 270L480 260"/><text x="540" y="185">上下で分ける</text>`),
 route:scene('玄関から収納へ、またはLDKへ進む動線の例',`<rect class="house" x="80" y="70" width="500" height="210"/><path d="M230 70V280M390 70V280M230 165H390"/><text x="155" y="132">玄関</text><text x="310" y="132">収納</text><text x="485" y="132">LDK</text><path class="route" d="M155 185H310V215H480M155 185H480M468 173L480 185L468 197"/><text x="310" y="258">収納で生活用品をまとめる</text>`),
 family:scene('玄関、リビング、個室へ進む動線の概念図',`<rect class="house" x="55" y="65" width="550" height="210"/><path d="M200 65V275M440 65V275M485 160H565V220H485M485 178H565"/><path d="M250 185H385V235H250M270 185V160H365V185"/><text x="125" y="115">玄関</text><text x="320" y="115">リビング</text><text x="525" y="115">個室</text><path class="route" d="M115 150H405M392 138L405 150L392 162M405 150H540M527 138L540 150L527 162"/><text x="320" y="305">帰宅時に、家族と顔を合わせる配置</text>`),
 study:scene('リビングにスタディスペースと本棚を配置する例',`<rect class="house" x="70" y="40" width="520" height="235"/><path d="M105 85H215V145H105ZM125 85V145M145 85V145M165 85V145M185 85V145M235 95H440V130H235M250 130V173M425 130V173M305 143H375V170H305M325 170V190M290 214H450V255H290M307 214V195H433V214"/><text x="160" y="177">本棚</text><text x="337" y="75">学ぶ場所</text><text x="370" y="303">家族のいるリビング</text><path class="route" d="M455 218Q540 185 455 124M461 135L455 124L470 122"/>`),
 feet:scene('足裏と床の接点を示す模式図',`<path d="M245 40V135Q245 165 310 185L407 202Q444 209 428 229H225Q202 217 210 187L219 120V40M80 244H580M80 254H580M300 244V290M288 276L300 290L312 276"/><path class="route" d="M240 226V244M300 227V244M390 228V244"/><text x="330" y="317">床の感触を足裏で確かめる</text><text x="500" y="222">床</text>`),
 soundpaths:scene('空気を伝わる音と、建物を伝わる振動の模式図',`<rect class="house" x="95" y="55" width="470" height="220"/><path d="M330 55V275M315 55V275M155 140V190M142 150H155M142 180H155M179 143Q208 166 179 189M203 129Q250 166 203 203"/><path class="route" d="M205 115H300M288 103L300 115L288 127M150 261H475M463 249L475 261L463 273"/><text x="230" y="92">空気を伝わる音</text><text x="425" y="198">隣の空間</text><text x="330" y="311">床・壁などを伝わる振動</text>`)
};
export function renderGraphic(v){
 let drawing=scenes[v.kind]|| (v.kind==='footprint'?footprint:v.kind==='land'?land:v.kind==='sound'?sound:`<ol class="blog-diagram__items blog-diagram__items--${v.kind}" style="--diagram-count:${v.items.length}">${v.items.map(([key,title,description])=>`<li>${icon(key)}<h3>${esc(title)}</h3><p>${esc(description)}</p></li>`).join('')}</ol>`);
 return `<figure class="blog-diagram${v.section?' blog-diagram--section':''}"><figcaption><span>${v.section?'この話を、図で整理':'図で見る、この記事のポイント'}</span><${v.section?'h3':'h2'}>${esc(v.title)}</${v.section?'h3':'h2'}></figcaption>${drawing}<p class="blog-diagram__note">${esc(v.note||'本文の内容を整理した模式図です。寸法・価格・効果を示すものではありません。')}</p></figure>`;
}
export function renderBlogGraphic(file){const v=visuals[file];if(!v)throw new Error(`Missing graphic: ${file}`);return renderGraphic(v);}
export function addSectionGraphics(file,body){
 for(const v of sectionVisuals[file]||[]){let matched=false;
  body=body.replace(/<h([23])\b[^>]*>[\s\S]*?<\/h\1>/g,tag=>{if(!matched&&tag.replace(/<[^>]*>/g,'').includes(v.anchor)){matched=true;return tag+renderGraphic({...v,section:true});}return tag;});
  if(!matched)throw new Error(`Graphic anchor missing in ${file}: ${v.anchor}`);
 }return body;
}
