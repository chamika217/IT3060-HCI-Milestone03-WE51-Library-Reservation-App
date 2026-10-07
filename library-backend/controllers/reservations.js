const { randomUUID, randomBytes } = require('node:crypto');
const mongoose = require('mongoose');
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
  // Atlas may contain legacy books whose _id values are ObjectIds; newer records use string IDs.
  const id = bookId.length === 24 && mongoose.Types.ObjectId.isValid(bookId)
    ? new mongoose.Types.ObjectId(bookId)
    : bookId;
  // Keep inventory and reservation insertion atomic so concurrent requests cannot oversell.
  const filter = {
    copies: { $gt: 0 },
    'reservations.userId': { $ne: req.userId },
  };
  const update = [
    { $set: {
      copies: { $subtract: ['$copies', 1] },
      reservations: { $concatArrays: [{ $ifNull: ['$reservations', []] }, [reservation]] },
      available: { $cond: [{ $isNumber: '$available' }, { $subtract: ['$available', 1] }, '$$REMOVE'] },
      updatedAt: new Date(),
    } },
  ];
  let book = await Book.collection.findOneAndUpdate({ ...filter, _id: id }, update, { returnDocument: 'after' });
  // Keep compatibility with a string ID that happens to look like an ObjectId.
  if (!book && id !== bookId) book = await Book.collection.findOneAndUpdate({ ...filter, _id: bookId }, update, { returnDocument: 'after' });
  if (!book) return res.status(409).json({ message: 'This book is unavailable or you already reserved it.' });
  res.status(201).json({ reservation: { ...publicBook(book), reservationId: reservation._id, pickupDate, pickupWindow, pickupCode: reservation.pickupCode } });
};
exports.cancel = async (req, res) => {
  const result = await Book.collection.updateOne(
    { reservations: { $elemMatch: { _id: req.params.id, userId: req.userId } } },
    [{ $set: {
      copies: { $add: ['$copies', 1] },
      reservations: { $filter: {
        input: { $ifNull: ['$reservations', []] },
        as: 'reservation',
        cond: { $not: { $and: [
          { $eq: ['$$reservation._id', req.params.id] },
          { $eq: ['$$reservation.userId', req.userId] },
        ] } },
      } },
      available: { $cond: [{ $isNumber: '$available' }, { $add: ['$available', 1] }, '$$REMOVE'] },
      updatedAt: new Date(),
    } }],
  );
  if (!result.modifiedCount) return res.status(404).json({ message: 'Reservation not found.' });
  res.json({ ok: true });
};
