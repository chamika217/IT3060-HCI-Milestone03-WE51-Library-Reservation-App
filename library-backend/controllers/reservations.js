const { randomUUID, randomBytes } = require('node:crypto');
const Book = require('../models/Book');
const { publicBook } = require('../services/catalogue');
const { validPickup } = require('../services/pickup');
exports.list = async (req, res) => {
  const books = await Book.find({ 'reservations.userId': req.userId }).select('+reservations').lean();
  res.json({ reservations: books.flatMap(b => b.reservations.filter(r => r.userId === req.userId).map(r => ({
    ...publicBook(b), reservationId: r._id, pickupDate: r.pickupDate, pickupWindow: r.pickupWindow, pickupCode: r.pickupCode,
  }))) });
};
exports.create = async (req, res) => {
  const { bookId, pickupDate, pickupWindow } = req.body || {};
  if (typeof bookId !== 'string' || !validPickup(pickupDate, pickupWindow)) return res.status(400).json({ message: 'Choose a pickup date within seven days and a valid time window.' });
  const reservation = { _id: randomUUID(), userId: req.userId, pickupDate, pickupWindow, pickupCode: 'LB-' + randomBytes(5).toString('hex').toUpperCase() };
  // A single document update prevents overselling and duplicate holds, including on standalone MongoDB.
  const book = await Book.findOneAndUpdate({ _id: bookId, copies: { $gt: 0 }, 'reservations.userId': { $ne: req.userId } }, {
    $inc: { copies: -1 }, $push: { reservations: reservation },
  }, { returnDocument: 'after' }).lean();
  if (!book) return res.status(409).json({ message: 'This book is unavailable or you already reserved it.' });
  res.status(201).json({ reservation: { ...publicBook(book), reservationId: reservation._id, pickupDate, pickupWindow, pickupCode: reservation.pickupCode } });
};
exports.cancel = async (req, res) => {
  const result = await Book.updateOne({ reservations: { $elemMatch: { _id: req.params.id, userId: req.userId } } }, {
    $inc: { copies: 1 }, $pull: { reservations: { _id: req.params.id, userId: req.userId } },
  });
  if (!result.modifiedCount) return res.status(404).json({ message: 'Reservation not found.' });
  res.json({ ok: true });
};
