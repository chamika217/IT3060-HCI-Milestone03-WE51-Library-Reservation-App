const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Session = require('../models/Session');
const { createSession, publicUser } = require('../services/session');
const { verifyGoogleIdToken } = require('../services/googleIdentity');
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
exports.google = async (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const credential = req.body?.credential;
  if (!clientId) return res.status(503).json({ message: 'Google sign-in is not configured on the server.' });
  if (typeof credential !== 'string' || credential.length > 8192) return res.status(400).json({ message: 'Google sign-in response is invalid.' });
  let payload;
  try {
    payload = await verifyGoogleIdToken(credential, clientId);
  } catch {
    return res.status(401).json({ message: 'Google could not verify this sign-in. Please try again.' });
  }
  const email = payload?.email?.toLowerCase();
  const googleSub = payload?.sub;
  const googleAuthoritativeEmail = email?.endsWith('@gmail.com') || typeof payload?.hd === 'string';
  if (!email || typeof googleSub !== 'string' || payload.email_verified !== true || !googleAuthoritativeEmail) return res.status(401).json({ message: 'Use a verified Gmail or Google Workspace address.' });
  let user = await User.findOne({ googleSub });
  if (!user) {
    user = await User.findOne({ email });
    if (user) {
      if (user.googleSub && user.googleSub !== googleSub) return res.status(409).json({ message: 'This library email is linked to a different Google account.' });
      user.googleSub = googleSub;
      try { await user.save(); }
      catch (error) {
        if (error.code === 11000) return res.status(409).json({ message: 'This Google account is already linked to another library account.' });
        throw error;
      }
    }
  }
  if (!user) return res.status(404).json({ message: 'No library account uses this Google email yet. Create a library account first.' });
  res.json(await createSession(user));
};
exports.me = async (req, res) => {
  const user = await User.findById(req.userId).lean();
  if (!user) return res.status(401).json({ message: 'Account not found. Please sign in again.' });
  res.json({ user: publicUser(user) });
};
exports.logout = async (req, res) => { await Session.deleteOne({ _id: req.sessionId }); res.json({ ok: true }); };
