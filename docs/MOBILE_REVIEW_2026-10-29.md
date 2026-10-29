# Mobile layout review — 2026-10-29

The user requested a broader mobile pass across the existing project. The approved
homepage hero, consultation banners, product cards and Journal layouts are preserved.

## Findings and changes

- Planning pages: nowrap headings exceeded their containers on 320px phones. Reduced
  duplicate inset spacing, scaled the headings and allowed safe wrapping.
- Custom planning: long phrase headings could clip. Phone phrases can now wrap inside
  their actual container instead of assuming a wider line.
- Product pages: nested gutters limited photograph and text width. Phone product
  content is wider, feature lists use a single column, and the feature heading is
  grouped by meaning. The custom-product generator preserves the same grouping.
- Hirayahouse: a two-column comparison row extended past the visible area at 320px,
  despite root overflow being clipped. The phone comparison now uses one column.
- Specification/price/aftercare pages: narrow label/value columns made longer text
  difficult to read. Phone rows display the label above the description. Explicit
  table, rowgroup, row, rowheader and cell roles retain accessible relationships;
  the evidence-page generator includes them too. Wording and figures are unchanged.
- Loan simulator: phone labels and numeric fields now stack with full-width inputs.
  The calculation and input handling scripts are unchanged.
- FAQ controls: increased short summary targets on phones and small tablets, including
  standalone event pages. Touch controls have at least 44px targets where tested.
- Form controls: preserve at least 16px text and 48px-high phone input/select controls;
  add scroll margins around focused inputs. No mail service/validation changes.
- Gallery: reduce empty phone spacing, show photographs at natural proportions,
  tighten captions, and enlarge pagination targets.
- Articles and consultation: remove redundant phone reading insets and use comfortable
  body line-height and consultation spacing. Content, dates and article links remain.

## Scope and verification

`tools/check-mobile-project.mjs` samples 32 pages at 320, 390 and 768px (96 layouts):
home, concept, staff, policy, renovation, performance, cost, aftercare, consultation,
contact, land, shikkui, process, loan simulation, gallery/index/project, blog/index/
older article, event/index/detail, three planning pages, seven product variants,
and video index/detail.

It checks page overflow, elements outside the viewport, internally clipped headings,
small button/summary targets, and form text sizes. It also exercises menu/Escape,
checks accessible table roles, calculates a loan example without submitting data,
and checks no-JavaScript content visibility. Screenshots are written under ignored
`tmp/mobile-project/`.

The separate homepage, hero, consultation/Journal, page-hero, site, SEO and deployment
checks cover their existing requirements. Sampling shared templates does not mean
every historical article was individually visually reviewed.

No new dependencies, mail changes, analytics activation, admin links or content claims
are introduced. Desktop compositions retain their existing styles.
