const jwt = require('jsonwebtoken');
const Session = require('../models/Session');
const User = require('../models/User');
const { hash } = require('../services/session');

function bearerToken(req) {
  const header = req.get('Authorization') || '';
  const match = /^Bearer\s+(.+)$/i.exec(header);
  return match ? match[1] : null;
}

function getIdentity(payload) {
  const id = payload.id ?? payload._id ?? payload.userId;
  return id == null ? null : String(id);
}

function unauthorized(res) {
  return res.status(401).json({ message: 'Invalid or expired token.' });
}

exports.protect = async (req, res, next) => {
  const token = bearerToken(req);
  if (!token) return res.status(401).json({ message: 'No token provided.' });

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return unauthorized(res);
  }

  const id = getIdentity(payload);
  if (!id) return unauthorized(res);
  try {
    const user = await User.findById(id).select('role status').lean();
    if (!user || user.status === 'Inactive') return unauthorized(res);
    const rawRole = user.role || payload.role;
    const role = typeof rawRole === 'string'
      ? rawRole.charAt(0).toUpperCase() + rawRole.slice(1).toLowerCase()
      : rawRole;
    req.user = { ...payload, id, role };
    req.userId = id;
    return next();
  } catch (error) {
    return next(error);
  }
};

exports.staffOnly = (req, res, next) => {
  const role = typeof req.user?.role === 'string' ? req.user.role.toLowerCase() : '';
  if (role === 'staff' || role === 'admin') return next();
  return res.status(403).json({ message: 'Forbidden' });
};

async function authenticate(req, res, next) {
  const token = bearerToken(req);
  if (!token) return res.status(401).json({ message: 'No token provided.' });

  if (process.env.JWT_SECRET) {
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      const id = getIdentity(payload);
      if (!id) return unauthorized(res);
      const role = typeof payload.role === 'string'
        ? payload.role.charAt(0).toUpperCase() + payload.role.slice(1).toLowerCase()
        : payload.role;
      req.userId = id;
      req.user = { ...payload, id, role };
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
    if (!session) return unauthorized(res);
    const id = String(session.userId);
    const user = await User.findById(id).select('role').lean();
    if (!user) return unauthorized(res);
    req.userId = id;
    req.user = { id, role: user.role };
    return next();
  } catch (error) {
    return next(error);
  }
}

module.exports = Object.assign(authenticate, {
  protect: exports.protect,
  staffOnly: exports.staffOnly,
});
