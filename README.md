# Fujisou Ainos website

Static Japanese website for フジ創アイノス. The root `index.html` defines the main visual direction; subpages reuse that typography, color system, header, and footer.

## Local preview

Run any static HTTP server from this folder. For example:

```powershell
npx serve .
```

The page files currently contain local copies of the shared header and footer so they also work without SSI during development. `header.shtml` and `footer.shtml` remain the canonical server-side include versions for a later SSI migration.

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
