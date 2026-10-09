const bcrypt = require('bcryptjs');
const { randomBytes } = require('node:crypto');
const User = require('../models/User');
const Session = require('../models/Session');
const { createSession, publicUser } = require('../services/session');
const { verifyGoogleIdToken } = require('../services/googleIdentity');
const { validRegistrationEmail, emailMessage } = require('../services/registrationEmail');
const clean = value => typeof value === 'string' ? value.trim() : '';
const credentials = body => {
  const email = clean(body?.email).toLowerCase(), password = body?.password;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 || typeof password !== 'string' || password.length < 8 || Buffer.byteLength(password) > 72) return null;
  return { email, password };
};
exports.register = async (req, res) => {
  if (!validRegistrationEmail(req.body?.email)) return res.status(400).json({ message: emailMessage });
  const data = credentials(req.body);
  const name = clean(req.body?.name || req.body?.fullName);
  const studentId = clean(req.body?.studentId).toUpperCase();
  const department = clean(req.body?.department || req.body?.program);
  if (studentId.length !== 10) return res.status(400).json({ message: 'Student / staff ID must contain exactly 10 characters.' });
  if (!data || data.password.length < 8 || !/[a-z]/.test(data.password) || !/[A-Z]/.test(data.password) || !name || name.length > 120 || !studentId || studentId.length > 50 || !department || department.length > 120 || req.body?.acceptedTerms !== true) return res.status(400).json({ message: 'Password must be at least 8 characters and include an uppercase and a lowercase letter. Complete all required fields and accept the borrowing terms.' });
  const passwordHash = await bcrypt.hash(data.password, 12);
  let user;
  try { user = await User.create({ name, studentId, department, email: data.email, passwordHash }); }
  catch (e) { if (e.code === 11000) return res.status(409).json({ message: 'An account with this email or student ID already exists.' }); throw e; }
  res.status(201).json(await createSession(user));
};
exports.login = async (req, res) => {
  const data = credentials(req.body);
  if (!data) return res.status(400).json({ message: 'Enter a valid email and password.' });
  const user = await User.findOne({ email: data.email }).select('+passwordHash +password');
  // Match the password hashing work even for an unknown account.
  const dummy = '$2b$12$000000000000000000000uOGpQDVjhHJuJ/VnFBzjNR3Bw9tJcCy6';
  const valid = await bcrypt.compare(data.password, user?.passwordHash || user?.password || dummy);
  if (!user || !valid) return res.status(401).json({ message: 'Email or password is incorrect.' });
  res.json(await createSession(user));
};
async function getGoogleProfile(credential) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) throw Object.assign(new Error('Google sign-in is not configured on the server.'), { status: 503 });
  if (typeof credential !== 'string' || credential.length > 8192) throw Object.assign(new Error('Google sign-in response is invalid.'), { status: 400 });
  let payload;
  try {
    payload = await verifyGoogleIdToken(credential, clientId);
  } catch {
    throw Object.assign(new Error('Google could not verify this sign-in. Please try again.'), { status: 401 });
  }
  const email = payload?.email?.toLowerCase();
  const googleSub = payload?.sub;
  const googleAuthoritativeEmail = email?.endsWith('@gmail.com') || typeof payload?.hd === 'string';
  if (!email || typeof googleSub !== 'string' || payload.email_verified !== true || !googleAuthoritativeEmail) throw Object.assign(new Error('Use a verified Gmail or Google Workspace address.'), { status: 401 });
  return { email, googleSub, name: typeof payload.name === 'string' ? clean(payload.name).slice(0, 120) : '' };
}
async function findOrLinkGoogleUser({ email, googleSub }) {
  let user = await User.findOne({ googleSub });
  if (!user) {
    user = await User.findOne({ email });
    if (user) {
      if (user.googleSub && user.googleSub !== googleSub) throw Object.assign(new Error('This library email is linked to a different Google account.'), { status: 409 });
      user.googleSub = googleSub;
      try { await user.save(); }
      catch (error) {
        if (error.code === 11000) throw Object.assign(new Error('This Google account is already linked to another library account.'), { status: 409 });
        throw error;
      }
    }
  }
  return user;
}
function sendGoogleError(res, error) {
  return res.status(error.status || 500).json({ message: error.status ? error.message : 'Google sign-in failed. Please try again.' });
}
exports.google = async (req, res) => {
  let profile;
  try { profile = await getGoogleProfile(req.body?.credential); }
  catch (error) { return sendGoogleError(res, error); }
  let user;
  try { user = await findOrLinkGoogleUser(profile); }
  catch (error) { return sendGoogleError(res, error); }
  if (!user) return res.json({ registrationRequired: true, profile: { name: profile.name, email: profile.email } });
  res.json(await createSession(user));
};
exports.googleRegister = async (req, res) => {
  const studentId = clean(req.body?.studentId).toUpperCase();
  if (studentId.length !== 10) return res.status(400).json({ message: 'Student / staff ID must contain exactly 10 characters.' });
  const department = clean(req.body?.department);
  if (!studentId || studentId.length > 50 || !department || department.length > 120 || req.body?.acceptedTerms !== true) return res.status(400).json({ message: 'Enter your student or staff ID, department, and accept the borrowing terms.' });
  let profile;
  try { profile = await getGoogleProfile(req.body?.credential); }
  catch (error) { return sendGoogleError(res, error); }
  let existing;
  try { existing = await findOrLinkGoogleUser(profile); }
  catch (error) { return sendGoogleError(res, error); }
  if (existing) return res.json(await createSession(existing));
  if (!validRegistrationEmail(profile.email)) return res.status(400).json({ message: emailMessage });
  const passwordHash = await bcrypt.hash(randomBytes(32).toString('base64url'), 12);
  try {
    const user = await User.create({ name: profile.name || profile.email.split('@')[0], email: profile.email, googleSub: profile.googleSub, studentId, department, passwordHash });
    return res.status(201).json(await createSession(user));
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: 'An account with this email or student or staff ID already exists. Sign in with Google or check the ID.' });
    throw error;
  }
};
exports.me = async (req, res) => {
  const user = await User.findById(req.userId).lean();
  if (!user) return res.status(401).json({ message: 'Account not found. Please sign in again.' });
  res.json({ user: publicUser(user) });
};
exports.logout = async (req, res) => {
  if (req.sessionId) await Session.deleteOne({ _id: req.sessionId });
  res.json({ ok: true });
};
