# FUJISOU AINOS production audit — 2026-10-31

Scope: the 16-section website improvement brief, the editable source, and the
generated `dist` deployment. Existing branding, photographs, URLs, SSI,
Movable Type templates, and Mailform Pro integration were preserved.

## Prioritized implementation checklist

### P0 — release blockers

- [x] Validate all internal links, local assets, anchors, IDs, and image alt
  attributes across the generated site.
- [x] Keep build-only configuration out of the deployment package.
- [x] Preserve old indexed routes and converted legacy image URLs.
- [x] Keep unsupported business promises out of consultation, pricing,
  seismic, warranty, process, and land copy.
- [ ] Perform one real Mailform Pro submission on Lolipop and verify the office
  message, customer auto-reply, and `/contact/thanks.shtml` redirect.

### P1 — customer-facing and measurable improvements

- [x] Verify responsive layouts at 320, 390, and 768 px on 32 representative
  routes, including menus, forms, tables, calculators, and no-JS content.
- [x] Remove the unwanted appointment-date/attendee controls from the contact
  form and its JavaScript.
- [x] Correct stale LINE destinations in the generated deployment.
- [x] Upgrade confirmed insecure archive links to HTTPS.
- [x] Add GA4 events for telephone, LINE, consultation-link, and confirmed
  contact-form conversions without transmitting form contents.
- [x] Make GA4 injection deterministic across repeated SEO builds.
- [x] Verify Movable Type blog/event templates at mobile, tablet, and desktop
  widths, including empty-body and no-photo cases.

### P2 — already implemented and verified

- [x] Shared SSI header/footer and accessible mobile navigation.
- [x] Canonical HTTPS/www redirects, legacy redirects, sitemap, robots rules,
  canonical URLs, Open Graph/Twitter metadata, and JSON-LD.
- [x] Authentic responsive construction imagery with dimensions, lazy loading
  below the fold, and an eager/high-priority homepage LCP image.
- [x] Security headers, disabled directory listings, private preview paths, and
  honeypot/form validation integration.
- [x] Reduced-motion handling, keyboard navigation, focus styles, skip links,
  labelled controls, semantic tables, and 44 px interactive targets.
- [x] Privacy-policy disclosure for GA4/Cookies and browser opt-out guidance.
- [x] Event expiry logic based on Japan time and archive preservation.

## Confirmed defects fixed

1. `dist/include/consultation-banners.mjs` was a build configuration file, not
   a runtime dependency. It was excluded from the deployment.
2. Twenty-two generated pages/components still used the retired LINE URL.
   They now use the approved official LINE page.
3. Two archived articles contained `http://` external links. Where the same
   destination supports HTTPS, links were upgraded without changing content.
4. Re-running SEO preparation changed GA4-adjacent whitespace and failed the
   idempotence test. GA4 insertion now normalizes its boundary deterministically.
5. The site had page views but no explicit conversion events. It now records
   `phone_click`, `line_click`, `consultation_click`, and `generate_lead`.
   No names, email addresses, messages, or other form values are sent.
6. Obsolete documentation still described the retired custom analytics
   service. The project map now identifies GA4 as the active system.
7. Deployment pruning removed six bookmarked original image downloads because
   no current page linked to them. The optimizer now treats the original-site
   download manifests as compatibility requirements, and all six files were
   restored to `dist`.

## Audit results

- Site validation: 2,395 pages passed.
- SEO validation: 2,362 pages, 3,158 JSON-LD blocks, and 74 sitemap URLs passed.
- Legacy migration: 1,227 routes, 1,180 nested-safe redirects, and 434
  downloads passed.
- Mobile matrix: 32 sampled page types passed at 320, 390, and 768 px.
- Deployment: 6,620 files, approximately 247.4 MiB; no PNG, GIF, or AVIF
  deployment images.
- Lighthouse local desktop: 100 performance, 100 accessibility,
  100 best practices. SEO was 69 only because the audited local build carries
  the intentional preview `noindex`; the production SEO validator passes.
- Lighthouse local mobile: 79–81 performance across two runs, 100
  accessibility, and 100 best practices. The measured variation does not
  support claiming a performance improvement from this audit.

## Confirmed items that remain manual

1. **Mail delivery:** the proprietary/existing Lolipop
   `contact/mailformpro/mailformpro.cgi`, modules, permissions, and sendmail
   runtime are not stored in this repository. Preserve them during upload and
   complete a real end-to-end submission.
2. **GA4 administration:** mark `generate_lead` as a key event in GA4. Create
   optional key events for `phone_click`, `line_click`, and
   `consultation_click` if desired. Confirm events in GA4 DebugView/Realtime.
3. **Search Console:** submit the production sitemap, inspect the canonical
   host, and review indexing after deployment. Google Business Profile data
   cannot be verified or changed from the repository.
4. **Company approval:** Fujisou must approve current prices, plan availability,
   land availability, warranty conditions, service areas, office information,
   and technical claims before publication. The site contains qualifications,
   but code review cannot replace business/legal approval.
5. **Performance:** local Lighthouse identifies remaining mobile work mainly
   in homepage style/layout and the large visual experience. Further reduction
   would require a deliberate design trade-off, not a safe audit-only change.

## Deployment decision

The generated site is technically review-ready, not automatically authorized
for production. Release only after the manual mail test and Fujisou factual
approval above. No commit, push, upload, or deployment was performed by this
audit.
