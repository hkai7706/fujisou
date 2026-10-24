# Construction-example archive

This document records the original import and image recovery. Current project
slugs, folder organization and routine photo changes follow
[IMAGE_UPDATES.md](IMAGE_UPDATES.md). Use that workflow for maintenance.

The original three archive pages contain 34 projects. Their local individual
pages keep the original `.shtml` filenames so existing project links work.

- `gallery/projects.json`: source titles, areas, professional descriptions,
  captions, image dimensions, source URLs, and original-file SHA-256 hashes.
- `gallery/import-report.json`: completeness and recovery report.
- `img/gallery/projects/`: downloaded originals and responsive, lossless WebP
  display copies. Full-size originals open in the photo viewer.
- `stylesheet/gallery-project.css`: individual-page design.
- `script/gallery-project.js`: native-dialog viewer, arrows, Escape, focus return.

Run `node tools/import-gallery.mjs` to import the source archive. Downloaded
HTML and image metadata are cached under ignored `tmp/gallery-import/`.
One broken original image (`_APS53.jpg`) was recovered from the existing
local `img/gallery/post31-11-stairs-detail.jpg` photo.

Run `node tools/build-gallery-projects.mjs` to regenerate the details and the
three listing pages. Then run `npm run build` for the complete deployment
package; it reapplies exact-image deduplication and asset cache versions.
`node tools/sync-gallery-deploy.mjs` can update only the gallery deployment files.

Descriptions and photo captions are taken from the original site. Styling
removes empty image placeholders, preserves complete pictures, and uses the
project's shared header, footer, typography, and white/gold palette. No original
photos are recompressed. `backup/` is never edited.

## Faithful image enhancement

`node tools/enhance-gallery-images.mjs` prepares every unique gallery photo and
thumbnail using Lanczos3 resizing and gentle sharpening (`sigma: 0.5`,
`m1: 0.45`, `m2: 0.85`). Small inputs grow by at most 3×; large original files
remain available at their original resolution. Outputs use lossless WebP and
responsive widths rather than forcing every visitor to download the largest file.

`gallery/image-enhancements.json` records the source hashes and generated files.
`gallery/image-source-upgrades.json` selects verified higher-resolution versions
of the same photos where available. The builder applies both automatically.
The viewer uses enlarged versions for small inputs and original files for large
inputs. Software enlargement smooths and sharpens existing information; it does
not invent architectural features or recover detail absent from the source.
