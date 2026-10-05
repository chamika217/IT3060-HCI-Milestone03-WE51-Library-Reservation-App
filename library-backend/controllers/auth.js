const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Session = require('../models/Session');
const { createSession, publicUser } = require('../services/session');
const clean = value => typeof value === 'string' ? value.trim() : '';
const credentials = body => {
  const email = clean(body?.email).toLowerCase(), password = body?.password;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 || typeof password !== 'string' || password.length < 8 || Buffer.byteLength(password) > 72) return null;
  return { email, password };
};
exports.register = async (req, res) => {
  const data = credentials(req.body);
  const name = clean(req.body?.name), studentId = clean(req.body?.studentId).toUpperCase(), department = clean(req.body?.department);
  if (!data || !name || name.length > 120 || !studentId || studentId.length > 50 || !department || department.length > 120 || req.body?.acceptedTerms !== true) return res.status(400).json({ message: 'Enter valid account details, a password of 8–72 bytes, and accept the borrowing terms.' });
  const passwordHash = await bcrypt.hash(data.password, 12);
  let user;
  try { user = await User.create({ name, studentId, department, email: data.email, passwordHash }); }
  catch (e) { if (e.code === 11000) return res.status(409).json({ message: 'An account with this email or student ID already exists.' }); throw e; }
  res.status(201).json(await createSession(user));
};
exports.login = async (req, res) => {
  const data = credentials(req.body);
  if (!data) return res.status(400).json({ message: 'Enter a valid email and password.' });
  const user = await User.findOne({ email: data.email }).select('+passwordHash');
  // Match the password hashing work even for an unknown account.
  const dummy = '$2b$12$000000000000000000000uOGpQDVjhHJuJ/VnFBzjNR3Bw9tJcCy6';
  const valid = await bcrypt.compare(data.password, user?.passwordHash || dummy);
  if (!user || !valid) return res.status(401).json({ message: 'Email or password is incorrect.' });
  res.json(await createSession(user));
};
exports.me = async (req, res) => {
  const user = await User.findById(req.userId).lean();
  if (!user) return res.status(401).json({ message: 'Account not found. Please sign in again.' });
  res.json({ user: publicUser(user) });
};
exports.logout = async (req, res) => { await Session.deleteOne({ _id: req.sessionId }); res.json({ ok: true }); };
