# Contact form — Lolipop / Mailform Pro

The redesigned contact page uses Mailform Pro CGI, rather than a custom PHP sender. The existing live website uses this same directory arrangement:

```
contact/
  index.html                       # redesigned page
  mailformpro/                     # existing complete Mailform Pro installation
    mailformpro.cgi
    ...
  mfp.statics/                     # matching Mailform Pro static assets
    mailformpro.css
    ...
stylesheet/contact.css
script/contact.js
```

The form action and generated `mfpjs` script both use `mailformpro/mailformpro.cgi`, relative to `contact/index.html`. Mailform Pro's CSS loads before our contact stylesheet. The small loader displays an unavailable notice when the CGI is absent; it does not intercept submission or replace CGI validation/confirmation.

**The Mailform Pro package is not included in this repository.** Keep the working `contact/mailformpro/` and `contact/mfp.statics/` directories on Lolipop when replacing the HTML. Do not overwrite existing settings with sample files. For a separate test subfolder, copy the complete matching package there, use separate test settings, and adjust configured URL/domain restrictions and completion URL for that location. GitHub Pages cannot run the CGI.

Requested recipient: **infi@ainos.biz**. The existing footer says **info@ainos.biz**; confirm the address before configuring Mailform Pro. No recipient is configured in HTML or PHP. Configure the sender, administrator notification recipient, automatic reply, transport and completion redirect in the installed Mailform Pro settings, following the manual for that version.

Field names: `お問い合わせ種別`, `氏名`, `email` (`data-type="email"`), `電話番号` (`data-type="tel"`), `住所`, `お問い合わせ内容`, `個人情報の取り扱いへの同意`. Required fields have native `required` attributes. Enable Mailform Pro's own anti-spam settings; custom PHP protections have been removed.

Before launch, test on Lolipop over HTTPS: required-field validation, confirmation screen, Japanese characters in received mail, actual inbox delivery, automatic reply if enabled, completion redirect and mobile layout. No test email was sent.

Official documentation: https://www.synck.com/downloads/cgi-perl/mailformpro/index.html
