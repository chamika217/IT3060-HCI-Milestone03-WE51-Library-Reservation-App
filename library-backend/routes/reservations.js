const router = require('express').Router();
const controller = require('../controllers/reservations');
router.use(require('../middleware/requireAuth'));
router.get('/', controller.list);
router.post('/', controller.create);
router.patch('/:id', controller.update);
router.delete('/:id', controller.cancel);
module.exports = router;
