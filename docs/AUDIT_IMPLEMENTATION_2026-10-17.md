# Combined audit implementation review — 17 October 2026 (Japan)

Reviewed the supplied `Fujisou-Ainos-Combined-Audit-and-AI-Search-Plan.md` against the current project. The audit describes an older preview; its findings were rechecked rather than applied blindly. Visual identity, existing photography and Japanese serif typography are retained. The downloaded original website is unchanged.

## Changes in this pass

- The homepage hero fits 320px screens with content in normal flow on small phones and now keeps its H1, proposition and inquiry links outside the changing images. Added pause/resume; keyboard focus pauses rotation, hidden tabs stop it, reduced-motion disables automatic switching. Automatic interval is seven seconds.
- Completed arrow/Home/End navigation, roving tab stops and panel relationships for the building steps and news tabs.
- Corrected the desktop hover-then-click dropdown conflict while retaining keyboard, touch and Escape behaviour.
- Corrected source skip targets on land, single-storey and process pages. Removed duplicate IDs in the January 2025 archived event and January 2025 blog article. Site checker now rejects duplicate IDs and missing main skip targets.
- Replaced the unrelated privacy section 05 with a request route and identity-verification explanation. Removed unused membership/advertising-forwarding purposes and repeated contact copy; described actual inquiry, draft and embedded-video behaviour. Business-owner review of the policy remains necessary before production release; this is not a compliance certification.
- Put form-availability information before the fields. A missing CGI does not masquerade as a successful form. Added a rapid-confirmed-send guard; drafts and retry behaviour remain.
- Added house-type and location filters to all 34 gallery projects on the main listing. Classification uses explicit source titles/descriptions; unspecified types remain in All rather than being guessed. Old pagination URLs remain accessible.
- Prepared 55 large viewing images at a maximum 2000px, WebP quality 92, loaded only on enlargement. These total 16,104,164 bytes versus 249,451,741 bytes for the source photographs. This is a web-viewing derivative, not a replacement print master. Source photographs are unchanged; responsive cover srcsets no longer append a full-resolution original.
- Added product-family explanation and adjacent UA/warranty conditions on the two-storey page; added UA applicability to the performance page. No new performance result or current quote was invented.
- Clarified visible brand/legal-name relationship and the existing structured-data entity; updated logo/image references and added the verified YouTube profile without creating a competing business entity.
- Changed the land detail to the direct official-domain URL and removed the unverified FOR SALE label. Listing date is distinguished from a current availability check.
- Replaced the archived PSD link with the already displayed visitor image. Qualified remaining unsupported material wording in archive/source records.
- Added permanent legacy product/gallery redirects to the chosen new canonical routes. Actual Apache redirect behaviour must be checked on Lolipop.

## Catalogue downloads

| Catalogue | Previous bytes | Web bytes | Approximate reduction |
|---|---:|---:|---:|
| Single-storey | 20,716,430 | 2,527,957 | 88% |
| Two-storey | 22,467,696 | 4,062,759 | 82% |
| Cute | 25,128,697 | 5,472,994 | 78% |

All remain two-page documents. Existing raster content was rendered at 216 dpi and encoded at JPEG quality 90; these are smaller web editions, not lossless archival copies. Retained originals: ignored `backup/catalogs-before-optimization/`. Inspected all six final pages and detailed floor-plan crops. Actual iPhone/Android PDF viewing is still a device check. No selectable text was claimed or reconstructed. `tools/update-catalog-links.mjs` adds measured sizes and cache hashes, preserving page fragments, and runs in the deployment build.

## Status of every audit item

“Implemented” means project code/content is present and locally checked; it does not mean the production host or business evidence is verified.

| ID | Status and remaining evidence |
|---|---|
| F01 | Client/backend local tests pass. Live test CGI still 404: upload/runtime permissions and real inbox delivery remain the launch blocker. |
| F02 | Already implemented across shared headers; mobile contact/LINE remain in the menu as specifically requested by the user. |
| F03 | Copy corrected in this pass; owner must confirm operational scope and request procedure before production. |
| F04 | Core wording previously revised; remaining archive phrases qualified. Owner approval of claims remains. |
| F05 | Already one homepage SIMPLY/Pretty/Healthy comparison. |
| F06 | Added building-type/product-family explanation; current standard/option matrix requires approved specifications. |
| F07 | Performance page and links exist; added scope of the stated UA 0.46. Individual calculations/certificates remain unavailable. |
| F08 | Shared coverage/extension/cost/exclusion explanation exists; actual initial period, provider and terms await warranty documents. |
| F09 | HTML catalogue example and explicit loan assumptions exist; an undated catalogue reference is not a current approved budget. |
| F10 | Three catalogues optimized, sizes labelled, six final pages visually reviewed. Physical-device checks remain. |
| F11 | 55 optimized gallery viewer images and capped responsive covers implemented. Video gallery already uses web derivatives. Open-house largest candidates retained; future image changes need measured review. |
| F12 | Stable heading/actions, pause/resume, focus pause and reduced-motion implemented and tested. |
| F13 | Keyboard and ARIA behaviour implemented and tested. |
| F14 | Hover/click conflict fixed and tested with mouse-hover capability emulated, plus Enter/Escape. |
| F15 | Source targets fixed and checked without JavaScript. |
| F16 | Duplicate IDs fixed; check broadened to the whole source tree. |
| F17 | Filters across 34 projects added; existing sourced design/area facts retained. Unknown completion dates, owner goals and floor plans were not invented. Video house awaits its actual floor plan. |
| F18 | Category preselection, two optional dates/time slots and optional viewing attendance implemented; server rejects invalid attendance and time-slot values. Staff response-time promise awaits owner input. |
| F19 | Existing JST expiry verified across the calendar-day boundary. General contact fields contain no fixed expired event dates. Rebuild after expiry for sitemap/static metadata. |
| F20 | Preview noindex and separate production build already implemented. Live Lolipop test HTML is older and lacks the current preview marker: upload the preview build. |
| F21 | New routes are canonicals; legacy plan/product and gallery redirects prepared. Actual production redirect responses require deployment verification. |
| F22 | Search/social metadata aligned by existing generator; rerun after page generators. |
| F23 | Direct land host and visitor image download corrected. Archives intentionally preserve historical information. |
| F24 | Unverified current-sale label removed; actual availability must be confirmed by the business. |
| F25 | Existing privacy-safe click and verified-receipt success hooks retained. No analytics account/tag installed; account conversion verification remains. |
| A01 | Source indexing/sitemap prepared. Search Console/Bing ownership, submission and actual index status require authorized account access. |
| A02 | Project robots permits public crawling and names sitemap.xml; production still has the old sitemap target. Host/firewall/crawler-log verification requires server access. |
| A03 | Existing business entity refined; brand/legal name and offices clarified. Controlled business listings still require owner verification. |
| A04 | Google Business Profile access, eligibility, hours, photos and genuine reviews are owner/marketing tasks; no profile was modified. |
| A05 | Existing materials/performance/cost/aftercare/project pages provide useful HTML answers. No duplicate city pages or invented local evidence added. Technical/content approvals remain. |
| A06 | No external profile, review or publication was fabricated or submitted. Owner/marketing follow-up. |
| A07 | Inquiry hooks ready; analytics, Search Console/Bing baseline and citation/referral reports require accounts. |
| A08 | No special AI schema, hidden instructions, chatbot or ranking promises added. Normal crawling, useful visible content and consistent facts take priority. |

## Live read-only observations

- `http://fujisou-ainos.sub.jp/FUJISOU-NEW/contact/`: HTTP 200, older HTML with no current preview marker.
- Its `contact/mailformpro/mailformpro.cgi`: HTTP 404. No real inquiry was sent.
- `https://www.fujisou-ainos.com/robots.txt`: HTTP 200; still points at `/sitemap`, while the project points to `/sitemap.xml`.
- Production `/sitemap.xml`: HTTP 200. Contents/index processing are not thereby validated.
- GitHub preview contact: HTTP 200 and current preview noindex present.

## Verification

- Chrome responsive layouts on homepage, contact, policy, gallery and two-storey pages at 320/390/768/1100/1440px: no horizontal overflow.
- Persistent hero heading/actions, keyboard pause, arrow/End tabs and all-project/gallery-type filtering passed.
- Desktop hover then click, Escape and Enter passed; source skip targets exist without JavaScript.
- JST event transition tested immediately before/after 2026-10-19 00:00 JST.
- Isolated Perl CGI with fake sendmail: confirmation, one inquiry plus one auto-reply on double click, verified receipt and refresh, recipient hkai7706@gmail.com, no real delivery. Invalid attendance/time slot, missing name, injected email, honeypot, missing consent, past/invalid date, foreign origin and oversized body rejected. Administrative modules rejected; sixth valid attempt rate-limited; fake mailer failure returned 503 without success redirect.
- Production/preview indexing fixture: production core pages indexable, preview core pages noindex, thanks permanently noindex in both modes. Fixture removed after testing.
- This is not a penetration test or full security certification. Physical devices, production mail delivery, DNS/mail authentication, Apache redirects, search indexing and business facts remain distinct release gates.

## Deployment and owner follow-up

Use `npm.cmd run build:preview` for `/FUJISOU-NEW/`; upload the contents of ignored `dist/`, including hidden access files and the complete contact runtime. GitHub cannot execute CGI. Follow `docs/CONTACT_FORM.md` and `docs/INQUIRY_UPDATE.md` for permissions and test delivery. Preserve a working server's data and configuration on subsequent uploads.

At actual production launch, create a fresh `npm.cmd run build:production` package. Verify root robots/sitemap, www/HTTPS redirects, legacy redirects, representative canonicals, no accidental preview noindex, valid live form and actual recipient/auto-reply inboxes. Do not replace the current live root with a preview package.

Business owner supplies: current approved budget and inclusion schedule; per-product specifications/calculations; warranty provider/initial period/extension terms; land availability; project publication permission/facts; privacy-process approval and response expectations. Search/marketing owner supplies account verification and measurement. These are not marked completed by code changes.

## Sources reviewed

- Supplied combined audit (17 October 2026), current project/docs, downloaded original records already referenced by the evidence pages.
- Personal Information Protection Commission Q&A: https://www.ppc.go.jp/personalinfo/faq/APPI_QA/
- Google Search Central, AI features and your website: https://developers.google.com/search/docs/appearance/ai-features

Google states that normal SEO practices apply and no special AI markup/file is required; discovery and rankings are not guaranteed. The implementation does not promise AI recommendations.

Final verification: source reference/metadata/duplicate-ID checks passed for 1,172 pages; preview upload-package checks passed for 1,170 pages. Local mobile Lighthouse after the contrast/label corrections: Performance 91, Accessibility 100, Best Practices 100, SEO 69 (intentional preview noindex); FCP 2.1s, LCP 3.2s, TBT 0ms, CLS 0. These are local throttled lab results, not production field Core Web Vitals; mobile LCP remains a production measurement to monitor. Final 320px hero copy fits inside its image area. The full preview build includes the private CGI runtime; a final sync applies the last CSS, contact and validation changes.
