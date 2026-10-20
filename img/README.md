# Image folders

The first-level folders correspond to website areas: `home`, `common`, `concept`,
`plans`, `gallery`, `videos`, `eventinfo`, `staffblog`, and the other named pages.

For construction gallery updates, read [the photo update guide](../docs/IMAGE_UPDATES.md).

- `gallery/originals/`: your named project folders and full-quality originals.
- `gallery/houses/`: generated website images, separated by project ID.
- `gallery/project-folders.json` in the project root: the searchable folder/page index.
- `gallery/projects/`, `gallery/viewers/`, and older loose gallery images: legacy assets.
  They are retained because older references or preparation tools may still need them.

Add photos to the matching **originals** folder, then use `npm.cmd run gallery:update`
or tell me the project and filename. Do not overwrite generated website images by hand.
The original filenames and image quality are preserved. Prepared website images use
content-based filenames so browsers can see the new version after an upload.

This workflow is specifically for gallery posts. Video, blog and event imagery keep
their respective content workflows. Publish `dist`, not the entire `img` folder.
