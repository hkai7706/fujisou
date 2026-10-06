# Fujisou Ainos — Design and Technology Reference

This document describes the existing design and implementation. Use the main `/index.html` landing page as the visual source of truth for future work. Follow its current rendered appearance and final CSS overrides rather than older design rules earlier in the stylesheet.

## Scope and visual reference

- Primary reference: `index.html`.
- Main stylesheet: `stylesheet/fujisou-ainos.css`.
- Shared browser behavior: `script/fujisou-ainos.js`.
- Concept page: `concept/index.html`, with additional scoped styles in `stylesheet/concept.css`.
- Standalone open house page: `eventinfo/open-house/index.html`, styled independently by `stylesheet/open-house.css`.
- Match new subpages to the main landing page, not to the standalone open house page.
- Keep the redesigned navigation header on the main landing page only. Do not add it to subpages.
- Do not add English concept kicker labels to the concept page.

## Design direction

A restrained Japanese residential architecture website: photography leads the design, with generous white space, elegant Japanese headings, readable supporting text, and golden dark brown accents. Use clean editorial grids and subtle dividing lines rather than a dashboard aesthetic.

The current landing page uses white section backgrounds. Do not restore the beige backgrounds found in older CSS declarations. Avoid introducing large rounded cards, heavy shadows, decorative badges, or an unrelated new visual system. Small corner radii are appropriate where existing controls already use them.

Keep professional Japanese business wording intact when changing presentation. Do not replace it with newly invented marketing promises simply to fill a layout.

## Colors

The stylesheet has both shared tokens and component-specific overrides. Current component styles take precedence.

| Purpose | Existing values and usage |
| --- | --- |
| Page background | `#ffffff` |
| General ink | Shared `--ink: #1c211e`; individual sections also use dark brown such as `#493b31` |
| Muted text | Shared `--muted: #656b66`; brown-toned supporting copy also uses `#71665f` |
| Golden brown lines | `--gold-line: #9b784d` |
| Gold detail | `--gold: #b49b68` |
| Header navigation | `#604426` |
| Header top accent | `#806039` |
| Header filled owner button | `#73512e` |
| Header hover accent | `#a27b43`; filled button hover `#916b3c` |
| Header dividers | `#d8cbb9`, `#e5dacb` |
| Header dropdown hover | Subtle `#f7f3ed` background |
| Legacy/shared green | `--green: #273b31`; still used by some existing components, but overridden by brown in the header |

Use gold and brown for restrained accents, borders, links, and selected controls. The small warm dropdown hover fill is not a reference for whole-page beige backgrounds.

## Typography

Use the shared font variables from `stylesheet/fujisou-ainos.css`. Do not introduce separate font stacks for subpages.

```css
--serif: "はんなり明朝", "Hannari Mincho", YuMincho, "Yu Mincho",
  "Noto Serif JP", "ヒラギノ明朝 ProN W3", "Hiragino Mincho ProN", serif;

--sans: "Noto Sans JP", "ヒラギノ角ゴ ProN W3", "Hiragino Kaku Gothic ProN",
  "Yu Gothic", Meiryo, sans-serif;

--latin: "Quattrocento", YuMincho, "Yu Mincho", "Noto Serif JP", serif;
```

- Major Japanese headings use `var(--serif)`, generally at weight 500.
- Body copy, navigation, links, addresses, and tables use `var(--sans)`.
- Some existing English labels use `var(--latin)`.
- The default body style is approximately `15px / 1.9` with weight 400.
- Heading sizes scale with `clamp()` and vary by component.
- Japanese prose needs comfortable line spacing, generally around 1.8–2.1.
- Existing rendering settings include `font-feature-settings: "palt" 1`, antialiasing, and text size adjustment.
- Font names are fallback preferences. No bundled font files, font loader, or external webfont import has been established in the current implementation. Available installed fonts determine the actual face rendered.

## Layout and spacing

- Main content is generally capped at 1380px, with responsive outer framing.
- Shared spacing tokens include:

  ```css
  --frame: clamp(10px, 2vw, 26px);
  --sx: clamp(18px, 4vw, 56px);
  ```

- Use the current `--sy` value from the shared stylesheet; it has later overrides.
- Use CSS Grid for editorial sections, photo/text pairs, product groups, and card rows.
- Use Flexbox for navigation, metadata, controls, and compact link groups.
- On narrow screens, stack content and retain legible text sizes rather than shrinking a desktop composition.
- Photos should have deliberate aspect ratios and appropriate `object-fit` / `object-position`.
- Use subtle borders and space to separate sections. Prefer white backgrounds.
- Preserve visible focus outlines and adequate touch targets.

## Main header

Current page state (2026-09-25): for local testing, the root landing page contains
copies of the shared header and footer code without SSI directives. Subpages load `stylesheet/nav-slot.css` and
start with an empty `.site-nav-slot`: 104px on desktop and 90px at 960px and
below. Replace a subpage placeholder with the SSI include rather than adding
navigation alongside it.
See `docs/ssi-navigation-slot.md`. The header specifications below describe the
previous implementation, not a currently visible shared navigation bar.

Prepared for later integration (2026-09-25): `header.shtml` and `footer.shtml`
are root-level SSI fragments. Their scoped component styles and navigation
behavior are embedded directly in `header.shtml`, while footer CSS and behavior
are embedded in `footer.shtml`. The shared header is sticky, has desktop
hover dropdowns, and switches to a mobile menu at 1120px. Local paths in these
fragments are root-relative and follow the current project folders. The landing
page uses inline copies; subpages still use the empty navigation slots.
Integration steps, hosting limitations, and the
path table are in `docs/ssi-includes.md`; `docs/ssi-preview.shtml` is a noindex
preview for an SSI-capable server. No hosting configuration was enabled.

The landing header uses `.site-header.landing-header`.

- Full browser width, with `width: 100%`, no maximum width, and no horizontal margin.
- Sticky at `top: 0`, with `z-index: 90`.
- Solid white background, a 3px golden dark brown top line, a light bottom border, and a subtle shadow.
- Desktop minimum height is 104px with 22px vertical padding.
- Desktop logo width scales from approximately 205px to 260px.
- Desktop navigation text is 15px; the 961–1200px range uses a more compact 13px treatment.
- Dropdown text is 14px on desktop and 15px on mobile.
- Mobile navigation text is 16px, with a clearly visible menu toggle.
- At 960px and below, navigation becomes a collapsible menu.
- Mobile navigation scrolls within the available viewport height.
- The owner club link is a filled dark brown button.
- Dropdowns use native `<details>` / `<summary>` elements.
- On desktop with a fine hover pointer, dropdowns open on mouse hover. Closing is delayed by 180ms to allow movement into the panel.
- Click/tap and keyboard controls remain available. Escape closes a dropdown or mobile menu and restores focus where appropriate.
- Clicking outside closes the navigation. Only one dropdown is open at a time.
- Section anchors have scroll offsets so the sticky header does not cover the target.

## Landing page component patterns

| Component | Main selectors | Design / behavior |
| --- | --- | --- |
| Hero | `.hybrid-hero`, `.hybrid-hero__scene`, `.hybrid-hero__copy` | Three photographic scenes with Japanese copy, navigation dots, touch swipe, and responsive image positioning |
| Philosophy | `.statement`, `.statement__layout`, `.statement__grid` | Photo and editorial text with restrained line accents |
| Exterior projects | `.exterior-works`, `.exterior-card` | Responsive photographic gallery with project titles and links |
| Design Inspiration | `.design-feature`, `.design-feature__visual`, `.design-feature__copy` | White background, real project photograph, serif heading, supporting copy, exterior color swatches, and consultation link |
| Product collection | `.lineup`, `.home`, `.home-selector` | Large photography and text, three product choices, responsive layouts |
| Materials | `.seven`, `.seven__list` | Large image and numbered material policy list |
| Performance / warranty | `.performance-ledger`, `.assurance-grid`, `.warranty` | Structured feature and warranty information |
| Building journey | `.process.alt-flow`, `.step-tab`, `.step-detail` | Seven selectable steps updating one detail panel |
| Journal & Events | `.news-preview`, `.preview-card` | Blog/event tabs with dated linked rows and large thumbnails |
| Local offices | `.local`, `.local__copy` | Photo and business location information |
| Contact | `.contact`, `.contact-card` | Phone, email, and LINE methods, including a QR image |

Journal & Events thumbnails are 200–260px wide at 700px and above, with an 8:5 aspect ratio. They are 112×100px on mobile, reducing to 96×96px on very narrow screens. Preserve the larger thumbnail treatment.

The Design Inspiration section currently uses `/img/home/design-inspiration-walkway-retouched.jpg`, from the Fujisou project “渡り廊下がつなぐおうち.” Do not reuse a project already prominently pictured in the gallery when replacing this image.

## Technical stack

| Technology | Actual role |
| --- | --- |
| HTML5 | Static Japanese pages, semantic sections, native details/summary, image metadata, ARIA attributes |
| CSS3 | Handwritten styles using variables, Grid, Flexbox, media queries, `clamp()`, aspect ratios, transitions, gradients, and sticky positioning |
| Vanilla JavaScript | DOM events, hero sliders, reveal effects, category tabs, building journey, and responsive navigation |
| WebP / JPEG / PNG | Locally stored photographic and graphic assets |
| Node.js | Optional local syntax and stylesheet checks; observed environment version `v24.18.0` |
| Lightning CSS | Optional local CSS parsing / validation; locally installed version `1.32.0` |
| Git | Version control; local caches and dependencies excluded by `.gitignore` |
| Lolipop hosting | User's intended hosting platform; current deliverables are static files |

There is no established React, Vue, Next.js, TypeScript, application backend, database, CMS integration, or required production build pipeline in this repository. The website does not need Node.js to run on the hosting server.

`node_modules` also contains Tailwind CSS `4.3.3`, `@tailwindcss/cli` `4.3.3`, `@tailwindcss/node` `4.3.3`, and `@parcel/watcher` `2.5.1`. These are locally present tooling, not evidence that the site uses Tailwind utilities or an active Tailwind build. No root `package.json` or root lockfile is currently established, so do not document nonexistent npm scripts.

## Browser behavior

`script/fujisou-ainos.js` is loaded with `defer` by pages that use it.

- Adds the `.js` class to the document for enhanced presentation.
- Uses `IntersectionObserver` for `.reveal` elements, with a fallback that shows content.
- The main hybrid slider rotates approximately every 3700ms, starts after a delayed load trigger, pauses when the document is hidden, and honors reduced motion.
- Touch gestures switch hero slides when horizontal movement exceeds 50px.
- News tabs use `data-news-tab` and `data-news-category`, update `hidden` and `aria-selected`, and change the category's “more” link.
- Building journey tabs use `data-step` and update the title, copy, note, and mark in the detail panel.
- Native navigation details are enhanced by hover, click-outside, Escape, and responsive menu handlers.
- A form enhancement helper exists, but the current contact/consultation stub pages do not implement a complete form submission backend.
- An older `[data-hero-slider]` implementation also remains in the file; the main page currently uses `[data-hybrid-slider]`.

Do not assume full ARIA tab keyboard navigation or complete no-JavaScript behavior has been tested merely because tab roles are present.

## Assets and image treatment

- Assets live in `img/`, organized by page folder name. Shared assets live in `img/common/`; use root-relative `/img/...` URLs.
- Many images have responsive WebP variants at widths such as 480, 720, 768, 900, 1400, and 1536px.
- Use `srcset` and `sizes` when suitable variants actually exist.
- Set truthful `width` / `height`, descriptive Japanese alt text, `loading="lazy"` below the fold, and `fetchpriority="high"` for the primary image when appropriate.
- Preserve original assets and create sibling filenames for retouches.
- Retouches were created using built-in imagegen. Some JPEG delivery assets were converted locally using PowerShell / .NET `System.Drawing`.
- AI retouches need visual inspection; do not describe reconstructed details as documentary originals.
- Current Design Inspiration delivery image: `design-inspiration-walkway-retouched.jpg`, 1619×971; source: `inspiration-walkway-original.jpg`.
- `design-inspiration-takaoka-retouched.jpg` is an older replacement, no longer used in that section.
- Open house uses `charcoal-wood-finished-door.png`, with the white temporary construction door changed to a finished charcoal door. Its graphics are HTML/CSS around the image, not baked into it.
- Concept photographs include `concept-family.jpg` (1000×700) and `concept-founder.jpg` (1200×780). The latter depicts a mother and child; its filename does not mean it is a portrait of the founder.
- Additional retouched exterior, kitchen, and product images already exist. Inspect their current use before substituting assets.

## File organization and implementation rules

Keep shared landing styles in `stylesheet/fujisou-ainos.css`, concept-specific styles in `stylesheet/concept.css`, and independent open house styles in `stylesheet/open-house.css`.

Scope subpage CSS to its page class or components. Avoid broad changes to shared `body`, heading, or navigation rules that unintentionally redesign other pages. The shared CSS contains substantial historical overrides; inspect the full cascade before editing. Prefer changing the relevant final rule over accumulating additional contradictory blocks.

Use root-relative image URLs such as `/img/concept/concept-family.jpg`, regardless of page depth. A subfolder deployment requires a consistent base prefix. Some navigation links intentionally lead to the existing live website.

All maintained pages currently embed real shared header/footer markup, CSS, and JavaScript. `/include/header.shtml` and `/include/footer.shtml` remain component sources for a later SSI switch; root/server header/footer files are compatibility wrappers. See `DEPLOY_SSI.md`. Do not enable the commented Clarity tracking snippet from the old header source merely because it was provided as reference.

## Local checks

No mandatory automated test suite or build command is configured. Useful checks:

```sh
node --check script/fujisou-ainos.js
git diff --check
```

Optional CSS parsing with the locally installed Lightning CSS:

```js
const fs = require('fs');
require('lightningcss').transform({
  filename: 'fujisou-ainos.css',
  code: fs.readFileSync('stylesheet/fujisou-ainos.css')
});
```

The README suggests `python3 -m http.server 8080` for local preview if Python is available. Python was not functioning in the observed Windows environment, so do not assume that command will work everywhere. Static HTML can also be opened directly for basic preview.

Check desktop, tablet, and mobile layouts in a browser, particularly header overflow, dropdown pointer movement, mobile navigation height, photo crops, anchor offsets, and Japanese line wrapping. CSS parsing and JavaScript syntax checks do not replace visual verification.

## Reference priority

1. The user's latest explicit preferences.
2. The current root `index.html` design and final shared CSS rules.
3. Existing professional Japanese content and verified project references.
4. This document.

The README's header description is outdated. Existing pages reserve an empty navigation slot; the new full-width sticky header is prepared in `header.shtml` for later SSI integration. Keep this document synchronized with future agreed design changes.
