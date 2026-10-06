# Server upload after project-wide migration

Read ../DEPLOY_SSI.md first. Upload the project-root img/ and include/ directories; every image and component URL now starts at the domain root. For deployment beneath /FUJISOU-NEW/, either publish those shared directories at the domain root or consistently add that deployment prefix to all root-relative URLs.

Upload server/index.html plus server/stylesheet/ and server/script/ if using this landing-page source. Do not upload server/header.shtml or server/footer.shtml as the editable include sources: they are compatibility wrappers. The actual components are ../include/header.shtml and ../include/footer.shtml.

The production .htaccess preserves the supplied canonical redirects to www.fujisou-ainos.com. Do not apply it to a sub.jp preview: use .htaccess.preview renamed to .htaccess instead, checking inherited parent rules. Merge any configuration changes with existing live rules. Production 404.html belongs at the domain root when using ErrorDocument 404 /404.html.

The sitemap preserves 725 supplied URLs and omits the apparent /mt/tel utility entry. Unverified lastmod dates were removed; newer posts and all HTTP statuses have not been audited. Compare against the current live sitemap before replacing it. Keep the domain-root robots.txt.

SSI must be processed on the host. GitHub Pages and plain static previews do not render the shared header/footer. Actual Lolipop behavior still requires deployment testing. No live server files were changed by this local migration.
