# Fujisou Ainos project file map

Project root:

`C:\Users\seren\Desktop\fujisou-new`

This report covers the active project only. The `backup` directory is intentionally excluded and untouched.

## How the site is connected

```text
Browser request
    ↓
index.html or a subpage index.html
    ↓
shared CSS: stylesheet/fujisou-ainos.css
page CSS: stylesheet/<page-name>.css when needed
    ↓
shared JavaScript: script/fujisou-ainos.js when needed
    ↓
images and other assets: images/
```

The root landing page uses Apache Server Side Includes:

```html
<!--#include virtual="/header.shtml" -->
<!--#include virtual="/footer.shtml" -->
```

SSI is enabled for `.html` and `.shtml` by `.htaccess`. The other subpages currently contain local inline copies of the shared header and footer, so editing `header.shtml` or `footer.shtml` directly affects the root landing page but does not automatically update those inline subpage copies.

## Root landing page

| Purpose | Full path |
|---|---|
| Main landing HTML | `C:\Users\seren\Desktop\fujisou-new\index.html` |
| Main and shared CSS | `C:\Users\seren\Desktop\fujisou-new\stylesheet\fujisou-ainos.css` |
| Main and shared JavaScript | `C:\Users\seren\Desktop\fujisou-new\script\fujisou-ainos.js` |
| SSI header | `C:\Users\seren\Desktop\fujisou-new\header.shtml` |
| SSI footer | `C:\Users\seren\Desktop\fujisou-new\footer.shtml` |
| Landing images | `C:\Users\seren\Desktop\fujisou-new\images` |

Connections from `index.html`:

- Loads `stylesheet/fujisou-ainos.css`.
- Loads `script/fujisou-ainos.js` at the end of the page.
- Includes `/header.shtml` and `/footer.shtml` through SSI.
- Links to `concept/`, `gallery/`, `plans/`, `shikkui/`, `consultation/`, `eventinfo/`, `staffblog/`, `land-info/`, and contact actions.
- Uses images directly from `images/` and its subdirectories.

## Shared files

| File | Role |
|---|---|
| `header.shtml` | Shared sticky navigation, responsive menu CSS, and header JavaScript. Uses root-relative URLs such as `/concept/`. |
| `footer.shtml` | Shared company information, contact links, footer navigation, social links, footer CSS, and current-page JavaScript. |
| `stylesheet/fujisou-ainos.css` | Global design tokens, typography, landing-page components, shared page styles, responsive rules, contact UI, and mobile fixed actions. |
| `script/fujisou-ainos.js` | Reveal effects, landing hero slider, seven-step interaction, event/blog tabs, and other shared interactive behavior. |
| `stylesheet/nav-slot.css` | Spacing and compatibility styles for subpages that contain the header navigation. |
| `stylesheet/breadcrumbs.css` | Shared breadcrumb styling for subpages. |

## Page-to-CSS-and-JavaScript map

### Company pages

| Public route | HTML file | CSS | JavaScript |
|---|---|---|---|
| `/concept/` | `concept/index.html` | `fujisou-ainos.css`, `concept.css`, `nav-slot.css`, `breadcrumbs.css` | `fujisou-ainos.js` |
| `/staff/` | `staff/index.html` | `fujisou-ainos.css`, `staff.css`, `nav-slot.css`, `breadcrumbs.css` | `fujisou-ainos.js` |
| `/policy/` | `policy/index.html` | `fujisou-ainos.css`, `policy.css`, `nav-slot.css`, `breadcrumbs.css` | No external page script |

### Contact and guidance

| Public route | HTML file | CSS | JavaScript |
|---|---|---|---|
| `/consultation/` | `consultation/index.html` | `fujisou-ainos.css`, `nav-slot.css`, `breadcrumbs.css` | `fujisou-ainos.js` |
| `/contact/` | `contact/index.html` | `fujisou-ainos.css`, `nav-slot.css`, `breadcrumbs.css` | `fujisou-ainos.js` |
| `/process/` | `process/index.html` | `fujisou-ainos.css`, `nav-slot.css`, `breadcrumbs.css` | `fujisou-ainos.js` |
| `/land-info/` | `land-info/index.html` | `fujisou-ainos.css`, `land-info.css`, `nav-slot.css`, `breadcrumbs.css` | `fujisou-ainos.js` |

### Events and blog

| Public route | HTML file | CSS | JavaScript |
|---|---|---|---|
| `/eventinfo/` | `eventinfo/index.html` | `fujisou-ainos.css`, `eventinfo.css`, `breadcrumbs.css` | `fujisou-ainos.js` |
| `/eventinfo/open-house/` | `eventinfo/open-house/index.html` | `open-house.css`, `nav-slot.css`, `breadcrumbs.css` | Inline behavior only |
| `/staffblog/` | `staffblog/index.html` | `fujisou-ainos.css`, `staffblog.css`, `nav-slot.css`, `breadcrumbs.css` | `fujisou-ainos.js` |

Event images are mainly stored in `images/eventinfo/`. Blog thumbnails are mainly stored in `images/staffblog/`.

### Construction gallery

| Public route | HTML file | Page CSS | JavaScript |
|---|---|---|---|
| `/gallery/` | `gallery/index.html` | `gallery.css` | `fujisou-ainos.js` |
| `/gallery/page-2.html` | `gallery/page-2.html` | `gallery.css` | `fujisou-ainos.js` |
| `/gallery/page-3.html` | `gallery/page-3.html` | `gallery.css` | `fujisou-ainos.js` |
| `/gallery/50ainos.shtml` | `gallery/50ainos.shtml` | `project-detail.css` | `fujisou-ainos.js` |
| `/gallery/post-31.shtml` | `gallery/post-31.shtml` | `project-detail.css` | `fujisou-ainos.js` |
| `/gallery/post-32.shtml` | `gallery/post-32.shtml` | `project-detail.css` | `fujisou-ainos.js` |
| `/gallery/toyama-inner-garage-house.shtml` | `gallery/toyama-inner-garage-house.shtml` | `project-detail.css` | `fujisou-ainos.js` |

All gallery pages also load `fujisou-ainos.css`, `nav-slot.css`, and `breadcrumbs.css`. Gallery imagery is stored throughout `images/`, including project-specific image names.

### Construction plans

| Public route | HTML file | CSS | JavaScript |
|---|---|---|---|
| `/ainos-planning/` → `/plans/hiraya/` | `plans/hiraya/index.html` | `fujisou-ainos.css`, `planning.css`, `nav-slot.css`, `breadcrumbs.css` | `fujisou-ainos.js` |
| `/ainos-2f-planning/` → `/plans/two-story/` | `plans/two-story/index.html` | `fujisou-ainos.css`, `planning.css`, `nav-slot.css`, `breadcrumbs.css` | `fujisou-ainos.js` |
| `/ainos-custom/` → `/plans/custom/` | `plans/custom/index.html` | `fujisou-ainos.css`, `planning.css`, `nav-slot.css`, `breadcrumbs.css` | `fujisou-ainos.js` |

The arrows above are Apache rewrite rules defined in `.htaccess` for compatibility with the original public URLs.

### Product-plan pages

| Original route | Active HTML file | CSS | JavaScript |
|---|---|---|---|
| `/cute/` | `plans/products/cute/index.html` | `fujisou-ainos.css`, `nav-slot.css`, `breadcrumbs.css` | `fujisou-ainos.js` |
| `/healthy/` | `plans/products/healthy/index.html` | `fujisou-ainos.css`, `nav-slot.css`, `breadcrumbs.css` | `fujisou-ainos.js` |
| `/hirayahouse/` | `plans/products/hirayahouse/index.html` | `fujisou-ainos.css`, `nav-slot.css`, `breadcrumbs.css` | `fujisou-ainos.js` |
| `/pretty/` | `plans/products/pretty/index.html` | `fujisou-ainos.css`, `nav-slot.css`, `breadcrumbs.css` | `fujisou-ainos.js` |
| `/simply/` | `plans/products/simply/index.html` | `fujisou-ainos.css`, `nav-slot.css`, `breadcrumbs.css` | `fujisou-ainos.js` |

The original routes are redirected internally by `.htaccess`. Product imagery is mainly in `images/plans/` and root-level `images/plan-*` files.

### Plaster page

| Public route | HTML file | CSS | JavaScript | Images |
|---|---|---|---|---|
| `/shikkui/` | `shikkui/index.html` | `fujisou-ainos.css`, `shikkui.css`, `nav-slot.css`, `breadcrumbs.css` | `fujisou-ainos.js` | `images/shikkui/` |

### Error page

| Public route | HTML file | Styling |
|---|---|---|
| Any missing URL | `404.html` | Self-contained inline styling |

`.htaccess` connects missing requests to `/404.html` through `ErrorDocument 404 /404.html`.

## Asset directories

| Directory | Contents |
|---|---|
| `images/` | Shared logos, hero photographs, gallery images, landing images, QR code, and product images. |
| `images/eventinfo/` | Event banners and event photography. |
| `images/plans/` | Plan-specific imagery. |
| `images/shikkui/` | Plaster-page photographs. |
| `images/staffblog/` | Blog thumbnails and related images. |
| `stylesheet/` | Global and page-specific CSS. |
| `script/` | Browser JavaScript. |

## SEO and server files

| File | Purpose |
|---|---|
| `.htaccess` | Apache/Lolipop settings, SSI support, redirects, compression, browser caching, security headers, and the 404 route. |
| `robots.txt` | Allows crawling and points search engines to `sitemap.xml`. |
| `sitemap.xml` | Lists public URLs for search engines. |
| `llms.txt` | Text summary for compatible AI and indexing tools. |
| `404.html` | Page shown for a missing URL. |

## Build and validation tools

| Command | Tool file | Result |
|---|---|---|
| `npm run check` | `tools/site-check.mjs` | Checks page metadata, local links, image alt text, and intrinsic image dimensions. |
| `npm run build` | `tools/build-deploy.ps1` | Creates the deployable `dist/` directory and copies only public files and referenced assets. |
| `npm run sitemap` | `tools/generate-sitemap.mjs` | Regenerates `sitemap.xml`. |
| `npm run prepare` | `tools/prepare-html.mjs` | Performs project HTML preparation tasks. |

Supporting tools:

- `tools/optimize-images.ps1` processes image assets.
- `package.json` defines the npm commands.
- `dist/` is generated output for deployment.
- `backup/` is a protected local snapshot and is excluded from checks, builds, and Git.

## What to edit for common changes

| Change requested | Primary file |
|---|---|
| Landing page text or section order | `index.html` |
| Landing page styling | `stylesheet/fujisou-ainos.css` |
| Hero slider, reveal effects, seven-step tabs, event/blog tabs | `script/fujisou-ainos.js` |
| Root landing header | `header.shtml` |
| Root landing footer | `footer.shtml` |
| Concept page design | `concept/index.html` and `stylesheet/concept.css` |
| Staff page design | `staff/index.html` and `stylesheet/staff.css` |
| Event index design | `eventinfo/index.html` and `stylesheet/eventinfo.css` |
| Open-house design | `eventinfo/open-house/index.html` and `stylesheet/open-house.css` |
| Gallery listing design | `gallery/*.html` and `stylesheet/gallery.css` |
| Gallery detail design | `gallery/*.shtml` and `stylesheet/project-detail.css` |
| Hiraya, two-story, custom plan design | `plans/*/index.html` and `stylesheet/planning.css` |
| Shikkui design | `shikkui/index.html` and `stylesheet/shikkui.css` |
| Blog design | `staffblog/index.html` and `stylesheet/staffblog.css` |
| Deployment redirects or SSI settings | `.htaccess` |

## Important maintenance note

At present, only the root `index.html` uses live SSI includes. Subpages still carry inline header and footer copies. Until those pages are converted to SSI, a navigation change should be applied to both `header.shtml` / `footer.shtml` and every inline subpage copy.
