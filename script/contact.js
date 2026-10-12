// Mailform Pro owns validation, confirmation and sending.
const form = document.querySelector('#mailformpro');
const status = document.querySelector('[data-contact-status]');
const button = form.querySelector('button[type="submit"]');
const request = new URLSearchParams(location.search).get('topic');
if (request === 'consultation' || request === 'visit') {
  form.elements['お問い合わせ種別'].value = request === 'consultation' ? '家づくりのご相談' : '見学のご相談';
  form.elements['お問い合わせ内容'].placeholder = request === 'consultation'
    ? 'ご相談内容と、第1・第2希望の日時をお知らせください。'
    : '砺波市完成見学会のご希望日時（9月26日〜10月18日）と参加人数をお知らせください。';
}
if (location.protocol === 'file:') {
  status.textContent = 'フォームの送信はサーバー上でご利用いただけます。お電話またはLINEでもお問い合わせください。';
} else {
  const css = document.createElement('link');
  css.rel = 'stylesheet';
  css.href = 'mfp.statics/mailformpro.css';
  document.querySelector('link[href*="stylesheet/contact.css"]').before(css);
  const script = document.createElement('script');
  script.id = 'mfpjs';
  script.src = form.getAttribute('action');
  script.charset = 'UTF-8';
  script.async = false;
  script.onload = () => {
    if (!window.mfp) {
      status.textContent = '現在フォームの準備中です。お電話またはLINEでお問い合わせください。';
      return;
    }
    button.disabled = false;
    status.textContent = '';
  };
  script.onerror = () => {
    status.textContent = '現在フォームの準備中です。お電話またはLINEでお問い合わせください。';
  };
  document.body.append(script);
}
