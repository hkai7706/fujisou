# Shared page design

The homepage is the visual reference: warm white, wood-brown accents,
Mincho headings, restrained rules and natural-material photography.

`stylesheet/site-design.css` aligns interior pages with this reference.
Shared foundations and homepage rules are edited in `stylesheet/source/`, in
`order.json` order, then compiled with `npm run styles`. Do not hand-edit the
generated `stylesheet/fujisou-ainos.css` or minified bundles.
It adjusts page openings, heading scale, section spacing, focus states,
form typography, information tables and mobile plan layouts. Page-specific
styles still control image ratios, floor plans, players, galleries and forms.
The homepage is deliberately excluded from these overrides.

`tools/embed-shared-chrome.mjs` adds `data-site-design="interior"` to pages
and appends the stylesheet after their existing styles, with a content hash.
The normal deployment build runs this step after page generation, so newly
generated articles and videos receive the same styling. Do not add separate
copies of these rules to generated HTML or edit the minified shared header CSS.

Preview with `npm run preview` over HTTP. Review both desktop and mobile,
especially long Japanese headings, tables, image captions, filter controls,
the expanded mobile navigation and form labels. Run `npm run check` before
packaging. Design work does not verify mail delivery on Lolipop.

Validation for this update: 29 routes at 320, 390, 768 and 1440 px
(116 page/viewport checks), with no missing loaded images or horizontal
page overflow. Desktop and mobile screenshots were reviewed for the main
listing, plan, concept, information and contact templates. The mobile menu
opened with visible contact links, and the calculator displayed a result
without errors. Static reference checks passed for 1,173 source pages and
1,171 deployment pages.
