const { test } = require('node:test');
const assert = require('node:assert/strict');
const { randomBytes } = require('node:crypto');
const Session = require('../models/Session');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { hash } = require('../services/session');

test('notification list returns the signed-in user records and blocks other users', async t => {
  const userId = '64b64c0f2f4a4e9aa1234567';
  const otherUserId = '64b64c0f2f4a4e9aa1234568';
  const notificationId = '64b64c0f2f4a4e9aa1234569';
  const token = randomBytes(32).toString('base64url');
  t.mock.method(Session, 'findOne', query => ({
    lean: async () => query._id === hash(token) ? { _id: query._id, userId } : null,
  }));
  t.mock.method(User, 'findById', () => ({
    select: () => ({ lean: async () => ({ role: 'Student', status: 'Active' }) }),
  }));
  t.mock.method(Notification, 'find', filter => ({
    sort: async () => {
      assert.equal(String(filter.userId), userId);
      return [{
        _id: notificationId,
        userId,
        type: 'book',
        status: 'ready',
        isRead: false,
        title: 'Book reservation confirmed',
        subtitle: 'Test Book',
        createdAt: new Date(),
        detail: { body: 'Your reservation is confirmed.' },
      }];
    },
  }));

  const server = require('../app').listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  const base = `http://127.0.0.1:${server.address().port}/api/notifications`;
  const headers = { Authorization: `Bearer ${token}` };

  const ownResponse = await fetch(`${base}/${userId}`, { headers });
  assert.equal(ownResponse.status, 200);
  const notifications = await ownResponse.json();
  assert.equal(notifications.length, 1);
  assert.equal(notifications[0].id, notificationId);
  assert.equal(notifications[0].type, 'hold_ready');

  const otherResponse = await fetch(`${base}/${otherUserId}`, { headers });
  assert.equal(otherResponse.status, 403);
});
