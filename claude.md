# Current design and implementation reference

The user's latest instructions take priority. Use the current homepage and its
rendered appearance as the visual reference. Older references are in docs/archive/.

## Design

- Japanese residential architecture: real house photography, white backgrounds,
  generous spacing, restrained brown/gold lines and no heavy shadows.
- Use existing `--serif`, `--sans`, spacing and colour tokens. Japanese headings
  use Mincho; body/navigation/form text uses the shared sans-serif stack.
- Webfonts are self-hosted in `fonts/`, declared in `stylesheet/source/00-webfonts.css`.
  Hannari Mincho supplies kana, with Noto Serif JP for kanji/other characters;
  Quattrocento is available through `--latin`. Keep the bundled OFL licenses.
  Do not purge font-face rules based on literal family names: styles use CSS
  variables. Verify actual Chrome-rendered fonts with `node tools/check-fonts.mjs`.
- Preserve professional Japanese wording and sourced facts. Do not invent current
  prices, performance guarantees, owner requirements, completion dates or warranties.
- Preserve photographs and their originals. Use responsive derivatives with truthful
  dimensions, alt text and deliberate crops. Reserve hero dimensions before loading.
- Keep keyboard focus, touch targets, reduced-motion and no-JavaScript usability.
- Blog/event, privacy policy, staff and concept hero reference: the owner's event-page screenshot (2026-10-25),
  approximately 1575 × 400 pixels, establishes a desktop width-to-height ratio
  of approximately 4:1. Use this proportion for blog and event index/archive banners, with centered
  headings/copy and cover-cropped photography where a photo banner is used.
  On mobile, allow enough height for readable wrapped copy; do not force a 4:1
  box that clips text. The owner also requested this standard for policy, staff and concept pages.
  Preserve all other pages' existing hero layouts.
  The shared implementation is `.page-hero` in `stylesheet/site-design.css`;
  `tools/standardize-page-heroes.mjs` attaches it only to blog/event index/archive, policy, staff and concept hero
  components during refresh and deployment. Reference desktop composition:
  maximum width 1260px, minimum height 320px, centered 44px maximum Mincho title,
  11px label and 15px lead. Mobile minimum height is 260px, expanding for copy.
- The homepage presents housing categories before the free-design product comparison.
- Homepage hero: all three slides span the viewport width and fill its height on desktop,
  with the homepage header overlaid transparently at the top and solid after scrolling.
  Keep the solid in-flow header without JavaScript. Use cover-cropped photos, readable overlay text and
  stable slide dimensions; preserve the normal width of subsequent sections.
  On phones (760px and below), use matching 3:2 photos and a stable 3:2 banner,
  with small text and buttons overlaid on the image. Keep the phone header transparent
  at the top and solid after scrolling. The owner rejected viewport-height phone banners,
  text below the photograph, and black or blurred fill around the image.
- Shared header heights: approximately 92px desktop, 76px tablet, 60px phone.
  On the homepage, the gold dot beside the tagline tracks document scroll progress
  along its existing vertical line. Preserve its position while the mobile drawer locks scrolling.
  Compact spacing is maintained in `stylesheet/inquiry-journey.css`. Keep the
  homepage hero's no-JavaScript height fallbacks aligned with these values.
- EXTERIOR WORKS uses user-controlled horizontal cards with native scrolling,
  swipe, keyboard and arrow navigation; preserve all six real project links.
- Approved consultation V2: two banners only, after HONEST VALUE and after the
  performance/basic-information section before MONEY & LAND. Maintain the reusable
  `include/consultation-banners.mjs` configuration and regenerate its marked sections
  with `tools/build-consultation-banners.mjs` during refresh and packaging.
  Use the supplied three-free-consultations wording and existing authentic photos.
  Primary consultation links go to `consultation/`; preserve telephone, email, LINE
  and all mail runtime behavior. Keep analytics disabled until an endpoint is configured.
- JOURNAL & EVENTS uses image-led, horizontally swipeable cards on phones, retaining
  full titles, native links, existing category tabs and ended-event labels. Desktop
  shows three image-first cards, tablets two columns. Do not restore the cramped
  thumbnail/text/link columns. Journal styles are in `stylesheet/source/13-consultation-banners.css`.
  Expired promotions are hidden; their archived details remain accessible.

## Source and generated files

- `index.html` and page folders: maintained static HTML, also used by GitHub Pages.
- `include/header.shtml`, `include/footer.shtml`: shared markup sources.
- `stylesheet/source/order.json`: exact assembly order for shared CSS modules.
  Edit these modules, preferably the relevant component's final scoped rules.
- `stylesheet/fujisou-ainos.css`, `*.min.css`: generated styles; do not hand-edit.
- `script/`: vanilla browser behavior. `tools/`: Node/PowerShell generation and checks.
- `dist/`: ignored deployment output. There is no separate `server/` package.

`npm run styles` compiles CSS and asset versions. `npm run refresh` intentionally
updates source HTML, shared components, event state, SEO and the sitemap.
Ordinary `build`/`build:public` transform dist only. Run specific article/gallery
generators when changing their source records; edits to generated article HTML
can otherwise be overwritten. Root header/footer files are SSI compatibility wrappers.

## Verification and deployment

Use `npm run preview` over HTTP, not file://. Run `check`, `check:seo` and
`check:performance`. For homepage changes also run `node tools/check-home-layout.mjs`
with the preview server running, reviewing mobile/tablet/desktop screenshots.
This checks menu/Escape, visible images, slow hero loading and no-JS presentation.

`build` creates a noindex static test package; `build:public` creates an indexable
static business-domain package. Upload only dist contents, including access files.
Source/GitHub content is indexable; utilities and selected archives remain noindex.
Preserve the existing mail runtime and customer data. Actual mail delivery requires
the existing Perl CGI host and has not been verified by static/browser checks.

Do not enable historical analytics snippets or claim live rankings/delivery from
local test results. Historical audit notes describe conditions at their stated date.
