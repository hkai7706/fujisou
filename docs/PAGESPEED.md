# PageSpeed improvements — 2026-10-24

`npm.cmd run performance` prepares the homepage delivery assets and refreshes
shared components. The deployment build runs the same steps automatically.

- Poster display variants at 420/640/840/1240px use WebP quality 82. The original
  remains unchanged. The 840px derivative is 42,044 bytes versus 369,804 bytes for
  the previous 840px image. Responsive sizes follow the actual homepage layout.
- Header/footer logos have 240/480px WebP variants at quality 90 and retain the
  original 720px candidate for larger displays. Shared embedding rewrites every
  srcset candidate relative to its page, including nested product/project pages.
- The footer's area label uses #73512e, with sufficient contrast on the mobile
  #f5f2ec background. Existing typography and layout remain.
- `tools/build-home-delivery.mjs` combines the seven homepage stylesheets in
  their original cascade order, removes unused selectors using HTML/JS sources,
  minifies them, and publishes one content-versioned `stylesheet/homepage.min.css`.
  Keep this step last after shared components and stylesheet generation. Full
  inlining was tested and discarded because it worsened mobile blocking time.
- Apache caching also covers module JavaScript and AVIF. Existing compression
  and long-lived asset caching remain. GitHub Pages serves its own cache headers;
  changing .htaccess does not change GitHub Pages responses. Those remaining
  hosting warnings require a host/CDN with configurable headers to eliminate.

For local audits use `node tools/serve-ssi.mjs --performance`; this enables
gzip and long-lived asset cache headers to approximate production delivery.
Ordinary previews keep no-cache revalidation for editing. Run
`node tools/check-home-layout.mjs` with the preview server running to exercise
320/390/768/1440px layouts, image loading, mobile menu/Escape and no-JS styling.
Screenshots and Lighthouse reports belong in ignored `tmp/pagespeed/`.

Update: at the owner's request, public source/GitHub content pages are now
indexable so Lighthouse's indexing audit can pass. Separate test-folder builds
retain noindex. Utility, archive and design-sample exclusions are preserved.

Remaining CSS coverage depends on viewport and interaction state: desktop,
mobile, dropdown, focus, tab and reduced-motion rules cannot all execute during
one mobile navigation. Preserve these states when reviewing unused-CSS advice.
Live PageSpeed scores must be remeasured after deployment; local scores and
the supplied report are different runs and cannot establish a live improvement.

Same-machine mobile Lighthouse comparison: baseline performance 98; final 99,
accessibility 100 and best practices 100. Final LCP 1.8s, TBT 40ms, CLS 0.
Image delivery and color contrast pass. One render-blocking stylesheet remains
by design; eliminating it through full inlining reduced the local performance
score to 80, so that approach was rejected. That earlier run's SEO was 69 because
it preceded the owner's request to enable indexing on public source pages.

## Final mobile startup refinement

The later supplied live report scored performance 98 and all other categories
100; its main penalty was Speed Index 4.0s. Removed the page-wide entrance fade
and simulated progress accent so content paints at its final opacity immediately.
Mobile/reduced-motion reveal content is shown through CSS instead of mutating
every card's class at startup. Event status uses the fixed JST UTC+09 offset
without initializing Intl; a regression test covers midnight and year rollover.
The CSS safelist now protects individual runtime class tokens without retaining
unrelated legacy selectors. cssnano compacts duplicate declarations before
Lightning CSS's final pass; generated styles remain in the original cascade.

Final local mobile Lighthouse: performance/accessibility/best-practices/SEO
100/100/100/100; FCP 1.4s, LCP 1.5s, TBT 40ms, Speed Index 2.5s, CLS 0.
These are local lab results. Hosted PageSpeed results vary with network and run
conditions; no fixed future score is guaranteed. The single cacheable stylesheet
is retained: moving it ahead of viewport metadata caused CLS and was discarded.
