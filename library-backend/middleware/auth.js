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
