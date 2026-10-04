const router = require('express').Router();
const bcrypt = require('bcryptjs');
const User = require('../../models/User');
const { protect, staffOnly } = require('../../middleware/auth');
router.use(protect, staffOnly);

router.get('/', async (req, res) => {
  const s = req.query.search;
  const q = s ? { $or: [{ name: new RegExp(s, 'i') }, { email: new RegExp(s, 'i') }] } : {};
  res.json(await User.find(q).select('-password').sort({ createdAt: -1 }));
});

router.post('/', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const u = await User.create({ name, email, role, password: await bcrypt.hash(password || '', 10) });
    res.status(201).json({ _id: u._id, name: u.name, email: u.email, role: u.role, status: u.status });
  } catch (e) { res.status(400).json({ message: e.code === 11000 ? 'Email already exists' : e.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const { role, status, name } = req.body;
    const u = await User.findByIdAndUpdate(req.params.id, { role, status, name }, { new: true, omitUndefined: true }).select('-password');
    if (!u) return res.status(404).json({ message: 'Not found' });
    res.json(u);
  } catch (e) { res.status(400).json({ message: e.message }); }
});

router.delete('/:id', async (req, res) => {
  if (req.params.id === req.user.id) return res.status(400).json({ message: "You can't delete yourself" });
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

module.exports = router;