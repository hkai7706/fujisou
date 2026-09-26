# Old homepage reference

Source: homepage HTML supplied by the user on 2026-09-18. These values are
recorded from that source; this is not a live availability check.

## Metadata carried forward

- Production homepage: `https://www.fujisou-ainos.com/` (already the canonical and Open Graph URL).
- Social-sharing image: `https://www.fujisou-ainos.com/img/ogp.jpg` (already used by Open Graph and Twitter metadata).
- Google site verification: `R2VOVjKjuyTX8NrbG7mqHyK8CK_S23ulG69Il0xbIg8` (added to the new homepage).
- Added `WebSite` structured data linked to the existing business entity.
  The primary name matches the current brand, `フジ創アイノス`; the old names
  `子供のための全面漆喰工法の家` and `漆喰の家` are retained as alternate names.
- Added `application-name` using the current brand name.
- Retained the current Japanese title and description rather than introducing
  duplicate metadata from the old page.

## Links in the supplied homepage

Paths below are relative to `https://www.fujisou-ainos.com/`.

| Purpose | Old destination | Current landing page |
| --- | --- | --- |
| Concept / president's message | `/concept/` | Uses the rebuilt local `concept/` page |
| Custom homes | `/ainos-custom/` | Already linked in navigation |
| Project gallery | `/gallery/` | Already linked |
| Cute | `/cute/` | Recorded for future product navigation |
| Single-story house product | `/hirayahouse/` | Recorded for future product navigation; distinct from the current `/ainos-planning/` category link |
| Healthy | `/healthy/` | Already linked |
| Pretty | `/pretty/` | Already linked |
| Simply | `/simply/` | Already linked |
| Blog | `/staffblog/` | Already linked |
| Events | `/eventinfo/` | Already linked |
| Featured open house | `/eventinfo/kansei-kanga-kai.shtml` | Already linked |
| LINE | `https://page.line.me/725sqkvb?oat_content=url&openQrModal=true` | Already linked in the header |

## Separate files absent from the paste

The old HTML uses server-side includes. It references these files without
containing their contents:

- `/include/meta.html`
- `/include/script.html`
- `/include/analytics.html`
- `/include/header.shtml`
- `/include/footer.shtml`
- `/include/flow_overview.html`
- `/gallery/top.html`
- `/staffblog/top.html`
- `/eventinfo/top.html`

The full old navigation, shared metadata (including any favicon), and analytics
configuration cannot be recovered from this paste alone. No tracking ID was
inferred. The old Splide scripts, styles, and hero preload belong to the previous
design and were not added to the current slider.

The existing social-sharing image and structured-data logo use legacy `/img/`
URLs. Preserve those assets at deployment or update those URLs to deployed
replacement assets.
