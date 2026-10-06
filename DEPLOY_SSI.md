# Shared image and SSI layout

Current state: header/footer code has been embedded back into all 30 maintained pages. They render without header/footer SSI processing. The shared include files and the optional SSI instructions below are retained for later use. Image organization remains unchanged.

All maintained website pages now use one shared image tree at the domain root:

| Folder | Assets |
| --- | --- |
| `img/common/` | Logos, footer texture, LINE QR |
| `img/home/` | Landing-page hero and general lifestyle imagery |
| `img/concept/` | Company/concept imagery |
| `img/staff/` | Staff portraits |
| `img/gallery/` | Gallery thumbnails and project photography |
| `img/plans/` | Plans, product photography, drawings |
| `img/eventinfo/` | Events and open-house imagery |
| `img/staffblog/` | Blog imagery |
| `img/shikkui/` | Plaster imagery |
| `img/policy/`, `img/land-info/` | Page-specific imagery |

Image URLs are root-relative (`/img/...`) so the same assets work from every nested page. All responsive candidates, preloads, CSS backgrounds, icons, and structured/social image URLs have been migrated. `tools/image-path-map.json` records old-to-new paths. Backup and generated report folders were not migrated.

## Shared components

The editable component sources are `include/header.shtml` and `include/footer.shtml`. Each includes its own CSS/JavaScript. Pages reference:

```html
<!--#include virtual="/include/header.shtml" -->
<!--#include virtual="/include/footer.shtml" -->
```

The leading slash is intentional: `include/header.shtml` without it would resolve differently in nested pages. Root and server `header.shtml`/`footer.shtml` files are compatibility wrappers, not independent component copies.

Upload `img/` and `include/` to the domain's document root, together with the changed pages, CSS, and JavaScript. Do not place `img/` only beneath an individual page folder. If deploying the project under `/FUJISOU-NEW/` instead of the domain root, change all root-relative asset/include URLs to include that prefix, or deploy the shared `img/` and `include/` directories at the domain root. Avoid replacing an existing live shared include until that replacement is intended.

The project `.htaccess` enables SSI for HTML/SHTML. Merge it with existing hosting settings rather than replacing unrelated live settings. Actual SSI execution must be tested on Lolipop. A plain static server, a file opened directly, and GitHub Pages will not render SSI directives.

`npm run check` validates ordinary image references, srcset candidates, CSS backgrounds, and header/footer include paths. `npm run build` produces `dist/`, including the shared SSI modules and referenced assets. The historical `server/` landing-page copy is kept as source material and excluded from the full-project deployment build.

`server/index.html` also retains existing meta/analytics SSI references; those still require the corresponding live server files and are outside the two shared component files created here.
