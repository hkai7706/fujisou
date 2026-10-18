// Use an explicitly selected house photo without changing the gallery order.
const esc = value => String(value).replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
export function videoThumbnail(video, prefix = '') {
  const photos = video.house?.photos || [];
  const photo = video.thumbnailPhoto ? photos.find(photo => photo.src === video.thumbnailPhoto) : photos[0];
  if (video.thumbnailPhoto && !photo) throw new Error(`Unknown thumbnail photo for ${video.slug}`);
  if (!photo) return '';
  const small = photo.small || photo;
  return `<img src="${prefix}${esc(small.src)}" srcset="${prefix}${esc(small.src)} ${small.width}w, ${prefix}${esc(photo.src)} ${photo.width}w" sizes="(max-width:760px) calc(100vw - 40px), 560px" alt="${esc(photo.caption)}" width="${small.width}" height="${small.height}" loading="lazy" decoding="async">`;
}
