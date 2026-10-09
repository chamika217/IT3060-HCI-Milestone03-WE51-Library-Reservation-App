const windows = ['9-11 AM', '12-2 PM', '4-6 PM'];
function today() { return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Colombo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date()); }
function validPickup(date, window) {
  if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !windows.includes(window)) return false;
  const time = Date.parse(date + 'T00:00:00Z');
  const start = Date.parse(today() + 'T00:00:00Z');
  return Number.isFinite(time) && new Date(time).toISOString().slice(0, 10) === date && time >= start && time <= start + 7 * 86400000;
}
module.exports = { windows, today, validPickup };
