(() => {
  const title = document.querySelector('[data-receipt-title]');
  const message = document.querySelector('[data-receipt-message]');
  if (!title || !message) return;
  const folder = new URL('.', location.href).pathname;
  const pendingKey = `fujisou-contact-pending:${folder}`;
  const receiptKey = `fujisou-contact-receipt:${folder}`;
  let pending;
  try { pending = JSON.parse(sessionStorage.getItem(pendingKey) || 'null'); } catch {}
  const unavailable = () => { title.textContent='受付結果を確認できませんでした'; message.textContent='この画面を開いただけでは送信は完了しません。お問い合わせ画面へ戻り、送信状況をご確認ください。入力内容がある場合は、同じタブで復元できます。'; };
  if (!pending) {
    try {
      const previous=JSON.parse(sessionStorage.getItem(receiptKey)||'null');
      if(previous&&Date.now()-previous.time<600000){title.textContent='お問い合わせありがとうございます';message.textContent='直前のお問い合わせは受け付け済みです。担当者からのご連絡をお待ちください。新しいお問い合わせは、フォームからお送りください。';return;}
    } catch {}
  }
  if (!pending || Date.now() - pending.time > 120000 || location.hostname.endsWith('github.io') || location.protocol === 'file:') { unavailable(); return; }
  const timer = setTimeout(unavailable, 10000);
  window.fujisouContactReceipt = receipt => {
    clearTimeout(timer);
    if (!receipt) { unavailable(); return; }
    title.textContent='お問い合わせありがとうございます';
    message.textContent='お問い合わせを受け付けました。担当者よりご連絡いたしますので、しばらくお待ちください。自動返信メールが届かない場合は、迷惑メールフォルダーもご確認ください。';
    try { sessionStorage.removeItem(`fujisou-contact-draft:${folder}`); sessionStorage.removeItem(pendingKey); sessionStorage.setItem(receiptKey,JSON.stringify({time:Date.now(),id:pending.id})); } catch {}
    const detail={page:location.pathname,submissionId:pending.id};
    window.dispatchEvent(new CustomEvent('inquiry_success',{detail}));
    if(Array.isArray(window.dataLayer))window.dataLayer.push({event:'inquiry_success',...detail});
    delete window.fujisouContactReceipt;
  };
  const script=document.createElement('script');
  script.src='mailformpro/mailformpro.cgi?module=thanks&callback=fujisouContactReceipt';
  script.onerror=()=>{clearTimeout(timer);unavailable();};
  document.body.append(script);
})();
