// Compare calendar dates in Japan, independent of the visitor's timezone.
const today = Object.fromEntries(new Intl.DateTimeFormat('en', { timeZone: 'Asia/Tokyo', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date()).filter(p => ['year','month','day'].includes(p.type)).map(p => [p.type,p.value]));
const date = `${today.year}-${today.month}-${today.day}`;
document.querySelectorAll('[data-event-end]').forEach(section => {
  const ended = date > section.dataset.eventEnd;
  section.querySelectorAll('[data-event-active]').forEach(item => { item.hidden = ended; });
  section.querySelectorAll('[data-event-closed]').forEach(item => { item.hidden = !ended; });
});
