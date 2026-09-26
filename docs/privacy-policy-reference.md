# Privacy policy redesign

Source: https://www.fujisou-ainos.com/policy/ (retrieved 2026-09-18).

`policy/index.html` preserves the introduction, eight section headings, all
paragraphs and list items, and contact wording from the original policy.
The repeated contact explanation and the original disclosure/correction section
are intentionally retained without editorial or legal rewriting.

One malformed closing tag (`場合/li>`) was repaired to `場合</li>`.
The contact form points to the existing live `/contact/` page because the local
contact page is still a placeholder. Home links return to the new local homepage.

The page uses shared font and spacing variables plus scoped `stylesheet/policy.css`.
Following the user's typography correction, all privacy page text uses the shared
`--serif` Mincho stack, matching the staff page, including body copy and links.
No global navigation or tracking scripts were added. A homepage footer link and a
sitemap entry make the policy discoverable.

The privacy page's photograph is from the Takaoka project
“木の空間演出~太陽を迎えるおうち”:
https://www.fujisou-ainos.com/gallery/post-12.shtml
Original: https://www.fujisou-ainos.com/gallery/uploads/DSR_1394.jpg
Local delivery files: `images/policy-sunlit-takaoka-600.jpg` and
`images/policy-sunlit-takaoka-1200.jpg`, resized from the original with no
generative retouching. This replaces the reused `natural-room.webp` photo.

Validation: source text comparison for the introduction and all eight sections,
CSS parsing, local asset checks, and browser checks at 1440, 768, 390, and 320px.
