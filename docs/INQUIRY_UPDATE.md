# Inquiry and content update — 2026-10-17

## What changed

- Shared embedded header: 「お問い合わせ」 beside LINE on every public page, including mobile, linking to the form anchor. The header/footer source remains in `include/`; run `node tools/embed-shared-chrome.mjs` after editing it.
- Contact: enabled confirmation button, category preselection, two optional preferred dates/times, project-context prefill, same-tab draft recovery, retry without clearing input, and an honest unavailable state when CGI is missing. Direct visits to the thanks page do not count as submissions.
- Mailform Pro: server validation, consent/category checks, date checks, 32 KiB request limit, honeypot, five valid attempts per IP per ten minutes, locked rate counter, private runtime access rules, public module allowlist, and sendmail child-exit error handling. Receipt endpoint returns a one-use boolean, not personal data. This is hardening of the existing legacy package, not a claim of complete security certification.
- Homepage: one SIMPLY / Pretty / Healthy comparison with separate product links. Existing colours, serif type, and photography retained.
- Concept and product pages: removed disease-prevention and medical-endorsement assertions; qualified performance and energy statements.
- New `performance/`, `cost/`, `aftercare/` pages explain available evidence, conditions and missing approvals.
- 34 project pages: source-based design explanations and consultation links; areas and owner requirements only where documented. Actual completion dates and individual floor plans were not available in the supplied project records.
- Search/social titles and descriptions aligned with each page; canonical host is `https://www.fujisou-ainos.com/`. Preview builds have noindex; production builds remove only preview noindex. Archive/utility noindex remains.
- Sitemap focuses on core pages, project details, current events and six selected evergreen articles. Thin category/pagination archives and obsolete events are excluded. Historical articles remain accessible; removing an article from the sitemap does not itself de-index it.
- Event state uses Japan calendar dates; after October 18 it displays ended across homepage, listing and detail. Rebuild after expiration to update the sitemap/static metadata too.
- Measurement hooks: `inquiry_click` (contact/LINE/phone) and verified `inquiry_success` CustomEvents; also push into an existing dataLayer. No analytics account or external tracker has been configured. Personal form fields are not included in these events.

## Evidence and unresolved business details

Reviewed the downloaded original, including `healthy/index.shtml`, `simply/index.shtml`, `pretty/index.shtml`, `spec/index.shtml`, original gallery records, and the published plan-price PDF. The original is preserved.

- Healthy introduces structure panels, dampers and structural calculations for seismic grade 3. This is product-specific; individual calculation/evaluation documents and current specification still control.
- SIMPLY introduces triple glazing/insulated entrance door, heat-exchange ventilation, and solar/battery options. Do not label these universal standard equipment without a current signed specification.
- `spec/index_upd.shtml` is an unpublished draft; its UA figure was deliberately not treated as an approved specification.
- The catalogue contains a 23.75-tsubo, 3LDK Smart New Star example at ¥18.53m including tax. Its revision date and full inclusion schedule are not stated. The new page labels it an undated catalogue reference checked on 2026-10-17, not a current approved quotation.
- The original says 60-year warranty, but supplies no verified initial period, extension schedule, paid maintenance prices or full exclusions. These were not invented. Obtain the applicable warranty document before making detailed promises.
- The loan illustration is explicitly hypothetical: ¥20.3m, 35 years, annual interest 1.3%, equal monthly repayments, no bonus repayments, fees/insurance/taxes excluded. About ¥60,186/month. The older land-event monthly repayment was removed because its rate/conditions were missing.

Official supporting references are linked on the new pages: MLIT housing performance/energy label explanations and Japanese Bankers Association repayment simulator. Hosting permissions: https://lolipop.jp/manual/hp/cgi/

## Verification

- Local public reference/metadata/image check: 1,170 pages passed before final packaging; repeat with `npm.cmd run check` and `node tools/site-check.mjs dist` after a build.
- Chrome: 390, 768, 1100, 1440 and 1920px on homepage/contact/performance/product/project pages; no horizontal overflow and contact target at least 44px. Mobile menu and Escape checked.
- Actual Perl CGI in an isolated local copy, using a fake sendmail capture: confirmation, administrator recipient hkai7706@gmail.com, fixed sender info@ainos.biz, customer Reply-To, automatic reply, receipt verification and draft clearing exercised. No real email sent.
- Rejected missing name, header-injected email, honeypot, missing consent, past/invalid dates, foreign origin and oversized body without invoking the mock mailer.
- The live test contact HTML returned HTTP 200, but `/FUJISOU-NEW/contact/mailformpro/mailformpro.cgi` returned HTTP 404. Live delivery is therefore NOT verified.

## Upload and finish the live check

Use `npm.cmd run build:preview` for the separate Lolipop test folder. Upload the CONTENTS of `dist/` into `/FUJISOU-NEW/`, including hidden `.htaccess` files and all of `contact/mailformpro/` and `contact/mfp.statics/`. Do not upload the project root, `tmp`, downloaded original, docs, node_modules, or Git data. CGI configuration remains private/ignored in Git. The preview package intentionally contains a fresh counter and no customer records.

On Lolipop set the executable `contact/mailformpro/mailformpro.cgi` to 700, data files to 600, directories to 705, HTML/images and .htaccess to 604, following the hosting manual. Perl files are normalized to LF. Do not use 777/666. Keep the original live site's mailform installation untouched. For a later update to a functioning form, preserve its `data/` and server settings; do not reset them with the fresh package.

Prefer the HTTPS test URL `https://www.fujisou-ainos.com/FUJISOU-NEW/contact/` if the current server certificate/routing remains valid. Verify the CGI loads as JavaScript, private config/data URLs return 403, the form reports connected, a clearly labelled test inquiry reaches hkai7706@gmail.com, the automatic reply arrives, Japanese text is readable, and the receipt page reports success. Check spam folders and sender-domain mail authentication if delivery fails. A successful local pipe or a receipt is not proof of inbox delivery.

At production launch, run `npm.cmd run build:production` and upload that new `dist/` to the actual document root. This removes preview noindex while preserving intentional archive/thanks noindex and adds canonical host/HTTPS redirects. Do not deploy a preview build as production. Check live robots.txt, sitemap.xml, redirects, canonicals and indexing after upload. GitHub source stays noindex.


Final local mobile Lighthouse check after the header correction: Performance 92, Accessibility 100, Best Practices 100; FCP 2.0s, LCP 3.1s, TBT 0ms, CLS 0. SEO score 69 reflects intentional preview noindex. This is a local lab run, not production field Core Web Vitals. The earlier layout shift (0.202) was eliminated. Responsive 840px event poster is 369,804 bytes versus 1,424,886 bytes for the retained original (about 74% smaller transfer when selected).

Additional CGI tests passed: public administrative/export modules and invalid receipt callbacks rejected, sixth valid attempt within ten minutes rate-limited, and a failed fake sendmail process did not redirect to success. All captured messages remained local. Server hardening now reports sendmail failure with HTTP 503.
