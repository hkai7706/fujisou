# Current project file map

| Location | Role | Edit directly? |
|---|---|---|
| `index.html` | Homepage structure and Japanese copy | Yes |
| `concept/`, `staff/`, `plans/`, `performance/`, `cost/`, `aftercare/`, `shikkui/`, `process/`, `consultation/`, `land-info/`, `policy/` | Maintained content pages | Yes, except generator-owned product pages |
| `contact/` | Existing inquiry UI | Mail functionality unchanged |
| `include/` | Shared header/footer markup sources | Yes; then refresh |
| `header.shtml`, `footer.shtml` | Root SSI compatibility wrappers | Usually no |
| `stylesheet/source/` | Ordered editable shared CSS modules | Yes |
| `stylesheet/fujisou-ainos.css`, `*.min.css` | Compiled shared/homepage styles | Regenerate |
| Other `stylesheet/*.css` | Scoped page/component styling | Yes |
| `script/` | Browser JavaScript and calculator | Yes |
| `img/` | Shared and page-group delivery assets | Follow image-update workflow |
| `catalogs/` | Public PDF catalogues | Replace only with approved documents |
| `gallery/projects.json` and gallery maps | Project data/image mappings | Use gallery tools |
| `staffblog/posts.json`, body fragments and illustration data | Article source records | Yes; then blog generation |
| `eventinfo/posts.json` | Imported event records | Yes; then event generation |
| `videos/posts.json` | Confirmed video/house records | Yes; then video generation |
| `tools/` | Generators, packaging and validation | Yes |
| `docs/` | Current guidance and dated evidence | Yes; history stays dated |
| `docs/archive/` | Superseded implementation references | Historical only |
| `dist/` | Generated upload package | Never edit by hand |
| `tmp/`, `backup/`, `node_modules/` | Local-only work, snapshots and dependencies | Never deploy |

The obsolete `server/` folder was removed. Nothing in it is required for deployment.
The current .htaccess includes the legacy blog/gallery/product redirects.

## Workflows

1. Change page content, source records, shared markup or scoped CSS.
2. Run its specific generator if required, then `npm run refresh` for source preview/GitHub.
3. Review over HTTP and run the documented checks.
4. Run `npm run build` for a test package or `npm run build:public` for public static output.
5. Upload only dist contents; optional private mail packaging is documented separately.

Shared source regeneration can intentionally update many checked-in pages. Packaging
does not: header/CSS assembly, date-dependent event state, asset versions, SEO and
sitemap updates are applied to dist after copying. A source snapshot check verifies
that ordinary builds leave maintained files unchanged.
# Private analytics

Visitor measurement uses Google Analytics 4 (`G-17DNR9SPL4`). The retired custom
analytics portal/service is not part of the source or deployment package.
`script/analytics-config.js` holds the public endpoint (empty disables collection).
`npm run analytics:build` creates separate ignored upload packages; neither is
included in public `dist/`. Setup: [docs/ANALYTICS.md](docs/ANALYTICS.md).
