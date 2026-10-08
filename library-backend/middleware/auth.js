const jwt = require('jsonwebtoken');

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
