const Book = require('../models/Book');
const { publicBook } = require('../services/catalogue');
exports.list = async (req, res) => {
  const q = typeof req.query.q === 'string' ? req.query.q.trim().toLowerCase() : '';
  const books = (await Book.find().lean()).map(publicBook).sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
  res.json({ books: books.filter(b => `${b.title} ${b.author} ${b.isbn} ${b.category}`.toLowerCase().includes(q)) });
};
exports.detail = async (req, res) => {
  const book = await Book.findById(req.params.id).lean();
  if (!book) return res.status(404).json({ message: 'Book not found.' });
  res.json({ book: publicBook(book) });
};
