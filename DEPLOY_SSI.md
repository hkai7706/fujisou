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
