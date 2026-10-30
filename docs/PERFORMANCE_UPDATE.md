# Performance and analytics update — 2026-10-30

## Follow-up upload package

Added early homepage font preloads (both WOFF2 assets are present in dist). Rebuilt the indexable public upload package with SSI, GA4 and the existing design intact. Build link checks passed for 2,395 pages; SEO checks passed for 2,361 pages, 3,157 JSON-LD blocks and 74 sitemap URLs.

Latest separate local Lighthouse runs: mobile **78/100/77/100**, desktop **95/100/73/100** (performance/accessibility/best practices/SEO). Mobile FCP was 1.2 seconds, LCP 5.7 seconds and TBT 140 ms. These are local diagnostics, not live PageSpeed scores. Google Ads resources loaded by the GA4 property's remote configuration still produce cookie/network warnings locally. The supplied live mobile report r055tjbei2 showed **59/100/100/100** before this change. A controlled live retest is required after deployment; all-category 100 has not been achieved.

Upload **the contents** of dist, including .htaccess, to the Lolipop document root. Keep the existing private mail runtime and customer data; they are not included in this public package. Confirm SSI processing on the actual host. MT templates still need installation/configuration as described in MOVABLE_TYPE.md.

- Replaced dozens of homepage font downloads with self-hosted WOFF2 subsets while retaining Hannari/Noto typography and a fallback for future post titles.
- Fixed the mobile header layout shift and deferred offscreen gallery measurements.
- Removed the previous custom analytics collector, portal, configuration, inquiry measurement hooks and tooling. Empty local directories are not deployment assets.
- Added the owner's requested standard GA4 tag, G-17DNR9SPL4, once per page. Source and dist each contain 2,395 tagged pages. Movable Type generates the same tag through Ainos Head. The loader ID matches the config ID.
- Updated the privacy policy. Mail behavior remains unchanged. The public build excludes the unavailable private mail runtime.

Validation: source link check; production public build, including SSI assembly, link and SEO checks; six SEO/event-state tests; font loading; Movable Type fixture layouts at 320/390/768/1440px, editable empty body, feeds and no-JavaScript SSI rendering; browser verification of one GA4 loader and its initialization commands.

Scores of 100 in every category have **not** been achieved. Before GA4, the latest local mobile run scored 79/100/100/100. A diagnostic run after adding GA4 scored mobile 70/100/73/100 and desktop 96/100/77/100 (performance/accessibility/best practices/SEO). Those two diagnostic runs overlapped and are not a controlled performance comparison. The tag's remotely configured Google Ads destination requests DoubleClick resources, producing third-party-cookie warnings and network errors locally. These settings require review in the owner's Google tag/Ads account. Local results are not verified live PageSpeed scores.
