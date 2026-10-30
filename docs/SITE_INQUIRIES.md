# Site-wide inquiry actions

Requested on 30 October 2026: an お問い合わせ button in each page's content sections,
extending the earlier homepage-only implementation.

`node tools/build-site-inquiries.mjs` updates public static HTML. It inserts native
links at the end of each visible section inside main, including nested sections.
Pages such as blog archives with no section elements receive one action at the
end of main. Current coverage: 1,587 actions across 1,174 pages.

The generator preserves scripts, hidden content, forms, header/footer navigation,
redirects and private analytics packages. Contact destination pages are excluded
to preserve their form workflow. Fixed hero banners retain their dimensions;
the homepage hero already has an inquiry action. Existing consultation, phone,
email and LINE links stay available.

Relative paths work on both GitHub Pages' project prefix and a root-domain host.
The shared stylesheet is `stylesheet/section-inquiries.css`; it is included in
the homepage's single CSS bundle. Refresh and deployment run the generator after
the section builders, so generated pages retain these buttons. Standalone page
generation should be followed by the site inquiry generator and asset versioning.

Verification includes nested sections, untouched form markup and script strings,
idempotent generation, redirects and hidden sections in
`node --test tools/site-inquiries.test.mjs`, plus the site-wide link/SEO checks
and representative mobile/desktop browser checks.
