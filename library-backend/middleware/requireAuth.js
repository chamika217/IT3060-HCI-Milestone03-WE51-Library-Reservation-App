const jwt = require('jsonwebtoken');
module.exports = (req, res, next) => {
  if (!process.env.JWT_SECRET) return res.status(503).json({ message: 'Account integration is not configured yet.' });
  const token = (req.get('Authorization') || '').match(/^Bearer (\S+)$/)?.[1];
  if (!token) return res.status(401).json({ message: 'Please sign in to manage reservations.' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
    if (typeof payload !== 'object' || typeof payload.sub !== 'string' || !payload.sub || !payload.exp) throw new Error('Invalid identity');
    req.userId = payload.sub;
    next();
  } catch { res.status(401).json({ message: 'Your session expired. Please sign in again.' }); }
};
