# Fujisou Ainos website

Japanese static website for フジ創アイノス. HTML, CSS and vanilla JavaScript run
without a production Node server. `dist/` is the public website upload package. The obsolete
`server/` copy has been removed.

## Separate private analytics

The dashboard has no link in the public website navigation. Build its separate
packages with `npm run analytics:build`; validate with `npm run check:analytics`
(PHP with PDO SQLite and Chrome required). `analytics-service-dist/` runs on
Lolipop; `analytics-portal-dist/` can be hosted separately. GitHub Pages can host
the dashboard and website; the PHP service must run on Lolipop. Tracking stays
disabled until a service URL is configured. Follow [docs/ANALYTICS.md](docs/ANALYTICS.md)
for setup. Never commit private configuration or visitor databases. Existing mail
delivery code is unchanged.

## Edit and preview

```powershell
npm.cmd ci
npm.cmd run preview
```

Open http://127.0.0.1:5501/. Source pages contain embedded header/footer markup
and work on GitHub Pages. The editable shared components are in `include/`.
Page HTML and the JSON records for blog, gallery, events and videos are maintained
in their corresponding folders. Edit records/templates before regenerating pages.

Shared CSS is maintained in `stylesheet/source/`, in the order recorded by
`order.json`. `stylesheet/fujisou-ainos.css` and minified stylesheets are generated
outputs; do not add competing overrides to them. See `claude.md` for design rules.

```powershell
npm.cmd run styles       # compile CSS and refresh source asset versions
npm.cmd run refresh      # intentionally regenerate maintained static source pages
npm.cmd run check
npm.cmd run check:seo
npm.cmd run check:performance
```

`refresh` deliberately changes source pages so GitHub Pages receives shared
updates. Ordinary deployment builds transform only `dist/`; they do not rewrite
the checked-in site. Regenerate blog/gallery content through its documented
command before `refresh` when those records change.
Legacy HTML normalization is explicitly available as `npm run prepare:html`;
dependency installation no longer triggers it through npm's `prepare` lifecycle.

## Package for upload

```powershell
npm.cmd run build          # SSI hosting test package, noindex
npm.cmd run build:public   # indexable SSI package, mail runtime excluded
```

Both validate links, metadata, image references and structured data automatically.
Source pages keep embedded headers/footers for GitHub Pages. Dist pages use shared
server-side includes from `include/header.shtml` and `include/footer.shtml`;
Apache/Lolipop must process SSI. Changing a deployed fragment updates all pages.
Use `npm run preview:dist` to review the exact package over HTTP.
Upload the CONTENTS of `dist/`, including hidden `.htaccess` files, to the intended
document root. Do not upload the repository, tools, docs, original photographs,
dependencies or Git files. `build:public` uses https://www.fujisou-ainos.com/ as
the canonical business domain. GitHub/source content pages are also indexable at
the owner's request; utility/archive/design-sample exclusions remain.

The existing optional `build:preview` and `build:production` commands additionally
include the private Mailform Pro runtime. They require its locally prepared files;
see `docs/CONTACT_FORM.md`. Mail behavior has not been changed by the folder cleanup.
Static packages and GitHub Pages do not send email. Preserve any existing live
mail configuration and customer data when uploading static updates.

## Maintenance references

- `PROJECT_FILE_MAP.md`: current folders and editing boundaries.
- `docs/SITE_DESIGN.md`: shared visual standards.
- `docs/SEO.md`: indexing, canonical URLs and sitemap maintenance.
- `docs/PAGESPEED.md`: image/CSS delivery and measured performance history.
- `docs/IMAGE_UPDATES.md`, `docs/VIDEOS.md`, `staffblog/MIGRATION.md`: content updates.
- `docs/SSI.md`: embedded source versus shared SSI header/footer in dist.

Dated audits and `docs/archive/` record previous implementations, not current
instructions. Event visibility is rendered into HTML during refresh/build using
Japan dates; browser JavaScript additionally updates status across expiry dates.

`node tools/check-build.mjs --production` builds public SSI output and verifies
shared includes and that maintained source files remain unchanged. It excludes the untouched private
mail runtime from that snapshot. Ordinary `npm run check:build` tests preview mode.
