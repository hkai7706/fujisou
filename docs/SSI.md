# Shared header and footer

Pages currently embed the shared header and footer directly, so they render on static hosting and GitHub Pages.

Edit `include/header.shtml` and `include/footer.shtml`, then run `npm run refresh`
to update the checked-in embedded copies. The main project stays static.

All deployment builds now finish by replacing dist's header/footer copies with
`<!--#include virtual="/include/header.shtml" -->` and
`<!--#include virtual="/include/footer.shtml" -->`. The two deployed fragments
contain markup only, with domain-root navigation/asset URLs. CSS and scripts
remain in each page's head. Editing one deployed fragment changes every page.

`tools/build-dist-ssi.mjs` is restricted to dist and never converts source pages.
The old `tools/use-ssi-chrome.mjs` source conversion is not needed for deployment.
SSI requires an SSI-capable server and does not render on GitHub Pages. Use source
for GitHub Pages and `npm run preview:dist` to resolve dist's includes locally.

The local preview command remains `npm run preview`. Mailform Pro still requires Lolipop for actual email delivery. Backups, private runtime files and original downloads are excluded from page conversion and Git.
