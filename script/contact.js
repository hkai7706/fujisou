// Mailform Pro handles confirmation and delivery when its CGI is available.
(() => {
  const form = document.querySelector('[data-contact-form]');
  if (!form) return;
  const status = form.querySelector('[data-contact-status]');
  const service = form.querySelector('[data-contact-service]');
  const retry = form.querySelector('[data-contact-retry]');
  const button = form.querySelector('button[type="submit"]');
  const category = form.elements['お問い合わせ種別'];
  const booking = form.querySelector('[data-contact-booking]');
  const draftKey = `fujisou-contact-draft:${new URL(".", location.href).pathname}`;
  try { const draft=JSON.parse(sessionStorage.getItem(draftKey)||"null"); if(draft&&Date.now()-draft.savedAt<7200000) for(const [name,value] of Object.entries(draft.fields)) if(form.elements[name]&&form.elements[name].type!=="checkbox") form.elements[name].value=value; } catch {}
  const saveDraft=()=>{try{const fields={};for(const input of form.elements)if(input.name&&!input.name.startsWith("mfp_")&&input.name!=="website_url"&&input.type!=="checkbox")fields[input.name]=input.value;sessionStorage.setItem(draftKey,JSON.stringify({savedAt:Date.now(),fields}));}catch{}};
  form.addEventListener("input",saveDraft); form.addEventListener("change",saveDraft);
  let ready = false;
  let loading = false;
  const today = () => new Intl.DateTimeFormat('sv-SE', {timeZone:'Asia/Tokyo',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  const updateBooking = () => {
    const show = ['家づくりのご相談','見学のご相談'].includes(category.value);
    booking.hidden = !show;
    booking.disabled = !show;
    booking.querySelectorAll('input,select').forEach(input => { input.disabled = !show; });
    booking.querySelectorAll('input[type="date"]').forEach(input => { input.min = today(); });
  };
  const topic = new URLSearchParams(location.search).get('topic');
  const project = new URLSearchParams(location.search).get('project');
  if (project && !form.elements['お問い合わせ内容'].value) form.elements['お問い合わせ内容'].value = `施工事例「${project.slice(0,150)}」について相談したいです。\n`;
  if (topic === 'consultation' || topic === 'visit') category.value = topic === 'consultation' ? '家づくりのご相談' : '見学のご相談';
  updateBooking();
  category.addEventListener('change', updateBooking);
  const showError = message => { status.textContent = message; status.focus(); };
  const guardSubmission = event => {
    saveDraft();
    if (!ready) {
      event.preventDefault();
      event.stopImmediatePropagation();
      if (!form.reportValidity()) return;
      showError(location.hostname.endsWith('github.io') || location.protocol === 'file:'
        ? 'このページはプレビューです。メールは送信されません。入力内容はこの画面に残ります。'
        : '送信サービスに接続できません。入力内容はこの画面に残ります。「送信サービスに再接続」をお試しください。');
      return;
    }
    for (const input of booking.querySelectorAll('input[type="date"]')) {
      if (!booking.disabled && input.value && input.value < today()) {
        event.preventDefault(); event.stopImmediatePropagation();
        input.setAttribute('aria-invalid','true');
        showError('希望日は本日以降の日付を選択してください。');
        return;
      }
      input.removeAttribute('aria-invalid');
    }
    status.textContent = '';
  };
  form.addEventListener('submit', guardSubmission, true);
  button.addEventListener('click', guardSubmission, true);
  function unavailable() {
    ready = false; loading = false; button.disabled = false;
    service.textContent = location.hostname.endsWith('github.io') || location.protocol === 'file:'
      ? 'プレビューではメール送信を行いません。フォームの入力項目をご確認いただけます。'
      : '送信サービスに接続できていません。再接続しても入力内容は消えません。';
    retry.hidden = location.protocol === 'file:' || location.hostname.endsWith('github.io');
  }
  function connect() {
    if (loading || ready) return;
    if (location.protocol === 'file:' || location.hostname.endsWith('github.io')) { unavailable(); return; }
    loading = true; retry.hidden = true; service.textContent = '送信サービスに接続しています…';
    if (!document.querySelector('[data-mailform-style]')) {
      const css = document.createElement('link'); css.rel='stylesheet'; css.href='mfp.statics/mailformpro.css'; css.dataset.mailformStyle='';
      document.querySelector('link[href*="stylesheet/contact.css"]').before(css);
    }
    document.querySelector('#mfpjs')?.remove();
    const script = document.createElement('script'); script.id='mfpjs'; script.src=form.getAttribute('action'); script.charset='UTF-8'; script.async=false;
    const timer = setTimeout(() => { if (!ready) unavailable(); }, 12000);
    script.onload = () => {
      clearTimeout(timer); loading=false;
      if (!window.mfp || window.mfp.Ready !== true) { unavailable(); return; }
      ready=true; button.disabled=false; service.textContent='入力内容を確認してから送信できます。送信後に受付完了画面をご案内します。'; status.textContent=''; retry.hidden=true;
      updateBooking();
      window.mfp.extend.event("send",()=>{saveDraft();try{sessionStorage.removeItem(`fujisou-contact-receipt:${new URL(".",location.href).pathname}`);sessionStorage.setItem(`fujisou-contact-pending:${new URL(".",location.href).pathname}`,JSON.stringify({time:Date.now(),id:Date.now().toString(36)+Math.random().toString(36).slice(2)}));}catch{}});
    };
    script.onerror=()=>{clearTimeout(timer);unavailable();};
    document.body.append(script);
  }
  retry.addEventListener('click',connect);
  connect();
})();
