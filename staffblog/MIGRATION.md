# Complete blog archive migration

The live archive was imported on 2026-10-10. It contains **949 unique articles across 32 original archive pages**, rather than the estimated 687.

- All 949 articles have separate descriptive `.shtml` files in `staffblog/`.
- The public listing starts at `staffblog/index.html`; `page-2.html` through `page-40.html` provide the remaining pages, with 24 articles per page.
- The main listing opens directly into posts, newest first. Category navigation is in a collapsed “テーマから記事を探す” section below the posts and pagination. The eight original category names are お知らせ, イベント, モデルハウス, 土地情報, 家づくりについて, 施工事例, 日常 and 社長ブログ. Each category has separate static paginated files (`category-*.html`), sorted newest first. Counts use the imported data; multi-category articles appear in all applicable collections. The earlier custom labels 資金計画 and 間取り・暮らし are grouped under 家づくりについて, and 土地・不動産 under 土地情報.
- Category navigation and pagination work without JavaScript. Cards display original article images when available; image-free articles remain text cards. The latest two posts have overrides using their original Fujisou thumbnails. The archive no longer loads the former search scripts or search metadata.
- Original thumbnails have now been recovered for 948 of the 949 posts by scanning 355 monthly listing pages on the live site. Files are downloaded locally under `img/staffblog/thumbnails/`, converted to WebP without enlarging small originals, and mapped in `thumbnail-overrides.json`. Run `node tools/import-blog-thumbnails.mjs` to refresh them, then `node tools/build-blog-archive.mjs`. `thumbnail-import-report.json` records the result. The post `7-1.shtml` has no available original thumbnail and stays text-only; no substitute or generated image is added.
- Original titles, dates, categories and full article wording are retained. The previous 20 article URLs and their approved illustrated layouts are preserved. Newly imported articles use the shared centered reading layout and original media.
- Article images are stored in `img/staffblog/articles/`. They are resized only when larger than 1600 pixels and optimized as WebP; small originals are not artificially enlarged. Image holders display the whole image without cropping.
- One original image in `post-289.shtml` could not be decoded. Its article remains available; a short notice replaces that unavailable image. Details are recorded in `import-report.json`.
- `posts.json` holds all article data and original source URLs; `archive-discovery.json` records the original archive crawl. `search-index.js` supplies lightweight listing search metadata.
- Root `.htaccess` redirects preserve original blog article addresses when deployed on Apache. GitHub Pages does not process Apache redirects.

## Updating the static site

Run `node tools/import-blog-archive.mjs` to refresh the imported archive (network access required). It caches fetched pages under ignored `tmp/blog-import/` and retains existing descriptive filenames.

Run `node tools/build-blog.mjs` to regenerate article pages and the paginated listing. Layout sources are `tools/build-blog.mjs`, `tools/build-blog-archive.mjs`, `stylesheet/staffblog.css`, `stylesheet/blog-body.css`, `stylesheet/blog-archive.css` and `script/blog-archive.js`. Existing illustrated articles additionally use the documented illustration configuration and body fragments.

Run `node tools/update-blog-redirects.mjs`, `node tools/generate-sitemap.mjs`, then `node tools/site-check.mjs`. Build deployment files with `npm.cmd run build` on Windows PowerShell.

This remains a static archive. Movable Type integration is a separate future step. The backup folder is untouched.

## Article typography graphics

The added scene illustrations inside the original 20 designed articles have been replaced with typography-led SVG images. `tools/blog-typography.mjs` creates the graphic assets under `img/staffblog/typography/`; `tools/blog-illustrations.mjs` now places these typographic graphics using the existing overview and section data. The custom renovation body fragment uses two matching graphics. The serif type, white backgrounds, charcoal text and restrained gold details follow the landing page. Captions retain explanatory text as selectable HTML, and each image has alternative text and dimensions. Original source photos, the latest two blog thumbnails, and the blog hero photo are unchanged.
