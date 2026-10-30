# Performance and analytics update — 2026-10-30

- Replaced dozens of homepage font downloads with self-hosted WOFF2 subsets while retaining Hannari/Noto typography and a fallback for future post titles.
- Fixed the mobile header layout shift and deferred offscreen gallery measurements.
- Removed the previous custom analytics collector, portal, configuration, inquiry measurement hooks and tooling. Empty local directories are not deployment assets.
- Added the owner's requested standard GA4 tag, G-17DNR9SPL4, once per page. Source and dist each contain 2,395 tagged pages. Movable Type generates the same tag through Ainos Head. The loader ID matches the config ID.
- Updated the privacy policy. Mail behavior remains unchanged. The public build excludes the unavailable private mail runtime.

Validation: source link check; production public build, including SSI assembly, link and SEO checks; six SEO/event-state tests; font loading; Movable Type fixture layouts at 320/390/768/1440px, editable empty body, feeds and no-JavaScript SSI rendering; browser verification of one GA4 loader and its initialization commands.

Scores of 100 in every category have **not** been achieved. Before GA4, the latest local mobile run scored 79/100/100/100. A diagnostic run after adding GA4 scored mobile 70/100/73/100 and desktop 96/100/77/100 (performance/accessibility/best practices/SEO). Those two diagnostic runs overlapped and are not a controlled performance comparison. The tag's remotely configured Google Ads destination requests DoubleClick resources, producing third-party-cookie warnings and network errors locally. These settings require review in the owner's Google tag/Ads account. Local results are not verified live PageSpeed scores.
