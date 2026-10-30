# Deployment and shared SSI components

`dist/` is the only upload package. The former `server/` folder has been removed.
See README.md for build commands and `docs/SSI.md` for component maintenance.

The main project embeds the shared header/footer for local preview and GitHub Pages.
Every dist build replaces those copies with server-side includes:

```html
<!--#include virtual="/include/header.shtml" -->
<!--#include virtual="/include/footer.shtml" -->
```

The deployed shared markup lives in `dist/include/header.shtml` and
`dist/include/footer.shtml`. Changing either file updates all deployed pages.
Page CSS/scripts remain in their existing heads; homepage styling stays bundled.

Use `npm run build` for a noindex static test package, or `npm run build:public`
for indexable static output at the business domain. Upload dist contents, including
.htaccess, to the intended document root. Never upload source/tools/docs/dependencies
or private originals. Do not overwrite a working mail installation or customer data.

Apache/Lolipop must process SSI in HTML and SHTML; the packaged .htaccess requests
this. `npm run preview:dist` resolves the includes locally. Use the source project,
not dist, for GitHub Pages. Test SSI on the actual host and merge access settings
with existing hosting configuration. Do not run `tools/use-ssi-chrome.mjs` on the
source project: dist conversion is now handled automatically by
`tools/build-dist-ssi.mjs` at the end of packaging.

For a staging subfolder, after building run
`node tools/build-dist-ssi.mjs dist --base=/FUJISOU-NEW/` and use the matching
Movable Type `ainos_root`. The default upload destination is the domain root.

`docs/archive/ssi-deployment-legacy.md` records the old migration for reference.

## Movable Type articles and automatic homepage updates

Use the standard templates in `cms/movable-type/` for future blog/event posts.
The title/date/photo and contact/navigation areas are fixed; `EntryBody` and
`EntryMore` are the editable middle. Publication also rebuilds each section's
`latest-cards.inc`, which updates the homepage JOURNAL & EVENTS cards.

Run `npm run movabletype:prepare` to prepare modules, and follow
[docs/MOVABLE_TYPE.md](docs/MOVABLE_TYPE.md) for installation and MT-owned paths.
After `build:public`, optional `npm run movabletype:home` enables SSI homepage
cards in dist for Lolipop. Do not run that SSI step for GitHub Pages. The actual
MT version/configuration and a real publishing test are still required.
