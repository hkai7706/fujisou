# Approved consultation and Journal update

The user approved implementation and publication of the reviewed V2 design with
“ok push all” on 2026-10-27. The reviewed previews are local artifacts under `tmp/consultation-v2/`.

- Banner 01 follows HONEST VALUE and precedes EXTERIOR WORKS. Its ivory 48/52 split
  uses the existing sunlit Takaoka pine interior photo.
- Banner 02 follows performance/warranty and the basic-information guide and
  precedes MONEY & LAND. It uses forest green and the existing Takaoka grey-and-white exterior.
- Both become photo-above-copy on mobile, with natural photo proportions and no new dependencies.
- Header, hero, Design Inspiration, first-time FAQ, final Contact and the single mobile
  contact bar use the approved consultation emphasis. Primary links retain the local
  `consultation/` route, valid under GitHub Pages' `/fujisou/` base and the production root.
- JOURNAL & EVENTS uses native horizontal image cards on mobile. Tabs, article titles,
  dates, links and the event's `開催終了` label remain intact.
  The subsequent approved desktop update displays three image-first cards, with
  two columns on tablets, retaining horizontal read links beneath the titles.

## Maintenance

`include/consultation-banners.mjs` provides the two banner configurations and escaped,
dependency-free `ConsultationBanner` rendering. `tools/build-consultation-banners.mjs`
regenerates the marked homepage sections. Both refresh and dist packaging run it.
Maintained styles live in `stylesheet/source/13-consultation-banners.css`.

Run `node tools/check-home-consultation.mjs` with the source preview on port 5501.
It verifies responsive banner geometry, photos, CTA destinations, preserved contact channels,
Journal scrolling/tabs, and consultation-to-form navigation without submitting a form.

## Service boundaries preserved

GitHub Pages renders the consultation and contact pages but cannot send CGI mail.
The existing contact script handles that limitation; this change does not alter it.
Lolipop sending still depends on the existing runtime setup. No form was submitted
as part of this update.

The analytics endpoint remains empty. Location attributes are included on consultation
links for future measurement; no new tracking script or service is activated, and clicks
are not reported as completed inquiries.
