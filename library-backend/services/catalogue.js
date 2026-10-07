const Book = require('../models/Book');
const seed = require('../data/books.json');
const normalizeIsbn = value => String(value || '').replace(/[^0-9X]/gi, '').toUpperCase();
const coverByIsbn = new Map(seed.filter(book => book.isbn).map(book => [
  normalizeIsbn(book.isbn), book.cover ?? Number(book.id),
]));
exports.publicBook = book => {
  const id = String(book._id);
  const cover = book.cover ?? coverByIsbn.get(normalizeIsbn(book.isbn)) ?? (/^\d+$/.test(id) ? Number(id) : undefined);
  return { id, title: book.title, author: book.author,
    isbn: book.isbn, category: book.category == null ? '' : String(book.category), description: book.description,
    color: book.color, cover, copies: book.copies, available: book.copies > 0 };
};
exports.seedBooks = async () => {
  for (const { id, available, ...book } of seed) {
    await Book.updateOne({ _id: id }, { $setOnInsert: { ...book, reservations: [] } }, { upsert: true });
  }
};
