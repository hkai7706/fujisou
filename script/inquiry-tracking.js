// Expose measurement hooks without sending personal data or loading an analytics service.
(() => {
  const emit = (name, detail) => {
    window.dispatchEvent(new CustomEvent(name, {detail}));
    if (Array.isArray(window.dataLayer)) window.dataLayer.push({event:name, ...detail});
  };
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href]');
    if (!link) return;
    const url = new URL(link.href);
    const channel = url.protocol === 'tel:' ? 'phone' : url.hostname === 'lin.ee' ? 'line' : /\/contact\/$/.test(url.pathname) ? 'contact' : null;
    if (!channel) return;
    const placement = link.closest('.shared-header') ? 'header' : link.closest('.shared-footer') ? 'footer' : 'content';
    emit('inquiry_click', {channel, placement, page:location.pathname});
  });
})();
