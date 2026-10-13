// Keep the sticky photo below the actual responsive header height.
(() => {
  const header = document.querySelector('[data-shared-header]');
  if (!header) return;
  const update = () => document.documentElement.style.setProperty(
    '--concept-header-height', `${Math.ceil(header.getBoundingClientRect().height)}px`
  );
  update();
  if ('ResizeObserver' in window) new ResizeObserver(update).observe(header);
  else window.addEventListener('resize', update, { passive: true });
})();
