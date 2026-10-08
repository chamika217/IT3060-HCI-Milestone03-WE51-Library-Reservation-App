const { randomBytes, createHash } = require('node:crypto');
const Session = require('../models/Session');
const Notification = require('../models/Notification');
const createNotificationEvent = require('./notification-events');
const hash = token => createHash('sha256').update(token).digest('hex');
const publicUser = user => ({
  id: String(user._id),
  name: user.name || user.fullName,
  fullName: user.fullName || user.name,
  email: user.email,
  studentId: user.studentId,
  department: user.department,
});

async function ensureWelcomeNotification(user) {
  try {
    const existing = await Notification.exists({ userId: user._id });
    if (!existing) {
      await createNotificationEvent({
        userId: user._id,
        type: 'system',
        status: 'info',
        title: 'Welcome to your library',
        subtitle: 'Your account is ready',
        detail: { body: 'Browse the catalogue, reserve books, and check this page for library updates.' },
      });
    }
  } catch (error) {
    console.error('Could not check for a welcome notification:', error.message);
  }
}

async function createSession(user) {
  await ensureWelcomeNotification(user);
  const token = randomBytes(32).toString('base64url');
  const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000);
  await Session.create({ _id: hash(token), userId: user._id, expiresAt });
  return { token, expiresAt, user: publicUser(user) };
}
module.exports = { hash, publicUser, createSession };
