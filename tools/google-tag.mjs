export const googleTag = `<!-- Google Analytics 4 -->
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  window.gtag = window.gtag || gtag;
  (function () {
    var started = false;
    function start() {
      if (started) return;
      started = true;
      window.gtag('js', new Date());
      window.gtag('config', 'G-17DNR9SPL4');
      var script = document.createElement('script');
      script.async = true;
      script.src = 'https://www.googletagmanager.com/gtag/js?id=G-17DNR9SPL4';
      document.head.appendChild(script);
    }
    ['pointerdown', 'keydown', 'touchstart'].forEach(function (event) {
      addEventListener(event, start, { once: true, passive: true });
    });
    // Give the first mobile render priority; interaction always begins tracking
    // immediately, while inactive visitors are initialized after the page settles.
    addEventListener('load', function () { setTimeout(start, 10000); }, { once: true });
  }());
</script>`;

export function addGoogleTag(html) {
  if (!/<head\b/i.test(html)) return html;
  // Replace earlier immediate and delayed versions so configuration changes
  // reach every static page instead of only newly generated pages.
  html = html
    .replace(/<!-- Google Analytics 4 -->\s*<script\b[^>]*src=["']https:\/\/www\.googletagmanager\.com\/gtag\/js[^"']*["'][^>]*><\/script>\s*<script>[\s\S]*?<\/script>\s*/g, '')
    .replace(/<!-- Google Analytics 4 -->\s*<script>[\s\S]*?<\/script>\s*/g, '');
  html = html.replace(/(<meta\b[^>]*charset[^>]*>)/i, `$1\n${googleTag}\n`);
  return html.replace(/(<!-- Google Analytics 4 -->\s*<script>[\s\S]*?<\/script>)[\t \r\n]*/g, '$1\n');
}
