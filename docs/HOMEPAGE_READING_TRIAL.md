# Homepage reading trial

Requested as a reversible experiment. Baseline: commit `de5e6103`.

- Original explanatory paragraphs remain in the homepage HTML, in seven native
  details panels: materials/philosophy, three product specifications, value,
  plaster, and regional information.
- Short summaries introduce the longer explanations. Product photos still link
  to their pages; specifications expand outside those links (no nested controls).
- Five existing standards become small fact groups. The earthquake-grade
  qualification and product/option notes remain visible without expanding.
- Real photographs, existing destinations, the seven-stage building guide,
  contact information, full-screen hero and exterior slider are preserved.
- Native details work by mouse, keyboard and touch, including without JavaScript.

`stylesheet/source/11-home-reading-trial.css` is scoped to the homepage's
`data-reading-trial` marker. `tools/apply-home-reading-trial.mjs` is a one-time,
idempotent source transformation, not an automatic deployment step.

To reject the trial, revert its isolated commit and rebuild the public package.
Do not reset the branch or discard later unrelated changes.
