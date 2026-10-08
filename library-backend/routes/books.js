const router = require('express').Router();
const controller = require('../controllers/books');
const requireAuth = require('../middleware/requireAuth');
router.get('/', controller.list);
router.get('/:id', controller.detail);
// Catalogue changes require a signed-in library account.
router.post('/', requireAuth, controller.create);
router.patch('/:id', requireAuth, controller.update);
router.delete('/:id', requireAuth, controller.remove);
module.exports = router;
