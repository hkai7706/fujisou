# Fujisou Ainos website

Static Japanese website for フジ創アイノス. The root `index.html` defines the main visual direction; subpages reuse that typography, color system, header, and footer.

## Local preview

Use an SSI-capable server from this folder. A plain static server will show page content but will not render the shared header/footer.

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

For large newly added JPG or PNG files, run:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File tools/optimize-images.ps1
```

The optimizer keeps original source images, creates smaller `-web.jpg` delivery copies, and updates page references only when the generated copy is smaller.

## Lolipop deployment

Upload the contents of `dist`, including its `.htaccess`, to the domain document root. The included `.htaccess` enables compression, browser caching, legacy public URL routing, basic response headers, a custom 404 page, and disables directory listing.
