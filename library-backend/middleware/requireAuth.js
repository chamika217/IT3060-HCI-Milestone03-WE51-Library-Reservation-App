const Session = require('../models/Session');
const { hash } = require('../services/session');
module.exports = async (req, res, next) => {
  const token = (req.get('Authorization') || '').match(/^Bearer ([A-Za-z0-9_-]{43})$/)?.[1];
  if (!token) return res.status(401).json({ message: 'Please sign in to manage reservations.' });
  const session = await Session.findOne({ _id: hash(token), expiresAt: { $gt: new Date() } }).lean();
  if (!session) return res.status(401).json({ message: 'Your session expired. Please sign in again.' });
  req.userId = String(session.userId); req.sessionId = session._id;
  next();
};
