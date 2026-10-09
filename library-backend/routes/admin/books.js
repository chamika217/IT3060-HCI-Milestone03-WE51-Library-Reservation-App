const router = require('express').Router();
const mongoose = require('mongoose');
const Book = require('../../models/Book');
const Category = require('../../models/Category');
const { protect, staffOnly } = require('../../middleware/auth');
router.use(protect, staffOnly);

function bookId(value) {
  return value.length === 24 && mongoose.Types.ObjectId.isValid(value)
    ? new mongoose.Types.ObjectId(value)
    : value;
}

router.get('/', async (req, res) => {
  try {
    const s = req.query.search;
    const q = s ? { $or: ['title', 'author', 'isbn'].map(f => ({ [f]: new RegExp(s, 'i') })) } : {};
    const books = await Book.find(q).sort({ createdAt: -1 }).lean();
    const categoryIds = [...new Set(books
      .map(book => book.category)
      .filter(value => value && mongoose.Types.ObjectId.isValid(value))
      .map(value => new mongoose.Types.ObjectId(value).toString()))];
    const categories = await Category.find({ _id: { $in: categoryIds } }).lean();
    const categoriesById = new Map(categories.map(category => [category._id.toString(), category]));
    res.json(books.map(book => ({
      ...book,
      category: (book.category && categoriesById.get(String(book.category))) || book.category,
    })));
  } catch (e) { res.status(500).json({ message: e.message }); }
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
    const b = await Book.findByIdAndUpdate(bookId(req.params.id), body, { new: true, runValidators: true });
    if (!b) return res.status(404).json({ message: 'Not found' });
    res.json(b);
  } catch (e) { res.status(400).json({ message: e.code === 11000 ? 'ISBN already exists' : e.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await Book.findByIdAndDelete(bookId(req.params.id));
    res.json({ message: 'Deleted' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
