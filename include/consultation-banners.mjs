const escape = value => String(value).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
export function ConsultationBanner({eyebrow,title,description,image,imageAlt,offerText,buttonLabel,buttonHref,variant,trackingId,topics=[]}) {
 if(!['editorial-light','editorial-dark'].includes(variant)) throw Error('Unknown banner variant');
 const titleId=`${trackingId}-title`;
 const label=eyebrow.includes(' / ')?eyebrow.split(' / ').map(part=>`<span>${escape(part)}</span>`).join(' / '):escape(eyebrow);
 const photo=`<figure class="consultation-banner__photo"><img src="${escape(image.src)}" srcset="${escape(image.srcset)}" sizes="(max-width:760px) calc(100vw - 40px), ${variant==='editorial-light'?'48vw':'32vw'}" alt="${escape(imageAlt)}" width="${image.width}" height="${image.height}" loading="lazy" decoding="async"></figure>`;
 return `<section class="consultation-banner consultation-banner--${variant}" id="${trackingId}" aria-labelledby="${titleId}">${photo}<div class="consultation-banner__copy"><p class="consultation-banner__eyebrow">${label}</p><h2 id="${titleId}">${escape(title)}</h2><p class="consultation-banner__description">${escape(description)}</p>${topics.length?`<p class="consultation-banner__topics">${topics.map(escape).join(' <span aria-hidden="true">/</span> ')}</p>`:''}<p class="consultation-banner__offer">${escape(offerText)}</p><a class="consultation-button" href="${escape(buttonHref)}" data-consultation-location="${trackingId}"><span>${escape(buttonLabel)}</span><span aria-hidden="true">→</span></a></div></section>`;
}

export const banners=[{
 eyebrow:'FREE CONSULTATION / 家づくり無料相談',title:'家づくりの第一歩を、ここから。',
 description:'土地探しも、資金計画も、間取りのことも。まだ何も決まっていなくても大丈夫です。あなたの理想の暮らしを、一緒に考えませんか。',
 image:{src:'img/policy/policy-sunlit-takaoka-1200.jpg',srcset:'img/policy/policy-sunlit-takaoka-600.jpg 600w, img/policy/policy-sunlit-takaoka-1200.jpg 1200w',width:1200,height:797},
 imageAlt:'高岡市の施工事例：木の天井と無垢床、大きな窓から光が差し込むリビング',
 offerText:'初回から3回目までのご相談は無料',buttonLabel:'家づくりの無料相談はこちら',buttonHref:'consultation/',variant:'editorial-light',trackingId:'banner-01'
},{
 eyebrow:'YOUR HOME, YOUR BUDGET',title:'理想の家づくり、予算から考えませんか？',
 description:'住宅ローン、土地探し、建築費用。家づくりにかかるお金のことを、分かりやすくご説明します。',
 image:{src:'img/gallery/exterior-tatami-home-720.webp',srcset:'img/gallery/exterior-tatami-home-480.webp 480w, img/gallery/exterior-tatami-home-720.webp 720w',width:720,height:481},
 imageAlt:'高岡市の施工事例：木の香りと暮らす畳コーナーのある家の外観',
 offerText:'初回から3回目までのご相談は無料',buttonLabel:'土地・資金計画を無料で相談する',buttonHref:'consultation/',variant:'editorial-dark',trackingId:'banner-02',topics:['土地探し','住宅ローン','総予算','間取り']
}];
