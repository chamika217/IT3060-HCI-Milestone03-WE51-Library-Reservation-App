// Single-process development limiter. Use a shared store behind a multi-instance deployment.
const attempts = new Map();
module.exports = (req, res, next) => {
  const now = Date.now();
  for (const [key, item] of attempts) if (item.until <= now) attempts.delete(key);
  const key = req.ip;
  const current = attempts.get(key) || { count: 0, until: now + 15 * 60 * 1000 };
  if (attempts.size >= 10000 && !attempts.has(key)) return res.status(429).json({ message: 'Please try again later.' });
  current.count++; attempts.set(key, current);
  if (current.count > 30) { res.set('Retry-After', String(Math.ceil((current.until - now) / 1000))); return res.status(429).json({ message: 'Too many sign-in attempts. Please try again in 15 minutes.' }); }
  next();
};
