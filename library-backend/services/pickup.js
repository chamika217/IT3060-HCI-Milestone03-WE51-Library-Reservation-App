const windows = ['9-11 AM', '12-2 PM', '4-6 PM'];
function today() { return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Colombo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date()); }
const windowEndMinutes = { '9-11 AM': 11 * 60, '12-2 PM': 14 * 60, '4-6 PM': 18 * 60 };
function colomboMinutes(now) {
  const values = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Colombo', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(now);
  const part = type => Number(values.find(value => value.type === type)?.value);
  return part('hour') * 60 + part('minute');
}
function validPickup(date, window, now = new Date()) {
  if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !windows.includes(window)) return false;
  const time = Date.parse(date + 'T00:00:00Z');
  const start = Date.parse(today() + 'T00:00:00Z');
  if (!Number.isFinite(time) || new Date(time).toISOString().slice(0, 10) !== date || time < start || time > start + 7 * 86400000) return false;
  // A same-day pickup window cannot be selected once its closing time has passed.
  return date !== today() || colomboMinutes(now) < windowEndMinutes[window];
}
module.exports = { windows, today, validPickup };
