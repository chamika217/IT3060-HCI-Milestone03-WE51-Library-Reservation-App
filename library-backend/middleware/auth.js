const jwt = require('jsonwebtoken');

exports.protect = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};

exports.staffOnly = (req, res, next) => {
  if (['Staff', 'Admin'].includes(req.user.role)) return next();
  res.status(403).json({ message: 'Forbidden' });
};
/**
 * auth middleware — verifies the JWT in the Authorization header.
 *
 * Expects:  Authorization: Bearer <token>
 * On success: attaches decoded userId to req.userId and calls next()
 * On failure: returns 401
 */
module.exports = function auth(req, res, next) {
  const header = req.headers['authorization'] || req.headers['Authorization'];

  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided.' });
  }

  const token = header.slice(7); // strip "Bearer "

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    const message =
      err.name === 'TokenExpiredError' ? 'Token expired.' : 'Invalid token.';
    return res.status(401).json({ message });
  }
};
