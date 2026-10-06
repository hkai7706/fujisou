# Server landing-page source

The project-wide migration supersedes the earlier standalone server package. This index now shares the domain-root image tree and SSI components with the rest of the project.

- Images: /img/, grouped by page name; no server/img copy is maintained.
- Header: /include/header.shtml
- Footer: /include/footer.shtml
- Component sources: the root include/ folder. Header/footer files in this server folder are compatibility SSI wrappers.
- Page CSS/JS copies remain under server/stylesheet/ and server/script/.

Upload the shared img/ and include/ directories from the project root together with the page assets. Uploading server/ alone is no longer sufficient. Use DEPLOY_SSI.md in the project root for the current full-project layout. Backup files are unchanged.

The full-project build excludes this historical server source copy. Its sitemap retains the supplied live website URLs. Its .htaccess is a production domain-root configuration; .htaccess.preview is for testing. The main index also keeps existing meta/analytics SSI dependencies, which must be supplied by the live server.
