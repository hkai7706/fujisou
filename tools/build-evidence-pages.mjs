import fs from 'node:fs';

const template = fs.readFileSync('contact/thanks.html', 'utf8');
const date = '2026年10月17日';
const row = (label, value) => `<tr><th scope="row">${label}</th><td>${value}</td></tr>`;
const pages = [
  {
    slug:'performance', title:'構造・断熱・標準仕様の確認', description:'フジ創アイノスの原サイトで紹介している構造・断熱・設備と、商品・プランごとに確認する性能・標準仕様をご案内します。',
    body:`<p>写真に写らない部分も、採用する材料と設計資料で確かめる。商品ごとの紹介と、一棟ごとに決まる性能を分けてご案内します。</p>
    <section><h2>商品紹介で確認できること</h2><table class="evidence-table"><caption>原サイトの公開内容に基づく紹介。すべての商品に共通する標準仕様ではありません。</caption><tbody>
    ${row('Healthyの構造','原サイトでは、木造軸組工法と面材による構造、制震ダンパー、構造計算書付きの耐震等級３を紹介しています。採用部材、計算方法、評価書等の有無は、現在の商品仕様と個別の設計図書で確認します。')}
    ${row('SIMPLYの断熱・設備','原サイトでは、トリプルサッシ、高断熱玄関ドア、第一種全熱交換換気、太陽光発電・蓄電による省エネ設計を紹介しています。設備の採否、容量、標準・追加費用の区分は見積書で確認します。')}
    ${row('内装・設備の選択','原サイトの標準仕様紹介には、漆喰、無垢材、キッチン・浴室・洗面などの記載があります。仕様や対象プランは商品ごとに異なります。製品名・品番・使用する部屋を仕様書に記載して確認します。')}
    </tbody></table><p class="evidence-source">確認日：${date}。出典：<a href="https://www.fujisou-ainos.com/healthy/" target="_blank" rel="noopener">Healthy</a>、<a href="https://www.fujisou-ainos.com/simply/" target="_blank" rel="noopener">SIMPLY</a>、<a href="https://www.fujisou-ainos.com/spec/" target="_blank" rel="noopener">原サイトの標準仕様</a>。</p></section>
    <section><h2>「耐震等級３」の確認方法</h2><p>住宅性能表示制度の耐震等級３（構造躯体の倒壊等防止）は、等級１で想定する地震力の1.5倍の力を基準に評価します。すべての地震で無被害となることを意味するものではありません。</p><p>対象となる建物、積雪などの設計条件、構造計算の方法、取得する評価書・証明書を、設計時に確認します。「等級３」と「等級３相当」は同じ資料が発行されるとは限りません。</p><p class="evidence-source"><a href="https://www.mlit.go.jp/jutakukentiku/house/content/001586565.pdf" target="_blank" rel="noopener">国土交通省：住宅性能表示制度の案内（PDF）</a></p></section>
    <section id="insulation"><h2>断熱は、建物全体で確認します</h2><p>２階建てのSmart・Premium紹介にはUA値0.46の記載があります。これは全商品・全プランの保証値ではありません。対象となる設計条件と、現在の採用仕様を個別の外皮計算書で確認します。</p><p>断熱材の種類と厚さ、窓・玄関ドアの仕様、換気方式を組み合わせて考えます。外皮平均熱貫流率（UA値）や断熱等性能等級は、地域区分、建物形状、窓の面積などを含めた個別の計算・評価で確認します。</p><p>全商品に共通するUA値や断熱等級は、このページでは表示していません。ご検討中のプランの計算書や省エネ性能表示でお確かめください。</p><p class="evidence-source"><a href="https://www.mlit.go.jp/shoene-label/" target="_blank" rel="noopener">国土交通省：建築物の省エネ性能表示制度</a></p></section>
    <section><h2>標準と追加工事を、見積書で分けます</h2><p>断熱・窓・換気、太陽光・蓄電池、制震装置、長期優良住宅や性能評価の申請、造作・仕上げ、屋外給排水などは、採用内容と費用区分を商品・プランごとに確認します。原サイトに掲載した設備が、現在の全プランに含まれることを示すものではありません。</p><p><a href="../cost/">本体価格と総予算の違いを見る →</a>　<a href="../aftercare/">保証・点検について確認する →</a></p></section>`
  },
  {
    slug:'cost', title:'価格例と家づくりの総予算', description:'掲載価格表に基づくAinos Smartの本体価格例、総予算で確認する費用、住宅ローン計算例の条件をご案内します。',
    body:`<p>本体価格だけで、住み始めるまでの費用は決まりません。土地、工事範囲、諸費用を一つずつ整理して、ご家族の総予算を考えます。</p>
    <section><h2>掲載資料に基づく本体価格例</h2><table class="evidence-table"><tbody>${row('プラン','Ainos Smart ニュースター／２階建て・3LDK')}${row('延床面積','23.75坪（掲載価格表の表記）')}${row('本体価格の掲載例','1,853万円（税込）')}${row('資料の確認日',date+'。価格表の改定日は資料に明記されていません。最新の価格・仕様は個別の見積書で確認します。')}${row('工事の範囲','本体価格に含む部材・設備・設計・工事の範囲は、プランの仕様書と見積明細で確認します。現在の総額や、付帯工事まで含む価格を示すものではありません。')}</tbody></table><p class="evidence-source">出典：<a href="../catalogs/two-story-plan-prices.pdf#page=2" target="_blank" rel="noopener">２階建てプラン価格表（PDF）</a>。<a href="../plans/products/smart/#smart-newstar">間取りとプランの紹介を見る →</a></p></section>
    <section><h2>総予算で確認する項目</h2><table class="evidence-table"><tbody>${row('建物本体','上記の掲載例を出発点に、現在の仕様・数量・価格で見積りを確認します。')}${row('敷地ごとに変わる工事','地盤調査・地盤改良、給排水の引込み、造成、解体、外構など。各項目が本体に含まれるか、別途計上かを確認します。')}${row('土地・手続き・諸費用','土地代、仲介、登記、融資手数料・保証料、保険、税金、各種申請など。土地の有無や借入方法によって異なります。')}${row('追加する仕様','太陽光・蓄電池、造作、仕上げ、設備変更など。標準との差額を明細で確認します。')}${row('住み始めてから','家具・家電、引越し、光熱費、税金、保険、点検・維持修繕の費用も分けて考えます。')}</tbody></table><p>総予算は「建物本体＋敷地条件に応じた工事＋土地・諸費用＋選択した追加仕様」で整理します。項目の重複計上を避けるため、含む・含まないを明細ごとに確認します。</p><p class="evidence-note">承認済みの個別見積書がないため、このページでは現在の確定総額を表示していません。上記の掲載価格を、そのまま契約価格としてお約束するものではありません。</p></section>
    <section id="loan-example"><h2>住宅ローンの計算例</h2><p>借入2,030万円、返済期間35年（420回）、全期間の金利を年1.3％と仮定した元利均等返済では、毎月約6.02万円です。</p><table class="evidence-table"><tbody>${row('返済条件','毎月返済のみ・ボーナス返済なし。毎月の金利を年利の12分の1として試算。')}${row('金利の扱い','年1.3％は計算用の仮定で、現在の適用金利や金融機関の融資商品を示すものではありません。変動金利の場合は返済額等が変わる可能性があります。')}${row('含まない費用','融資手数料、保証料、印紙・登記、保険、税金、維持修繕費など。借入の可否、実際の返済額、総予算は個別に確認します。')}${row('計算条件の確認日',date)}</tbody></table><p class="evidence-source"><a href="https://www.zenginkyo.or.jp/article/simulation/loan-new/" target="_blank" rel="noopener">全国銀行協会：住宅ローン返済シミュレーションと注意事項</a></p></section>`
  },
  {
    slug:'aftercare', title:'保証・点検と維持管理の確認', description:'最長60年という保証期間だけでなく、対象部位、初期期間、延長条件、点検・維持修繕費と対象外事項を契約前に確認します。',
    body:`<p>長く住むために、保証と点検、日々の手入れを分けて考えます。「最長」の年数だけで、すべての修理が無料になるわけではありません。</p>
    <section><h2>期間だけでなく、保証書の条件を確認します</h2><p>原サイトのSIMPLY・Pretty・Healthyには「長期60年保証」の紹介があります。ただし、現在の対象商品、保証制度、初期期間、更新の時期や費用を確認できる約款までは掲載されていません。このページの説明だけで、60年の適用や無料修理をお約束するものではありません。</p><table class="evidence-table"><tbody>${row('対象商品・対象部位','ご検討中の商品が対象か、構造・防水・設備など、部位ごとの範囲を契約時の保証書で確認します。')}${row('初期保証期間','保証開始日と初期期間を、保証書に記載された制度ごとに確認します。初期20年・30年など、未確認の年数は表示していません。')}${row('延長の条件','更新時期、指定された点検・検査、必要な補修工事、申請・記録など、延長に必要な条件を確認します。')}${row('点検・維持修繕の費用','無償の点検と有償の点検・検査・工事の区分、費用の見積りと実施時期を確認します。点検と修繕は同じものではありません。')}${row('対象外の事項','自然災害、経年変化、使用・管理方法、他社施工などの扱いは、制度・契約によって異なります。対象外事項と免責を約款で確認します。')}${row('相談・記録','気になる不具合は状況と発生時期を記録してご相談ください。保証の適否は保証書と状態を確認してご案内します。')}</tbody></table><p class="evidence-source">確認日：${date}。出典：原サイトの<a href="https://www.fujisou-ainos.com/simply/" target="_blank" rel="noopener">SIMPLY</a>・<a href="https://www.fujisou-ainos.com/pretty/" target="_blank" rel="noopener">Pretty</a>の保証紹介。具体的な期間・費用・免責は、適用する保証書・約款が優先します。</p></section>`
  }
];
for (const page of pages) {
  const title = `${page.title}｜フジ創アイノス`;
  let html = template.replace(/<title>[\s\S]*?<\/title>/,`<title>${title}</title>`)
    .replace(/<script\b[^>]*src="[^\"]*contact-thanks\.js[^\"]*"[^>]*><\/script>/g,'')
    .replace(/<meta name="description"[^>]*>/,`<meta name="description" content="${page.description}">`)
    .replace(/<link rel="canonical"[^>]*>/,`<link rel="canonical" href="https://www.fujisou-ainos.com/${page.slug}/">`)
    .replace(/<meta\b[^>]*name="robots"[^>]*>/g,'')
    .replace(/<meta\b[^>]*(?:property="og:|name="twitter:)[^>]*>/g,'')
    .replace(/<script\b[^>]*type="application\/ld\+json"[^>]*>[\s\S]*?<\/script>/g,'')
    .replace(/<main\b[\s\S]*?<\/main>/,`<main id="main" class="evidence-page"><nav class="site-breadcrumbs" aria-label="パンくずリスト"><ol><li><a href="../">ホーム</a></li><li aria-current="page">${page.title}</li></ol></nav><h1>${page.title}</h1>${page.body}<section><h2>ご希望のプランで、一緒に確認します。</h2><p>土地・間取り・予算がまだ決まっていなくても、ご相談いただけます。</p><a href="../contact/?topic=consultation#mailformpro">無料相談を予約する →</a></section></main>`);
  fs.mkdirSync(page.slug,{recursive:true});
  fs.writeFileSync(`${page.slug}/index.html`,html);
}
console.log('Built performance, cost and aftercare evidence pages.');
