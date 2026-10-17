# Fujisou Ainos website

Japanese static website for フジ創アイノス. Public pages contain their header/footer directly, so GitHub Pages and ordinary local web servers can render them without SSI. The shared sources are `include/header.shtml` and `include/footer.shtml`.

## Preview and checks

```powershell
npm.cmd run preview
npm.cmd run check
```

Open `http://127.0.0.1:5501/`. Folder URLs automatically load their index through the web server; `file://` does not provide directory-index routing. Mailform Pro requires the Lolipop Perl CGI environment and cannot send from this static preview or GitHub Pages.

After changing shared components run `node tools/embed-shared-chrome.mjs`. Page generators should run before the final build so metadata, shared components and asset versions are reapplied.

## Deployment

```powershell
# Separate Lolipop test folder; complete private Mailform runtime; noindex
npm.cmd run build:preview
node tools/site-check.mjs dist

# Only when launching the actual production site
npm.cmd run build:production
node tools/site-check.mjs dist
```

Both commands recreate ignored `dist/`. Upload its CONTENTS, including hidden `.htaccess` files, to the intended server folder. Never upload the project root, `tmp/`, downloaded original, Git files or node_modules. Source/GitHub pages intentionally remain noindex; the production build removes preview noindex while preserving intentional archive/utility noindex. Production canonicals use `https://www.fujisou-ainos.com/`.

`npm.cmd run build` creates a public-only preview package without CGI. It is not a complete working contact-form deployment. The complete build commands above require the locally prepared, ignored `contact/mailformpro/` and `contact/mfp.statics/` packages. On a fresh checkout, prepare these once from the downloaded original with `node tools/prepare-contact-mailform.mjs`; it refuses to overwrite an existing runtime. Customer records are excluded from every build. Preserve the live form's existing `data/` on subsequent updates.

See [docs/INQUIRY_UPDATE.md](docs/INQUIRY_UPDATE.md) for source evidence, tests, unresolved business details and the precise upload/live email checklist. [docs/CONTACT_FORM.md](docs/CONTACT_FORM.md) describes form settings. No production upload or actual inbox-delivery verification has been performed for this update.

For lossless image optimization use `npm.cmd run optimize`. It consolidates identical files and uses smaller lossless encodings after checking decoded pixels. Responsive event-poster variants retain the full-size original. See [DEPLOY_SSI.md](DEPLOY_SSI.md) for optional SSI deployment details; SSI is not required by the current embedded pages.
