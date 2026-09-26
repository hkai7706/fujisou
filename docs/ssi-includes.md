# Shared header and footer for later SSI integration

Prepared on 2026-09-25. **SSI (Server Side Includes)** inserts shared HTML on the
server; SSH is a separate way to connect to the hosting account.

For local testing, the root `index.html` contains copies of the complete shared
header and footer code. It does not currently execute SSI. Subpages still have
their navigation placeholders and individual footers. No hosting configuration
has been changed.

## Files to upload together

Keep this structure directly inside the website's public document root:

```text
header.shtml
footer.shtml
images/
  logo.webp
docs/
  ssi-preview.shtml
```

The header CSS and navigation JavaScript are embedded directly in
`header.shtml`. The footer CSS and its current-page link JavaScript are embedded
directly in `footer.shtml`. No separate shared CSS or JavaScript files are required.

Both includes are HTML fragments, without `html`, `head`, `body`, or `main`
wrappers. Include each only once. The header is full-width and sticky, with
desktop hover dropdowns and a mobile menu. Links and native dropdowns remain
available without JavaScript. The footer includes navigation, contact details,
office addresses, and the existing official social links.

## Later: insert the includes

1. Replace the **entire** empty `.site-nav-slot` element with the header include.
   Remove the `nav-slot.css` link from that page. The include must be a direct
   child of `body`, outside `main`, for the sticky layout to work as intended.
2. Give the page's `main` element `id="main"` if it does not already have an ID.
   Keep an existing different ID if other links rely on it; the shared script
   adapts the skip link to that ID. Remove a redundant existing skip link if
   the page already supplies one.
3. Replace the page's existing site footer with the footer include after
   `</main>`. Keep any page-specific consultation section inside `main`.

```html
<body>
  <!--#include virtual="/header.shtml" -->

  <main id="main">
    <!-- Existing breadcrumbs and page content -->
  </main>

  <!--#include virtual="/footer.shtml" -->
  <!-- Keep the page's existing scripts here, if any. -->
</body>
```

Use those same two include paths at every directory depth, including
`/plans/hiraya/`, `/plans/products/cute/`, and gallery detail pages. The standalone
open-house page's event-specific header is separate from the shared site header.

## Correct paths for this project

All local links and asset URLs inside the includes begin with `/`. They resolve
from the domain root, rather than from the page containing the include. This
assumes this project is deployed at the root of its domain. For a deployment
under a subdirectory such as `/preview/`, prefix the include directives **and**
local URLs consistently with `/preview/`, or use a preview domain whose document
root is this project. Do not insert `../` into the shared fragments.

| Include URL | Current local destination |
| --- | --- |
| `/` | `index.html` |
| `/concept/` | `concept/index.html` |
| `/staff/` | `staff/index.html` |
| `/policy/` | `policy/index.html` |
| `/gallery/` | `gallery/index.html` |
| `/eventinfo/` | `eventinfo/index.html` |
| `/land-info/` | `land-info/index.html` |
| `/process/` | `process/index.html` |
| `/plans/hiraya/` | `plans/hiraya/index.html` |
| `/plans/two-story/` | `plans/two-story/index.html` |
| `/plans/custom/` | `plans/custom/index.html` |
| `/staffblog/` | `staffblog/index.html` |
| `/shikkui/` | `shikkui/index.html` |
| `/contact/` | `contact/index.html` |
| `/consultation/` | `consultation/index.html` |
| `/images/logo.webp` | `images/logo.webp` |

The navigation uses the actual project folders, not the old site's
`/ainos-planning/`, `/ainos-2f-planning/`, `/ainos-custom/`, or `/img/` paths.
Owners Club and social links intentionally remain full external HTTPS URLs.
Telephone and email links use `tel:` and `mailto:`.

These checks concern destinations and navigation, not completion of those
pages: some existing local destinations, including the contact page, are still
simple placeholder pages.

## Lolipop setup and preview

Lolipop documents `.shtml` and `.shtm` as its SSI extensions. The **containing
page** must also be processed for SSI; naming only the header/footer `.shtml`
does not make an ordinary `.html` page execute its include comments.
See [Lolipop's SSI documentation](https://lolipop.jp/manual/hp/cgi/).

Upload the files to a test site and visit `/docs/ssi-preview.shtml` over HTTP(S).
This preview is marked `noindex,nofollow`. Opening the files directly with
`file://`, a basic static server, or a server without SSI support will not expand
the include directives. The new preview's body should contain the rendered
header and footer without an SSI error message. Test a dropdown, keyboard
navigation, the mobile menu, and a link from a nested page before migration.

For the later migration, save an SSI-containing page as `.shtml` or arrange
SSI parsing for its existing extension with the host. No `.htaccess` file has
been added by this change. Lolipop's default directory index order places
`index.html` before `index.shtml`, so merely uploading both will continue to
serve `index.html` for a directory URL. Decide which index file is active when
switching a page. Existing explicit `index.html` links elsewhere in the site
must also be updated or redirected if those files are renamed; the new shared
navigation already uses directory URLs that can survive that migration.
See [Lolipop's directory index order](https://lolipop.jp/manual/hp/web-server/).

After integration, edit `header.shtml` or `footer.shtml` once to update every
SSI-enabled page that includes it. Header behavior and styling are maintained
inside `header.shtml`, while footer styling and behavior are maintained inside
`footer.shtml`.
