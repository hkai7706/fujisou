# Deployment and optional SSI

`dist/` is the only upload package. The former `server/` folder has been removed.
See README.md for build commands and `docs/SSI.md` for component maintenance.

The default output embeds its header/footer and runs on static hosting without SSI.
Source fragments live in `include/`; root header/footer files are compatibility
wrappers. All images are grouped under `img/` by page/component.

Use `npm run build` for a noindex static test package, or `npm run build:public`
for indexable static output at the business domain. Upload dist contents, including
.htaccess, to the intended document root. Never upload source/tools/docs/dependencies
or private originals. Do not overwrite a working mail installation or customer data.

If SSI is explicitly desired, `tools/use-ssi-chrome.mjs` provides the alternate
mode. Apache must process the containing pages; ordinary static hosting cannot
execute SSI comments. Test on the actual host, and consistently adjust paths for
subfolder deployment. Merge access settings with existing host configuration.

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
