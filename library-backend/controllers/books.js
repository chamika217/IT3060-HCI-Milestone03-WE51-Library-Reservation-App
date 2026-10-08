const Book = require('../models/Book');
const mongoose = require('mongoose');
const { randomUUID } = require('node:crypto');
const { publicBook } = require('../services/catalogue');
const fields = ['title', 'author', 'isbn', 'category', 'description', 'color', 'cover', 'copies'];
function validateBook(body, partial = false) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return { error: 'Provide book details.' };
  const values = {};
  for (const field of fields) {
    if (!(field in body)) {
      if (!partial && ['title', 'author', 'copies'].includes(field)) return { error: `The ${field} field is required.` };
      continue;
    }
    const value = body[field];
    if (['title', 'author', 'isbn', 'category', 'description', 'color'].includes(field)) {
      if (typeof value !== 'string' || value.trim().length > (field === 'description' ? 5000 : field === 'isbn' ? 32 : 200)) return { error: `The ${field} field must be valid text.` };
      if (['title', 'author'].includes(field) && !value.trim()) return { error: `The ${field} field cannot be empty.` };
      values[field] = value.trim();
    } else if (field === 'copies') {
      if (!Number.isInteger(value) || value < 0 || value > 100000) return { error: 'Copies must be a whole number from 0 to 100000.' };
      values.copies = value;
    } else if (field === 'cover') {
      if (!Number.isInteger(value) || value < 0) return { error: 'Cover must be a non-negative whole number.' };
      values.cover = value;
    }
  }
  if (Object.keys(values).length === 0) return { error: 'Provide at least one editable book field.' };
  return { values };
}
exports.list = async (req, res) => {
  const q = typeof req.query.q === 'string' ? req.query.q.trim().toLowerCase() : '';
  const books = (await Book.find().lean()).map(publicBook).sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
  res.json({ books: books.filter(b => `${b.title} ${b.author} ${b.isbn} ${b.category}`.toLowerCase().includes(q)) });
};
exports.detail = async (req, res) => {
  const id = req.params.id;
  const mongoId = mongoose.Types.ObjectId.isValid(id) && id.length === 24
    ? new mongoose.Types.ObjectId(id)
    : id;
  const book = await Book.collection.findOne({ _id: mongoId });
  if (!book) return res.status(404).json({ message: 'Book not found.' });
  res.json({ book: publicBook(book) });
};
exports.create = async (req, res) => {
  const { values, error } = validateBook(req.body);
  if (error) return res.status(400).json({ message: error });
  const book = { _id: randomUUID(), ...values, isbn: values.isbn || '', category: values.category || '', description: values.description || '', color: values.color || '#E8EEF9', reservations: [] };
  try {
    await Book.collection.insertOne(book);
  } catch (e) {
    if (e.code === 11000) return res.status(409).json({ message: 'A book with this ISBN already exists.' });
    throw e;
  }
  res.status(201).json({ book: publicBook(book) });
};
exports.update = async (req, res) => {
  const { values, error } = validateBook(req.body, true);
  if (error) return res.status(400).json({ message: error });
  const rawId = req.params.id;
  const id = rawId.length === 24 && mongoose.Types.ObjectId.isValid(rawId) ? new mongoose.Types.ObjectId(rawId) : rawId;
  try {
    const book = await Book.collection.findOneAndUpdate({ _id: id }, { $set: { ...values, updatedAt: new Date() } }, { returnDocument: 'after' });
    if (!book) return res.status(404).json({ message: 'Book not found.' });
    res.json({ book: publicBook(book) });
  } catch (e) {
    if (e.code === 11000) return res.status(409).json({ message: 'A book with this ISBN already exists.' });
    throw e;
  }
};
exports.remove = async (req, res) => {
  const rawId = req.params.id;
  const id = rawId.length === 24 && mongoose.Types.ObjectId.isValid(rawId) ? new mongoose.Types.ObjectId(rawId) : rawId;
  const result = await Book.collection.deleteOne({ _id: id, $or: [{ reservations: { $exists: false } }, { reservations: { $size: 0 } }] });
  if (!result.deletedCount) {
    const exists = await Book.collection.findOne({ _id: id }, { projection: { _id: 1 } });
    if (!exists) return res.status(404).json({ message: 'Book not found.' });
    return res.status(409).json({ message: 'Cancel active reservations before deleting this book.' });
  }
  res.json({ ok: true });
};
