const Book = require('../models/Book');
const seed = require('../data/books.json');
exports.publicBook = book => ({ id: book._id, title: book.title, author: book.author,
  isbn: book.isbn, category: book.category, description: book.description,
  color: book.color, copies: book.copies, available: book.copies > 0 });
exports.seedBooks = async () => {
  for (const { id, available, ...book } of seed) {
    await Book.updateOne({ _id: id }, { $setOnInsert: { ...book, reservations: [] } }, { upsert: true });
  }
};
