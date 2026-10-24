# SEO maintenance

Updated 2026-10-24. Run `npm.cmd run seo` after page generators, then
`npm.cmd run check` and `npm.cmd run check:seo`. The deployment build already
runs metadata preparation and sitemap generation in this order inside `dist/`.
Use `npm run refresh` when shared changes must update source/GitHub pages.

The public-source indexing policy below supersedes older noindex instructions
in the audit, inquiry-update and video migration notes. Those notes describe
the previous preview policy and historical verification runs.

- `docs/seo-pages.json` maintains reviewed Japanese titles/descriptions for key
  landing pages. Other pages retain their own generator's specific wording.
- `tools/prepare-seo.mjs` synchronizes search/social metadata, validates local
  share-image paths with a photograph fallback, and adds Japanese site branding.
- `tools/seo-helpers.mjs` generates WebPage and BreadcrumbList JSON-LD from actual
  visible breadcrumb links. Existing business, article and video schema remains.
- `tools/generate-sitemap.mjs` includes only self-canonical selected pages; redirect
  stubs, utility/archive pages and the design sample are excluded. No modification
  dates are inferred from rebuild time. The existing curated article policy remains.
- At the owner's request, source/GitHub content pages are indexable by default.
  Separate `dist` preview builds remain noindex; `--preview` explicitly selects
  that mode, while `--public` selects indexability without production redirects.
  `build:production` enables production indexing; thanks/archive/design-sample
  noindex remains. Historical
  `server/` source files are excluded from SEO regeneration and deployment.

Tests cover nested breadcrumb URLs, missing image fallback, stable repeated builds,
and preview/production indexing transitions. The full SEO checker verifies canonical
URLs, descriptions, sharing image files, parseable JSON-LD and sitemap consistency.

After deployment, verify live redirects, robots, canonical URLs and production
indexability. Submit sitemap.xml in the owner's Search Console and inspect key URLs
and structured data. Local checks do not establish actual Google indexing or rankings.

References: [Google title guidance](https://developers.google.com/search/docs/appearance/title-link),
[breadcrumb structured data](https://developers.google.com/search/docs/appearance/structured-data/breadcrumb),
[sitemaps](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap).
