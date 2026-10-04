const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../models/User');

router.post('/login', async (req, res) => {
  try {
    const { email = '', password = '' } = req.body;
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ message: 'Invalid username or password' });
    if (!['Staff', 'Admin'].includes(user.role))
      return res.status(403).json({ message: 'Staff access only' });
    if (user.status === 'Inactive')
      return res.status(403).json({ message: 'Account is inactive' });
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;