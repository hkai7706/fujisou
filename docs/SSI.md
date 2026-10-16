# Shared header and footer

Pages currently embed the shared header and footer directly, so they render on static hosting and GitHub Pages.

Edit `include/header.shtml` and `include/footer.shtml`, then run `node tools/embed-shared-chrome.mjs` to refresh every maintained page. `npm run build` also refreshes the embedded copies. Navigation and asset paths are relative to each page.

`node tools/use-ssi-chrome.mjs` is an optional conversion to Apache SSI. SSI requires an SSI-capable server and does not render on GitHub Pages. Run the embed tool to return to static pages.

The local preview command remains `npm run preview`. Mailform Pro still requires Lolipop for actual email delivery. Backups, private runtime files and original downloads are excluded from page conversion and Git.
