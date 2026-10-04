const router = require('express').Router();
const Book = require('../../models/Book');
const { protect, staffOnly } = require('../../middleware/auth');
router.use(protect, staffOnly);

router.get('/', async (req, res) => {
  const s = req.query.search;
  const q = s ? { $or: ['title', 'author', 'isbn'].map(f => ({ [f]: new RegExp(s, 'i') })) } : {};
  res.json(await Book.find(q).populate('category').sort({ createdAt: -1 }));
});

router.post('/', async (req, res) => {
  try {
    const body = { ...req.body };
    if (!body.category) delete body.category;
    if (body.available === undefined) body.available = body.copies ?? 1;
    res.status(201).json(await Book.create(body));
  } catch (e) { res.status(400).json({ message: e.code === 11000 ? 'ISBN already exists' : e.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const body = { ...req.body };
    if (!body.category) body.category = null;
    const b = await Book.findByIdAndUpdate(req.params.id, body, { new: true, runValidators: true });
    if (!b) return res.status(404).json({ message: 'Not found' });
    res.json(b);
  } catch (e) { res.status(400).json({ message: e.code === 11000 ? 'ISBN already exists' : e.message }); }
});

router.delete('/:id', async (req, res) => {
  await Book.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

module.exports = router;