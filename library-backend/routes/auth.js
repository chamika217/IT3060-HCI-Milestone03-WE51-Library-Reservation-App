const router = require('express').Router();
const controller = require('../controllers/auth');
const requireAuth = require('../middleware/requireAuth');

router.post('/register', controller.register);
router.post('/login', controller.login);
router.post('/google', controller.google);
router.post('/google/register', controller.googleRegister);
router.get('/me', requireAuth, controller.me);
router.post('/logout', requireAuth, controller.logout);

module.exports = router;
