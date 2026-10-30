export const googleTag = `<!-- Google Analytics 4 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-17DNR9SPL4"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-17DNR9SPL4');
</script>`;

export function addGoogleTag(html) {
  if (!/<head\b/i.test(html) || html.includes('googletagmanager.com/gtag/js')) return html;
  return html.replace(/(<meta\b[^>]*charset[^>]*>)/i, `$1\n${googleTag}`);
}
