const jwt = require('jsonwebtoken');
const Session = require('../models/Session');
const { hash } = require('../services/session');

function userIdFrom(payload) {
  const id = payload.id ?? payload._id ?? payload.userId;
  return id == null ? null : String(id);
}

module.exports = async function requireAuth(req, res, next) {
  const header = req.get('Authorization') || '';
  const match = /^Bearer\s+(.+)$/i.exec(header);
  if (!match) return res.status(401).json({ message: 'No token provided.' });
  const token = match[1];

  if (process.env.JWT_SECRET) {
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      const id = userIdFrom(payload);
      if (!id) return res.status(401).json({ message: 'Invalid token.' });
      req.userId = id;
      req.user = { ...payload, id };
      return next();
    } catch (error) {
      if (error.name !== 'JsonWebTokenError' && error.name !== 'NotBeforeError' && error.name !== 'TokenExpiredError') {
        return next(error);
      }
    }
  }

  try {
    const session = await Session.findOne({
      _id: hash(token),
      expiresAt: { $gt: new Date() },
    }).lean();
    if (!session) return res.status(401).json({ message: 'Your session expired. Please sign in again.' });
    req.userId = String(session.userId);
    req.user = { id: req.userId };
    req.sessionId = session._id;
    return next();
  } catch (error) {
    return next(error);
  }
};
