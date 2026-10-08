const { test } = require('node:test');
const assert = require('node:assert/strict');
const { today, validPickup } = require('../services/pickup');
const { publicBook } = require('../services/catalogue');
const Book = require('../models/Book');
const controller = require('../controllers/reservations');
const seed = require('../data/books.json');
test('catalogue has 20 unique detailed books and never exposes reservations', () => {
  assert.equal(seed.length, 20); assert.equal(new Set(seed.map(b => b.id)).size, 20);
  assert.ok(seed.every(b => b.title && b.author && b.description));
  assert.equal(publicBook({ ...seed[0], _id: '1', reservations: [{ userId: 'private' }] }).reservations, undefined);
});
test('pickup validation rejects invalid dates, past dates and invalid windows', () => {
  assert.ok(validPickup(today(), '9-11 AM'));
  assert.equal(validPickup('2026-02-30', '9-11 AM'), false);
  assert.equal(validPickup('2000-01-01', '9-11 AM'), false);
  assert.equal(validPickup(today(), 'midnight'), false);
  const day8 = new Date(Date.parse(today() + 'T00:00:00Z') + 8 * 86400000).toISOString().slice(0,10);
  assert.equal(validPickup(day8, '9-11 AM'), false);
});
test('reservation atomically checks stock and user, and reports conflicts', async t => {
  let captured;
  t.mock.method(Book, 'findOneAndUpdate', (filter, update) => {
    captured = { filter, update }; return { lean: async () => null };
  });
  const res = { status(code) { this.code = code; return this; }, json(body) { this.body = body; } };
  await controller.create({ userId: 'reader-a', body: { bookId: '1', pickupDate: today(), pickupWindow: '9-11 AM' } }, res);
  assert.equal(res.code, 409);
  assert.deepEqual(captured.filter.copies, { $gt: 0 });
  assert.deepEqual(captured.filter['reservations.userId'], { $ne: 'reader-a' });
  assert.equal(captured.update.$inc.copies, -1);
  assert.equal(captured.update.$push.reservations.userId, 'reader-a');
});
test('cancellation matches the owner and restores stock only on a matching reservation', async t => {
  let captured;
  t.mock.method(Book, 'updateOne', async (filter, update) => { captured = { filter, update }; return { modifiedCount: 0 }; });
  const res = { status(code) { this.code = code; return this; }, json(body) { this.body = body; } };
  await controller.cancel({ userId: 'reader-b', params: { id: 'hold-1' } }, res);
  assert.equal(res.code, 404);
  assert.deepEqual(captured.filter.reservations.$elemMatch, { _id: 'hold-1', userId: 'reader-b' });
  assert.equal(captured.update.$inc.copies, 1);
});

test('HTTP API rejects missing identities and accepts only an active session', async t => {
  const Session = require('../models/Session'); const { hash } = require('../services/session'); const token = require('node:crypto').randomBytes(32).toString('base64url');
  t.mock.method(Session, 'findOne', query => ({ lean: async () => query._id === hash(token) ? { _id: query._id, userId: 'reader' } : null }));
  t.mock.method(Book, 'find', () => ({ select: () => ({ lean: async () => [] }) }));
  const server = require('../app').listen(0, '127.0.0.1'); await new Promise(resolve => server.once('listening', resolve)); t.after(() => new Promise(resolve => server.close(resolve)));
  const base = 'http://127.0.0.1:' + server.address().port;
  for (const invalid of ['', 'forged', require('node:crypto').randomBytes(32).toString('base64url')]) { const r = await fetch(base + '/api/reservations', { headers: { Authorization: 'Bearer ' + invalid } }); assert.equal(r.status, 401); }
  const r = await fetch(base + '/api/reservations', { headers: { Authorization: 'Bearer ' + token } }); assert.equal(r.status, 200);
  const malformed = await fetch(base + '/api/reservations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{' }); assert.equal(malformed.status, 400);
});
