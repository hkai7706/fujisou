// Compare calendar dates in Japan, independent of the visitor's timezone.
// JST is UTC+09:00 year-round; avoid initializing a locale formatter on startup.
const date = new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
document.querySelectorAll('[data-event-end]').forEach(section => {
  const ended = date > section.dataset.eventEnd;
  if ('eventPromotion' in section.dataset) section.hidden = ended;
  section.querySelectorAll('[data-event-active]').forEach(item => { item.hidden = ended; });
  section.querySelectorAll('[data-event-closed]').forEach(item => { item.hidden = !ended; });
});
