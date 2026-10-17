# YouTube video pages

Navigation: 家造り情報 → 動画 (`videos/`). The archive displays newest publication dates first. Visitors can filter categories, search titles/descriptions, change order, and browse 12 results per page. Without JavaScript, all published cards remain accessible in newest-first order.

Each video has its own folder URL (`videos/your-slug/`), a click-to-load YouTube player, title, publication date, description, share control, consultation link and other recent videos. The site's existing typography, white background and warm accents are retained. No local video upload or YouTube API key is needed. The player uses `youtube-nocookie.com`; thumbnails come from YouTube. The visible external YouTube link also works if embedding is unavailable. Actual playback depends on the uploader enabling embedding and any YouTube restrictions.

## Add a video

Add a record to `videos/posts.json`, using the actual YouTube ID, title, description and publication date. Keep slugs stable after publication. An empty array intentionally shows a preparation notice, with no fake posts. Unlisted videos become publicly discoverable if included in this list.

Record fields:

- `slug`: unique lowercase letters/numbers/hyphens, for the folder URL.
- `youtubeId`: the 11-character ID after `watch?v=`, `youtu.be/`, or `shorts/`.
- `title`: actual Japanese video title.
- `publishedAt`: confirmed publication date, `YYYY-MM-DD`; not an invented upload date.
- `category`: for example ルームツアー, 家づくり, 施工風景, お知らせ.
- `description`: plain text; line breaks are supported, raw HTML is escaped.
- `uploadedAt`: optional verified full ISO timestamp for video structured data.
- `highResolutionThumbnail`: set to `true` only after verifying YouTube's 1280×720 thumbnail exists.

Run `npm.cmd run videos`, then `node tools/embed-shared-chrome.mjs`, `node tools/prepare-seo.mjs`, `node tools/generate-sitemap.mjs` and `npm.cmd run check`. Deployment builds run the video generator automatically. All watch pages use relative folder links so the `/FUJISOU-NEW/` test folder and GitHub project path both work. GitHub/source output remains noindex. Empty listings are also noindex in production; when real records are added, regeneration removes that empty-list status.

The generator validates IDs, dates and duplicate slugs/videos before writing. It does not delete folders: if removing a published video, remove its generated folder deliberately and decide whether a redirect is required. Do not put sample/test videos into the public records.

Official player parameters: https://developers.google.com/youtube/player_parameters

When uploading a new video to YouTube, it does not automatically appear here. Provide the new link and confirmed metadata, or update the JSON and rebuild. Automatic channel synchronization would require an additional import process.

## First video and verification (2026-10-17)

The supplied official Ainos video is _UZrtXhPSKQ. Its title and thumbnail were verified through YouTube oEmbed. The publication timestamp is 2026-08-24T17:50:33-07:00, which is August 25 in Japan; that Japan date is displayed. The 1280x720 thumbnail was verified to exist. No view counts, likes, durations or additional public videos were invented.

Responsive checks passed at 390, 768, 1440 and 1920px. Private fixtures checked filtering, search, newest/oldest ordering, 12-per-page pagination and HTML escaping. The embedded player loads only after a click. Fullscreen and an external YouTube link are provided.

YouTube watch metadata says playableInEmbed=true. Both player modes returned auth/unavailable on the local test origin, so playback was subsequently checked on the published GitHub Pages watch page. That live check passed: YouTube reported isPlayable=true, player state 1 (playing), no error, and playback advanced to 0:02. Both the listing and watch URLs returned HTTP 200, and preview noindex remained present. The local-origin error did not occur on the published origin.

## Homepage feature

The default video build also refreshes the homepage's compact video section from the newest record. `tools/home-videos.mjs` maintains one marked section and its dedicated stylesheet link. Its thumbnail links to the watch page; 「動画一覧を見る」 links to the archive. No player iframe is loaded on the homepage. Fixture builds with a temporary output directory do not modify the homepage. If the video records become empty, the feature is removed.
