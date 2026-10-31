# Fujisou Ainos upload-folder paths and routes

This document treats the **upload folder itself as the website root**. Every path below is relative to the folder whose contents are uploaded to Lolipop.

```text
Path inside upload folder: plans/products/cute/index.html
Lolipop server path:       /plans/products/cute/index.html
Public route:              https://www.fujisou-ainos.com/plans/products/cute/
```

The complete page-by-page list is in [`ROUTE_INVENTORY.csv`](ROUTE_INVENTORY.csv).

## Root files

| File | Public route or purpose |
|---|---|
| `index.html` | `/` — homepage |
| `404.html` | Custom not-found page |
| `.htaccess` | HTTPS, `www`, SSI, redirects, caching, compression and security |
| `robots.txt` | Search crawling rules |
| `sitemap.xml` | Search-engine URL list |
| `favicon.ico` | Browser icon |
| `favicon.deploy.webp` | WebP favicon |
| `apple-touch-icon.deploy.webp` | Mobile icon |

## Main page folders

| File inside upload folder | Public route | Purpose |
|---|---|---|
| `concept/index.html` | `/concept/` | Company, concept and offices |
| `staff/index.html` | `/staff/` | Staff introduction |
| `policy/index.html` | `/policy/` | Privacy policy |
| `consultation/index.html` | `/consultation/` | Free consultation |
| `contact/index.html` | `/contact/` | Inquiry form |
| `process/index.html` | `/process/` | Building process |
| `performance/index.html` | `/performance/` | Structure, insulation and specifications |
| `cost/index.html` | `/cost/` | Price and total-budget guidance |
| `aftercare/index.html` | `/aftercare/` | Warranty and maintenance |
| `shikkui/index.html` | `/shikkui/` | Plaster and natural materials |
| `renovation/index.html` | `/renovation/` | Renovation |
| `download/index.html` | `/download/` | Booklet information |
| `videos/index.html` | `/videos/` | Video listing |
| `land-info/index.html` | `/land-info/` | Land information |
| `loan-simulation/index.html` | `/loan-simulation/` | Mortgage calculator |

To change one of these pages, find the matching folder and edit its `index.html`.

## House-plan folders

### Category pages

| File | Public route |
|---|---|
| `plans/index.html` | `/plans/` |
| `plans/hiraya/index.html` | `/plans/hiraya/` |
| `plans/two-story/index.html` | `/plans/two-story/` |
| `plans/custom/index.html` | `/plans/custom/` |

### Real product pages

| File | Public route |
|---|---|
| `plans/products/cute/index.html` | `/plans/products/cute/` |
| `plans/products/healthy/index.html` | `/plans/products/healthy/` |
| `plans/products/hirayahouse/index.html` | `/plans/products/hirayahouse/` |
| `plans/products/pretty/index.html` | `/plans/products/pretty/` |
| `plans/products/simply/index.html` | `/plans/products/simply/` |
| `plans/products/smart/index.html` | `/plans/products/smart/` |
| `plans/products/premium/index.html` | `/plans/products/premium/` |

These are the real pages containing product text, images, specifications and SEO metadata.

## Old product-route folders

These are compatibility redirects, not duplicate product pages:

| Old file | Redirect destination |
|---|---|
| `cute/index.html` | `/plans/products/cute/` |
| `healthy/index.html` | `/plans/products/healthy/` |
| `hirayahouse/index.html` | `/plans/products/hirayahouse/` |
| `pretty/index.html` | `/plans/products/pretty/` |
| `simply/index.html` | `/plans/products/simply/` |
| `smart/index.html` | `/plans/products/smart/` |
| `premium/index.html` | `/plans/products/premium/` |

For example, `/cute/` redirects to `/plans/products/cute/`. The old folder protects historical Google results, bookmarks and external links. Change Cute content only in `plans/products/cute/index.html`.

Other compatibility routes include:

| Old file | Redirect destination |
|---|---|
| `material/index.html` | `/shikkui/` |
| `spec/index.html` | `/performance/` |
| `after/index.html` | `/aftercare/` |
| `ainos-planning/index.html` | `/plans/hiraya/` |
| `ainos-2f-planning/index.html` | `/plans/two-story/` |
| `ainos-custom/index.html` | `/plans/custom/` |

The `.htaccess` rules perform permanent redirects on Lolipop. The small HTML files are fallbacks.

## Construction examples

| File pattern | Purpose |
|---|---|
| `gallery/index.html` | `/gallery/` main listing |
| `gallery/page-2.html` | Second listing page |
| `gallery/page-3.html` | Third listing page |
| `gallery/{descriptive-name}.shtml` | Individual construction example |
| `img/gallery/` | Construction photographs |

Examples include `gallery/takaoka-couple-house.shtml`, `gallery/wood-and-tatami-house.shtml`, and `gallery/toyama-whole-house-renovation.shtml`. Old filenames such as `gallery/post-32.shtml` redirect to the descriptive route.

## Blog folders

| Location | Purpose |
|---|---|
| `staffblog/index.html` | Blog listing at `/staffblog/` |
| `staffblog/page-*.html` | Pagination |
| `staffblog/category-*.html` | Category archives |
| `staffblog/*-archive.html` | Date archives |
| `staffblog/*.shtml` | Individual articles |
| `staffblog/latest-cards.inc` | Latest homepage blog cards from Movable Type |
| `staffblog/uploads/` | Retained imported assets |
| `img/staffblog/` | Optimized article images and thumbnails |

When Movable Type is active, create and update posts through Movable Type. It republishes articles, archives and `latest-cards.inc`.

## Event folders

| Location | Purpose |
|---|---|
| `eventinfo/index.html` | Event listing at `/eventinfo/` |
| `eventinfo/page-*.html` | Pagination |
| `eventinfo/*.html` and `eventinfo/*.shtml` | Imported events and compatibility routes |
| `eventinfo/{event-name}/index.html` | Maintained special event page |
| `eventinfo/latest-cards.inc` | Latest homepage event cards from Movable Type |
| `img/eventinfo/` | Event photos and posters |

Use Movable Type for new events so the event listing and homepage cards update together.

## Contact and mail folders

| Location | Purpose |
|---|---|
| `contact/index.html` | Inquiry form page |
| `contact/thanks.html` | Styled result page |
| `contact/thanks.shtml` | Mailform compatibility redirect |
| `contact/mailformpro/config.cgi` | Recipient, automatic reply and thank-you settings |
| `script/contact.js` | Form integration |
| `script/contact-thanks.js` | Receipt verification |
| `stylesheet/contact.css` | Form and confirmation design |

The upload package contains the updated Mailform configuration, not the whole CGI runtime. These working server paths must remain on Lolipop:

```text
/contact/mailformpro/mailformpro.cgi
/contact/mailformpro/data/
/contact/mfp.statics/
```

Upload by merging with those folders. Do not delete them first.

## Shared header and footer

| Location | Purpose |
|---|---|
| `include/header.shtml` | Shared site header |
| `include/footer.shtml` | Shared site footer |
| `script/shared-chrome.js` | Shared navigation behavior |
| `stylesheet/shared-chrome.min.css` | Shared header/footer styling |

Normal pages use SSI:

```html
<!--#include virtual="/include/header.shtml" -->
<!--#include virtual="/include/footer.shtml" -->
```

Lolipop inserts these shared files. Changing `include/header.shtml` or `include/footer.shtml` updates every SSI-enabled page after the include file is uploaded.

## Asset folders

| Folder | Contents |
|---|---|
| `img/` | Website images organized by page |
| `stylesheet/` | CSS |
| `script/` | JavaScript and modules |
| `fonts/` | Local fonts |
| `catalogs/` | PDF catalogues |
| `include/` | SSI components and fragments |

Images use WebP/JPG. Converted files may end with `.deploy.webp`. Do not rename an image unless all references are updated.

## Homepage updates from Movable Type

The homepage receives new cards through these SSI fragments:

```text
staffblog/latest-cards.inc
eventinfo/latest-cards.inc
```

Movable Type republishes them whenever a post or event is published.

## Server and redirect behavior

The `.htaccess` file controls HTTPS, `www`, SSI, old-page redirects, the custom 404 page, compression, caching, security headers and disabled directory listings. Keep old redirect rules unless it is confirmed that no Google result, bookmark or external page uses the old address.

## Safe update workflow

1. Find the page using this guide or `ROUTE_INVENTORY.csv`.
2. Edit the matching file inside the upload folder.
3. Keep compatibility folders when editing a real canonical page.
4. Preserve the existing Mailform runtime folders on Lolipop.
5. Upload changed files with the same relative folder paths.
6. Include hidden `.htaccess` when server rules change.
7. Test the route on desktop and mobile.
8. For contact changes, test confirmation, submission, automatic email and the thank-you page.

## Complete inventory columns

Open `ROUTE_INVENTORY.csv` in Excel. It contains:

- **Public route** — browser path after the domain.
- **File path inside upload folder** — exact file to locate or upload.
- **Page type** — maintained page, plan, construction example, blog, event, utility or redirect.
- **Canonical URL** — preferred search-engine URL.
- **Redirect target** — destination used by a compatibility page.
- **SSI header/footer** — whether the page uses the shared server-side header and footer.

