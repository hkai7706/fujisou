import fs from 'node:fs';
const facts = JSON.parse(fs.readFileSync('gallery/project-facts.json','utf8'));
const esc = value => String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
export function renderProjectFacts(project) {
  const fact=facts[project.file] || {};
  const details=[['所在地',project.area],['建物面積',fact.buildingArea],['完成時期',fact.completedAt]].filter(([,value])=>value);
  const captions=[...new Set(project.photos.map(photo=>photo.caption?.trim()).filter(Boolean))].filter(value=>value.length>10).slice(0,3);
  const notes=fact.design ? `<h2>設計で工夫したこと</h2><p>${esc(fact.design)}</p>` : captions.length ? `<h2>写真から見る住まいの工夫</h2><ul>${captions.map(value=>`<li>${esc(value)}</li>`).join('')}</ul>` : '';
  return `<section class="project-facts" aria-label="施工事例の概要"><h2>この住まいについて</h2><dl>${details.map(([label,value])=>`<div><dt>${label}</dt><dd>${esc(value)}</dd></div>`).join('')}</dl>${fact.requirements?`<h2>ご家族のこだわり</h2><p>${esc(fact.requirements)}</p>`:''}${notes}<p class="evidence-source">${fact.source?`<a href="${esc(fact.source)}" target="_blank" rel="noopener">原サイトの事例紹介</a>に記載された内容をもとに整理しています。`:''}完成時期・延床面積・個別の間取り図は、公開資料で確認できる場合に掲載します。</p><a class="evidence-link" href="../contact/?topic=consultation&amp;project=${encodeURIComponent(project.title)}#mailformpro">この事例を参考に、間取りを相談する →</a></section>`;
}
