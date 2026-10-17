# Contact form — Lolipop / Mailform Pro

See [INQUIRY_UPDATE.md](INQUIRY_UPDATE.md) for current implementation, verification, unresolved live-delivery checks, and upload instructions.

The ignored runtime was prepared from the original website without importing customer data. To prepare a fresh checkout once, run `node tools/prepare-contact-mailform.mjs`; it refuses to overwrite existing runtime settings. `node tools/harden-contact-mailform.mjs` reapplies the tracked validation, receipt and access-control changes to an existing local runtime.

- Administrator recipient: `hkai7706@gmail.com`.
- Fixed sender: `info@ainos.biz`; customer address becomes Reply-To.
- Action/generated JavaScript: `contact/mailformpro/mailformpro.cgi`.
- Confirmation is provided by Mailform Pro; completion is `contact/thanks.html`.
- GitHub Pages and static previews cannot send email. Missing CGI displays an accurate retry state and preserves a same-tab draft for up to two hours.
- `npm.cmd run build:preview` and `build:production` include the complete private runtime and matching static assets in ignored `dist`. Default `build` is public-only and excludes the runtime.
- Never replace a working live installation's customer data/counter with a fresh build's `data/` directory.

Original software documentation: https://www.synck.com/downloads/cgi-perl/mailformpro/index.html
Hosting requirements: https://lolipop.jp/manual/hp/cgi/
