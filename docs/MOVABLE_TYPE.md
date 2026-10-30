# Standard blog/event posting with Movable Type

The standard **event article** follows the owner's screenshots: title/publication
date on the left, optional uncropped image on the right, editable middle, then
the fixed contact band and previous/next links. The **blog article** uses the
existing blog opening with the same fixed-shell/editable-middle arrangement.
The design already adapts to phones. Existing historical articles are preserved.

```
Shared website header
Category + publication date + title | optional cover photo
──────────────────────────────────────────────────────────
                    EntryBody
               Your text and photos
                    EntryMore
──────────────────────────────────────────────────────────
Fixed inquiry + telephone / previous and next posts
Shared website footer
```

## What the editor changes

| Movable Type field | What appears on the website |
| --- | --- |
| Title | Article heading and card title |
| Publication date | 掲載日 / blog publication date; not the event's actual date |
| Category | Blog category; put 開催終了 in an event title when it closes |
| Excerpt | Search/social description and listing introduction |
| Associated image asset | Top photo, social image and homepage thumbnail |
| Body / 本文 | Editable middle: text, headings, pictures, event information |
| Extended body / 続き | Additional content in the same middle area |

Do not paste a whole HTML page, header, footer, stylesheet or duplicate H1 into
the body. Use H2/H3 for body headings. Ordinary rich text is sufficient; HTML mode
is optional. For an event, `cms/movable-type/event-body-example.html` is a blank
body example with dates, time, place and booking fields. Replace its bracketed
prompts before publishing. There are no example dates/prices in the live template.
In this core-tag version, update an event's title/body manually when it ends.
Automatic event expiry can be mapped once your actual event-date fields are known;
the publication date is not used to guess an event's ending date.

The baseline cover is the oldest associated image asset (standard core tags).
Give it a descriptive asset label and use a prepared web image, ideally no more
than 1600px wide. Avoid inserting that same cover again in the body. A dedicated
featured-image/custom-field mapping can be substituted after the actual MT
version and field configuration are supplied. No custom fields are required now.

## Publishing also updates the homepage

Publishing/rebuilding an entry must also rebuild its **latest-cards index
template**. MT writes the newest three published posts to:

- `/staffblog/latest-cards.inc`
- `/eventinfo/latest-cards.inc`

The homepage reads these fragments when JOURNAL & EVENTS approaches the viewport.
The existing blog/event tabs continue to work after replacement. Readers see new
cards on their next visit/reload; this is not a continuously polling live feed.
Failed requests retain the embedded fallback cards. Empty published feeds remove
withdrawn cards. Drafts/future scheduled entries are not deliberately fetched;
selection uses MT's published-entry collection.

For Lolipop, the optional SSI step below also puts current cards in the initial
HTML for search engines and readers without JavaScript. MT does not need to edit
the homepage for every post: Apache includes the two files it just published.
GitHub Pages serves the embedded fallback and client-side fragments; it cannot
run Movable Type or SSI itself.

## Prepare the files locally

From the project folder in VS Code's terminal:

```powershell
npm run movabletype:prepare
npm run check:movabletype
```

Templates/modules are under `cms/movable-type/`. They are **not uploaded as public
pages** by the regular dist build. Install their contents through MT's template
editor. `legacy-archive.html` in each section preserves the existing archive's
first page when MT later takes over `index.html`; historical article URLs and
other archive pages remain available.

## Proposed MT installation (pending your actual setup)

This package assumes separate MT blogs/sites publishing to `/staffblog/` and
`/eventinfo/` under the same website. If your installation uses one blog with
categories, do not install this unchanged: first adapt the entry filters and
output paths. We still need your MT version and site/blog arrangement to confirm
real compilation, menu names and publishing permissions. No live MT installation
has been accessed or configured by this work.

1. Back up the existing MT templates and public site. Install the files under
   `modules/` as template modules, using each filename without `.mtml` as its name.
   Install the same modules in both blogs (or equivalent shared/global modules).
2. In **Ainos Settings**, set `ainos_root` to `/` for the production domain, or
   `/FUJISOU-NEW/` for that staging subfolder. Keep the trailing slash. Set
   `ainos_origin` to the HTTPS origin. Asset and navigation paths use these values.
3. Install the appropriate entry/index/monthly/card templates from this table.

| Template file | MT type | Published output / mapping |
| --- | --- | --- |
| `blog-entry.mtml` | Individual entry archive | `entries/<$mt:EntryID$>/index.html` inside staffblog |
| `event-entry.mtml` | Individual entry archive | `entries/<$mt:EntryID$>/index.html` inside eventinfo |
| `blog-index.mtml` / `event-index.mtml` | Index | `index.html` inside its blog |
| `blog-monthly.mtml` / `event-monthly.mtml` | Monthly entry listing archive | `archives/%y/%m/index.html` |
| `blog-home-cards.mtml` / `event-home-cards.mtml` | Index | `latest-cards.inc` inside its blog |

4. Choose automatic/static publishing for each index template, not manual or
   disabled publishing. Entry publication must rebuild its index and monthly
   archive dependencies. Test this with a draft, then a temporary published post.
5. The index shows the latest 24 posts; monthly archive links expose older MT
   posts. The earlier static archive remains linked separately. Existing migrated
   articles need not be republished with new URLs. The `entries/ID/` scheme avoids
   collisions with original `post-ID.shtml` compatibility routes.
6. Verify that publishing a second entry updates its article, the previous/next
   navigation, section index, monthly archive and latest-cards fragment. Also test
   unpublishing/deleting and scheduled publication with MT's actual scheduler.
7. Ainos Header/Footer output SSI directives. Newly published articles share the
   same deployed `include/header.shtml` and `include/footer.shtml` as the rest of
   dist; editing those server fragments updates every page without rebuilding MT
   posts. For stylesheet/script changes, regenerate and update Ainos Head, then
   rebuild the affected MT pages. Article HTML/SHTML requires SSI on Lolipop.

## Lolipop SSI homepage activation

After a normal public build, before uploading the initial package:

```powershell
npm run build:public
npm run movabletype:home
```

For the named staging subfolder, use this second command instead:

```powershell
node tools/enable-movable-type-home.mjs dist --base=/FUJISOU-NEW/
```

Upload dist contents, preserving the working mail installation and MT. The script
changes only dist's homepage card slots into SSI includes; GitHub source stays
static. Existing Apache settings already request SSI processing for HTML/SHTML,
but actual Lolipop support must be confirmed on your hosting plan. After upload,
view page source with JavaScript disabled: cards must be present and no literal
SSI directive or server error should appear. The fragments do not contain nested
SSI or require `AllowFileInclude` in MT.

After MT goes live, **MT owns** each section's `index.html`, `latest-cards.inc`,
`entries/`, `archives/`, and uploaded assets. Preserve those server files on later
dist uploads; local static builds cannot know about posts authored only in MT.
Do not delete/recreate the remote document root or overwrite MT's new posts with
the repository's seed fragments. Do not run Node generators against MT's live
publishing directory. A normal build replaces local dist only; repeat the optional
SSI activation after each build when preparing a Lolipop upload.

## Validation limits

Local tests render fixtures from the actual template files and check responsive
layout, both editable fields, missing images, dynamic tab switching, failed and
empty feeds, escaped titles and SSI fallback. This fixture renderer is not the
Movable Type compiler. Actual template compilation and publication/scheduling
remain host checks after your MT details are supplied. Mail remains unchanged. The shared Ainos Head module includes Google Analytics 4 (G-17DNR9SPL4), so newly published entries and listings inherit the tag. Do not also install the same tag through another MT plugin.

Official references: [Entries](https://movabletype.org/documentation/appendices/tags/entries.html),
[EntryMore](https://movabletype.org/documentation/appendices/tags/entrymore.html),
[EntryAssets](https://movabletype.org/documentation/appendices/tags/entryassets.html),
[archive mappings](https://movabletype.org/documentation/appendices/archive-file-path-specifiers.html).
