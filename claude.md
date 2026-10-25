# Current design and implementation reference

The user's latest instructions take priority. Use the current homepage and its
rendered appearance as the visual reference. Older references are in docs/archive/.

## Design

- Japanese residential architecture: real house photography, white backgrounds,
  generous spacing, restrained brown/gold lines and no heavy shadows.
- Use existing `--serif`, `--sans`, spacing and colour tokens. Japanese headings
  use Mincho; body/navigation/form text uses the shared sans-serif stack.
- Preserve professional Japanese wording and sourced facts. Do not invent current
  prices, performance guarantees, owner requirements, completion dates or warranties.
- Preserve photographs and their originals. Use responsive derivatives with truthful
  dimensions, alt text and deliberate crops. Reserve hero dimensions before loading.
- Keep keyboard focus, touch targets, reduced-motion and no-JavaScript usability.
- Inner-page hero reference: the owner's event-page screenshot (2026-10-25),
  approximately 1575 × 400 pixels, establishes a desktop width-to-height ratio
  of approximately 4:1. Use this proportion for page hero banners, with centered
  headings/copy and cover-cropped photography where a photo banner is used.
  On mobile, allow enough height for readable wrapped copy; do not force a 4:1
  box that clips text. This standard does not replace the homepage hero layout.
  The shared implementation is `.page-hero` in `stylesheet/site-design.css`;
  `tools/standardize-page-heroes.mjs` attaches it to existing inner-page hero
  components during refresh and deployment. Reference desktop composition:
  maximum width 1260px, minimum height 320px, centered 44px maximum Mincho title,
  11px label and 15px lead. Mobile minimum height is 260px, expanding for copy.
- The homepage presents housing categories before the free-design product comparison.
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
