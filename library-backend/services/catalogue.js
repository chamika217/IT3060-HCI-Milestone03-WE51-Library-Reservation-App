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
    isbn: book.isbn || '', category: book.category == null ? '' : String(book.category), description: book.description,
    color: book.color, cover, copies: book.copies,
    // The reader API exposes availability as a boolean derived from the shared copy count.
    available: book.copies > 0 };
};
exports.seedBooks = async () => {
  for (const { id: sourceId, available, isbn, ...book } of seed.filter(item => Number(item.id) >= 1 && Number(item.id) <= 20)) {
    const id = String(sourceId);
    const record = { ...book, _id: id, reservations: [] };
    if (typeof isbn === 'string' && isbn.trim()) {
      record.isbn = isbn.trim();
      await Book.updateOne({ isbn: record.isbn }, { $setOnInsert: record }, { upsert: true });
    } else {
      await Book.updateOne({ _id: id }, { $setOnInsert: record }, { upsert: true });
    }
  }
};
