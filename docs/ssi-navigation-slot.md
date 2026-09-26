# Reserved space for future SSI navigation

Update (2026-09-25): reusable `/header.shtml` and `/footer.shtml` fragments are
now prepared. Header CSS and JavaScript are embedded in `header.shtml`, and
footer CSS and JavaScript are embedded in `footer.shtml`.
The root landing page currently contains local copies of both fragments rather
than SSI directives; subpages are unchanged. See
[SSI setup and path reference](ssi-includes.md) and the SSI preview at
`/docs/ssi-preview.shtml` before the later migration.

Every subpage starts with an empty `.site-nav-slot` element. It reserves a
white, full-width area above the existing page content: 104px on desktop and
90px at widths of 960px or less. The empty placeholder is hidden from assistive
technology and omitted when printing.

Subpages load `stylesheet/nav-slot.css` using the appropriate relative path.
Adjust `--site-nav-space` there to change the reserved height site-wide.

When adding SSI navigation, replace the entire placeholder element with the
server-side include. Do not put interactive navigation inside the placeholder:
it currently has `aria-hidden="true"`. Remove the temporary stylesheet link
when it is no longer needed. This prevents an extra blank gap above the actual
navigation. No SSI directive or hosting configuration is enabled yet.

The standalone open-house page retains its existing event-specific header below
the reserved shared-navigation space.

Every subpage has a `.site-breadcrumbs` trail below the reserved navigation area,
styled by `stylesheet/breadcrumbs.css`. Home and parent links use relative
`index.html` paths so they work both in local file previews and on the deployed
site. Only existing parent pages are linked; the current page is unlinked and
marked with `aria-current="page"`. The homepage itself needs no breadcrumb.
