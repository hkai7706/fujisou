# Separate Ainos analytics

The dashboard has its own URL and is never linked from public navigation or the
public sitemap. Public pages load only the small tracker/config scripts. Collection
is disabled while `script/analytics-config.js` has an empty endpoint.

## What works on each host

| Component | GitHub Pages | Lolipop |
|---|---|---|
| Public website + tracker | Yes | Yes |
| Separate static dashboard | Yes, `/fujisou/analytics-portal/` | Yes |
| PHP API, authentication and database | No | PHP 8.2+ with PDO_SQLITE |

Both frontends connect to the same separate HTTPS API on Lolipop. Preview and
production events are stored under separate site IDs; reports filter one at a time.
SQLite support is documented by [Lolipop](https://support.lolipop.jp/hc/ja/articles/4411326391571-SQLite%E3%81%AF%E4%BD%BF%E3%81%88%E3%81%BE%E3%81%99%E3%81%8B).

## Prepare the separate packages

```powershell
npm.cmd run analytics:build
```

- `analytics-service-dist/`: PHP API, private code/page catalogue, configuration
  example, development router, and a copy of the dashboard.
- `analytics-portal-dist/`: dashboard-only files for a separate static URL.
- `dist/`: public website only. Neither admin/service folder is included.

Package updates preserve existing local private config/data. These output folders,
real config.php and database files are ignored by Git. No password, session token,
analytics record or database belongs in a public commit.

## One-time setup, without a new subdomain

1. On your own computer, run `php analytics-service-dist/setup.php` and choose
   a unique admin password. It creates `private/config.php` with a password hash
   and random secret. Do not send the password in chat. The terminal prompt is
   local; ensure others cannot view it. PHP PDO_SQLITE must be enabled.
2. Upload the CONTENTS of analytics-service-dist to a separate Lolipop folder,
   for example `/analytics/`, including BOTH .htaccess files. A new subdomain is
   optional. Preserve live private/config.php and private/data on future updates.
   The default data directory must be writable only as needed by PHP. You may
   set data_dir to an absolute directory outside the public document root.
3. Confirm your actual HTTPS API URL, such as
   `https://your-existing-domain/analytics/api.php`. Open the separate dashboard
   at the same folder or at the GitHub dashboard URL, enter this URL, and sign in.
4. Review `private/config.php`: portal_origins lists permitted cross-origin
   dashboard origins; sites lists each website origin/base path. Add your actual
   domain if different. Same-origin dashboard requests are also allowed.
5. Put the actual API URL in `script/analytics-config.js`, then run
   `npm run refresh` and build/upload the website. That setting is public and is
   not a secret. Never put admin credentials in it.

The service is fail-closed without configuration. On the host, verify private
URLs (including `/analytics/private/data/traffic.sqlite`) return 403/404 before
enabling tracking. Apache .htaccess protects this folder; never upload runtime
config/data to GitHub. Actual host permissions/TLS/routing must be checked after upload.

## Local development and checks

```powershell
npm.cmd run check:analytics
```

Tests require PHP 8.2+ with PDO_SQLITE. Set PHP_BINARY if it is not on PATH.
The test helper can load the installed Windows PDO_SQLITE extension for its PHP
process. Tests use a separate ignored temporary config/database, never live data.

For manual service development, use the router so PHP's built-in server cannot
serve private files (it ignores .htaccess):

```powershell
php -S 127.0.0.1:5503 -t analytics-service-dist analytics-service-dist/router.php
```

Configure localhost origins explicitly only in a development config. The public
Node preview denies the service directory. The dashboard can be previewed through
`npm run preview` at `/analytics-portal/`, with a separately running API.

## Metric definitions and limits

- Visits: browser-tab sessions reused between page loads until 30 minutes of
  inactivity; not unique people. No persistent cross-visit visitor ID is stored.
- Views: permitted public page views. Query strings, fragments, unknown paths,
  form values and raw IPs are never stored as analytics events.
- Link activity: known internal pages/catalogues, phone/email channel markers,
  or external origins. External URL paths/queries are omitted.
- Inquiry actions: the existing contact/phone/LINE click hooks. A click does not
  establish a received inquiry, actual call, booking or sale.
- Page influence: visits with an inquiry action at/after viewing the page during
  the selected report period. It is an association, not causal attribution.
- Engagement: focused, visible time sampled in short intervals; scroll is a
  maximum observed percentage. Both are estimates.
- Sources: referring domains only; unknown/direct traffic is grouped together.
- Japan calendar dates; previous-period comparisons use the same duration.
- Known bots/Headless/Lighthouse/PageSpeed are excluded. Other bots, blockers,
  opt-outs, closed tabs and network failures can still affect counts.

The tracker respects DNT/Global Privacy Control and an on-site browser opt-out.
Event retention defaults to 90 days. Login/collection rate-limit buckets use a
daily salted IP hash, not a raw IP. Host access logs are managed separately by
the hosting provider. The privacy policy describes the implemented collection;
the owner should confirm its operational use before enabling it.

The API uses password_hash/password_verify, expiring opaque bearer tokens stored
as hashes, exact-origin CORS, prepared SQLite statements, body/batch limits,
deduplicated event IDs and rate limits. Dashboard tokens/passwords are never
persisted in browser storage. Reloading requires signing in again. Export contains
aggregate report rows only. This is not a claim of security certification.

Mail delivery and the existing mailform runtime remain unchanged. No historical
traffic is reconstructed or invented; an unconnected dashboard shows empty states.
