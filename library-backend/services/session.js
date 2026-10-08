const { randomBytes, createHash } = require('node:crypto');
const Session = require('../models/Session');
const hash = token => createHash('sha256').update(token).digest('hex');
const publicUser = user => ({ id: String(user._id), name: user.name, email: user.email, studentId: user.studentId, department: user.department });
async function createSession(user) {
  const token = randomBytes(32).toString('base64url');
  const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000);
  await Session.create({ _id: hash(token), userId: user._id, expiresAt });
  return { token, expiresAt, user: publicUser(user) };
}
module.exports = { hash, publicUser, createSession };
