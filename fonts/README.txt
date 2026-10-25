Self-hosted fonts; browser requests stay on the website's own origin.
Hannari: https://github.com/google/fonts/tree/main/ofl/hannari
Noto Serif JP: https://github.com/google/fonts/tree/main/ofl/notoserifjp
Quattrocento: https://github.com/google/fonts/tree/main/ofl/quattrocento
Each family includes its SIL Open Font License in this directory.
The Google Fonts Hannari release provides kana; Noto Serif JP supplies kanji
and other glyphs it lacks. Noto's unicode-range subsets load only when needed.
Run node tools/fetch-site-fonts.mjs only to deliberately update the font assets.
