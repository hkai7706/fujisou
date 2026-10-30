# Original website migration audit — 30 October 2026

Source: https://www.fujisou-ainos.com/ and publicly linked pages on its mirrored
subdomain. This is a public migration audit, not access to the site's CMS,
customer records, protected Owners' Club, email delivery or gated brochure file.

## Inventory and findings

- Crawled 1,227 linked HTML URLs, including blog/category archives, event archives,
  product, company, staff, project, materials and land-information pages.
- Existing blog and project content was already imported. The key new content was
  the 14–15 November 2026 open house, announced on 27 October, and the brochure entry.
- Preserved the original November event copy and 18 photographic variants in a
  separate page. It is linked from the homepage, Journal event tab and event index.
  Its time and address remain inquiry-only, matching the source. The October event
  remains archived with its original dates. Promotions expire automatically.
- Corrected the land-plan event's publication date to the original 9 March 2026.
- The Fushiki land listing is already in the redesigned land page. Its former detail
  URL now reaches that information. Standard specification, materials, promises and
  aftercare URLs reach the corresponding maintained pages. Old blanket health or
  product-performance assertions were not reintroduced as new universal guarantees.
- Added 1,180 old URL entry points with both Apache 301 rules and static fallbacks,
  including original article addresses, category pagination and legacy product URLs.
  Obsolete original event URLs that already served the generic homepage now lead to
  the event index. Category/archive pages lead to relevant maintained collections.
- Recovered four linked PDFs and 430 linked image downloads (about 118 MB of images),
  retaining their original filenames. Localized original-site links so the redesign
  does not depend on those files continuing to exist on the former installation.
- Restored the public information page for 「しっくいのひみつ」, its original cover
  and a footer link. The original booklet requires an email-delivered access link;
  its gated PDF was not publicly available. Requests use the existing inquiry form
  for staff handling; no automatic booklet delivery or new mail service is implied.
- Existing staff, company addresses, business contacts, service areas, social links
  and Owners' Club navigation remain available. Private analytics remains separate.
- Fixed repeated imported IDs in an older event article; changed the event builder
  to keep IDs unique on regeneration.

## Maintained records and checks

`original-public-inventory.json` records each discovered source URL and its local
destination. `legacy-routes.json` is the regeneration source for compatibility URLs.
The two `original-*-downloads.json` records identify recovered files and sizes.
`node tools/check-migration.mjs` verifies every discovered route, static redirect,
download and November-event expiry. It also runs against a production dist package.

Browser checks cover representative existing pages and the recovered pages at
320/390/768/1440px. Static site, SEO, event-state, consultation, homepage and
production packaging checks supplement these. No inquiry forms are submitted.

This does not prove that unlinked/private server files exist or are migrated.
Actual Lolipop redirects, final-domain HTTPS and real mail delivery require checks
after upload. Keep the original installation backed up until that host check passes.
