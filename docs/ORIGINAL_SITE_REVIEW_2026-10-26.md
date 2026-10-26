# Original website comparison — 26 October 2026, Japan

Compared the live business website with the maintained replacement, including
the homepage, concept/company/access, staff, housing-category links, building
process, blog index, and existing owner-support destination. This is a content
and navigation review, not a claim that every historic article was re-audited.

## Restored visitor routes and content

- Original owners' club: https://fujisou-ainos.ambassador-cloud.biz/login/
  (public login page returned HTTP 200). Added to the shared footer and warranty/
  maintenance page, with existing telephone support. This is the existing customer
  service, separate from the private analytics dashboard.
- Original Facebook profile: https://www.facebook.com/profile.php?id=61557082942556
  Added to the shared official social links. Mobile links form a two-by-two grid.
- Office access: added direct shared-footer routes to each office's existing
  address, telephone and map information on the concept page.
- Blog posts published 19 and 26 October 2026, absent from the earlier import:
  https://www.fujisou-ainos.com/staffblog/post-940.shtml and
  https://www.fujisou-ainos.com/staffblog/post-941.shtml.
  Imported original article text and thumbnails, rebuilt the newest articles and
  listings, and updated homepage previews. Existing older article layouts remain.
- Building-process details from https://www.fujisou-ainos.com/process/:
  consultation versus paid commissioned work, contract/confirmation applications,
  optional ground-breaking ceremony, construction inspections, handover and
  owner support. The seven-stage overview remains; expandable guidance restores
  the practical detail beneath it.

## Already present

Company identity, representative, company history, listed permits, addresses,
office telephone numbers, fax, business hours, staff profiles, housing product
families, floor-plan/catalogue downloads, gallery, plaster information, contact/
LINE routes, Instagram, YouTube, budget guidance and building steps were already
represented. Retained the existing design and recent hero/header choices.

## Deliberately not treated as new verified promises

The undated original process page quotes a 330,000-yen commissioned-work fee,
approximately ten-day approval timing, and year-round after-service reception.
Current pricing, application times and service commitments need business-owner
confirmation. The visitor page explains the paid stage and written conditions
without presenting these as current guarantees. Existing listed permit renewals
and product-specific insurance/warranty conditions also need owner records.
Expired event promotions remain closed; unsupported health, financial-return
and insurance-discount claims were not copied into new marketing sections.
Mail delivery code and analytics configuration are unchanged.

## Maintenance

To import only the newest archive page and missing thumbnails:

These import commands apply while the original publishing site is still live,
before replacing it. After cutover, maintain the local article records/templates;
the replacement does not provide the original site's publishing CMS.

```powershell
node tools/import-blog-archive.mjs --latest
node tools/import-blog-thumbnails.mjs --latest
node tools/build-blog.mjs --recent=3
node tools/update-blog-redirects.mjs
npm.cmd run refresh
```

Increase `--recent` if importing more than two new articles so their previous
neighbor also receives its updated navigation. `build-home-blog.mjs` refreshes
the homepage's latest three published records automatically during refresh/build.
Support copy lives in `include/process-guide.fragment` and
`include/owner-support.fragment`; `sync-customer-support.mjs` embeds it during
refresh/build. The original website remains the source of imported article text.
