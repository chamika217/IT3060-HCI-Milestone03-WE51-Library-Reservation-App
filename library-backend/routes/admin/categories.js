const router = require('express').Router();
const Category = require('../../models/Category');
const { protect, staffOnly } = require('../../middleware/auth');
router.use(protect, staffOnly);

router.get('/', async (req, res) => res.json(await Category.find().sort({ name: 1 })));

router.post('/', async (req, res) => {
  try { res.status(201).json(await Category.create(req.body)); }
  catch (e) { res.status(400).json({ message: e.code === 11000 ? 'Category already exists' : e.message }); }
});

router.put('/:id', async (req, res) => {
  try { res.json(await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })); }
  catch (e) { res.status(400).json({ message: e.code === 11000 ? 'Category already exists' : e.message }); }
});

router.delete('/:id', async (req, res) => {
  await Category.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

module.exports = router;