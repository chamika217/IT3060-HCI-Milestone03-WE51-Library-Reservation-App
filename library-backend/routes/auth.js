const router = require('express').Router();
const auth = require('../controllers/auth');
const requireAuth = require('../middleware/requireAuth');
const limit = require('../middleware/authLimit');
router.post('/register', limit, auth.register);
router.post('/login', limit, auth.login);
router.get('/me', requireAuth, auth.me);
router.post('/logout', requireAuth, auth.logout);
module.exports = router;
