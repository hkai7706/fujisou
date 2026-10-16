# Fujisou Ainos website

Static Japanese website for フジ創アイノス. The root `index.html` defines the main visual direction; subpages reuse that typography, color system, header, and footer.

## Local preview

Use a local web server from this folder. Every page includes its header and footer directly; SSI is not required.

```powershell
npx serve .
```

All pages now contain real header/footer markup, CSS, and JavaScript for direct rendering. The `include/header.shtml` and `include/footer.shtml` sources remain available for a future SSI switch. Images are centralized under `/img/` with folders for common, home, gallery, plans, staff, and other page groups. See [DEPLOY_SSI.md](DEPLOY_SSI.md) for the image layout and optional SSI deployment requirements.

## Before deployment

```powershell
npm run prepare
npm run sitemap
npm run check
npm run build
```

`prepare` adds stable image dimensions, asynchronous decoding, and lazy loading where appropriate. `sitemap` rebuilds the sitemap from canonical URLs. `check` verifies page metadata, image accessibility attributes, and local file references without network access. `build` creates a clean `dist` folder containing only deployable files and referenced assets.

For lossless image optimization, run `npm run optimize`. This consolidates identical files and uses smaller lossless WebP copies only after verifying identical decoded pixels. Image dimensions stay unchanged.

## Lolipop deployment

Upload the contents of `dist`, including its `.htaccess`, to the domain document root. The included `.htaccess` enables compression, browser caching, legacy public URL routing, basic response headers, a custom 404 page, and disables directory listing.
