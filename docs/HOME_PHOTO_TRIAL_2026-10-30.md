# Homepage photo layout trial — 30 October 2026

User authorized trying the recommendations and pushing, with the option to revert.

- Cream background separates the housing comparison from white editorial sections.
- Three consistent image-first cards show the entire existing product photographs,
  with clearer caption spacing and a single-column phone layout.
- The project slider includes an authentic kitchen/living-room photograph from its
  linked Takaoka project, alongside exterior and deck photographs. Links and six
  projects remain intact. Project actions now use Japanese wording.
- Increased space around the value and project sections and improved phone text sizes.
- Full homepage information, transparent header, green leaf, hero, consultation
  banners, mail behavior and disabled analytics configuration are preserved.

Maintained styles: `stylesheet/source/15-home-photo-editorial.css`.
Generated CSS and cache references are included in the same commit. Reverting
the trial commit restores its HTML, CSS and generated references together.

Validation: homepage at 320/390/768/1440px, consultation and journal layouts,
project arrows/drag/keyboard/no-JavaScript, static links, SEO and event-state
regressions. The project slider check now waits for its animation-frame control
update before asserting button state, avoiding a timing race.
