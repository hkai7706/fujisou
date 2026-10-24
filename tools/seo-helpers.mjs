import fs from 'node:fs';
import path from 'node:path';

export const origin = 'https://www.fujisou-ainos.com/';
export const brand = 'フジ創アイノス';
export const decode = value => value.replaceAll('&amp;', '&').replaceAll('&quot;', '"').replaceAll('&#39;', "'").replaceAll('&lt;', '<').replaceAll('&gt;', '>');
export const plain = value => decode(value.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();
export const json = value => JSON.stringify(value).replaceAll('<', '\\u003c');

// Sharing images must be deployed local assets, not stale original-site URLs.
export function sharingImage(html, canonical, root) {
  const previous = decode(html.match(/<meta\b[^>]*property="og:image"[^>]*content="([^"]+)"/)?.[1] || '');
  const candidates = [previous, origin + 'img/home/slide1-1440.webp'];
  for (const candidate of candidates) {
    if (!candidate) continue;
    const url = new URL(candidate, canonical);
    if (url.origin === 'https://i.ytimg.com') return url.href;
    if (url.origin !== new URL(origin).origin) continue;
    const relative = decodeURIComponent(url.pathname).replace(/^\//, '');
    const file = path.resolve(root, relative);
    if (file.startsWith(root + path.sep) && fs.existsSync(file) && fs.statSync(file).isFile()) return url.href;
  }
  throw new Error(`Missing sharing image for ${canonical}`);
}

export function pageSchema(html, canonical, title, description, image) {
  const breadcrumb = html.match(/<(?:nav|div)\b[^>]*class="site-breadcrumbs"[^>]*>([\s\S]*?)<\/(?:nav|div)>/)?.[1];
  const entries = [];
  for (const match of (breadcrumb || '').matchAll(/<li\b([^>]*)>([\s\S]*?)<\/li>/g)) {
    if (/aria-hidden="true"/.test(match[1])) continue;
    const label = plain(match[2]).replace(/^\s*\/\s*/, '');
    if (!label) continue;
    const href = match[2].match(/href="([^"]+)"/)?.[1];
    entries.push({ '@type': 'ListItem', position: entries.length + 1, name: label === '記事' ? title.replace(/｜社長のブログ｜.*$/, '') : label, item: href ? new URL(decode(href), canonical).href : canonical });
  }
  const graph = [{
    '@type': 'WebPage', '@id': canonical + '#webpage', url: canonical,
    name: title, description, inLanguage: 'ja',
    isPartOf: { '@id': origin + '#website' },
    about: { '@id': origin + '#business' },
    primaryImageOfPage: { '@type': 'ImageObject', url: image }
  }];
  if (entries.length > 1) {
    graph[0].breadcrumb = { '@id': canonical + '#breadcrumb' };
    graph.push({ '@type': 'BreadcrumbList', '@id': canonical + '#breadcrumb', itemListElement: entries });
  }
  return `<script type="application/ld+json" data-seo-schema>${json({ '@context': 'https://schema.org', '@graph': graph })}</script>`;
}
