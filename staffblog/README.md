# Blog maintenance

This is a static archive, not a connected CMS. `posts.json` is the source for
titles, publication dates, categories, article HTML, source URLs and descriptive
filenames. Its current records are authoritative; MIGRATION.md records earlier
import statistics and intermediate designs.

Edit records or matching `article-bodies/*.fragment` overrides before generating
pages. Layout is controlled by `tools/build-blog.mjs`, `tools/build-blog-archive.mjs`,
`stylesheet/blog-body.css`, `blog-archive.css` and `staffblog.css`.
The illustration renderer uses the existing typography graphics and configuration;
older scene-image notes are historical, not the current renderer specification.

```powershell
npm.cmd run blog
node tools/update-blog-redirects.mjs
npm.cmd run refresh
npm.cmd run check
npm.cmd run check:seo
```

Article and category/pagination pages are generated HTML. Direct changes to them
can be overwritten by the generator. Shared components come from include/.
Article photos and thumbnails remain local assets under img/staffblog/; preserve
original content and do not invent substitutes for unavailable documentary photos.

Old article addresses are maintained by the root .htaccess redirect map. There is
no server/ copy to update. Apache redirects require the production host; GitHub
Pages does not execute .htaccess. Site navigation uses the descriptive current URLs.

Build only dist/ for upload using the project-root README. Ordinary packaging does
not regenerate the source archive; explicit blog/refresh commands do. Imported
historical claims are not independently certified by a successful build.
