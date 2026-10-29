# Website quality review — 2026-10-29

The user requested a whole-project quality review following mobile hero readability feedback.

## Fixes

- Kept the approved full-photo 3:2 mobile hero, rather than reintroducing tall, cropped,
  or filled banners. Increased headlines from 15–20px to 22–24px and restored deliberate
  two-line phrases. Short phone descriptions use 14px text where space allows; 320px
  layouts omit the description so the headline and action remain usable.
- Reduced the homepage phone header to a compact 60px total height. The transparent
  start, green leaf, tagline, scroll indicator and solid scrolled state remain.
- Each phone slide has one visible action. The English label, secondary philosophy
  button and small consultation offer note are hidden on phones. Desktop retains the
  full copy and offer; the page's other consultation offers remain available.
- Added an accessible pause/resume button to the hero. Autoplay still loops continuously
  by default. Manual pause, keyboard focus, reduced motion and cancelled gestures have
  distinct tested behavior. Reduced-motion/no-JavaScript visitors do not get a misleading
  autoplay control.
- Added same-page anchor checks to `tools/site-check.mjs`, supplementing existing local
  link, responsive-image, metadata, duplicate-ID and asset checks. The audit found no
  broken in-page targets across 1,211 pages.

## Scope of review

Static checks cover the public project HTML/assets and metadata. Browser samples cover
32 pages at 320, 390 and 768px, plus targeted desktop and landscape checks. Shared CSS
extends those fixes to the corresponding generated page families; every historical
article was not separately visually inspected.

Verification includes overflow and clipped headings, mobile tap targets and form text,
header/menu/Escape, table accessibility, local loan calculation, article/event tabs,
image loading, responsive fonts, hero geometry, autoplay and pause/resume, no-JavaScript
content, SEO, and isolated production packaging.

Mail services, contact validation and analytics configuration are unchanged. No real
inquiry is submitted by these tests, and static checks do not verify delivery on Lolipop.
