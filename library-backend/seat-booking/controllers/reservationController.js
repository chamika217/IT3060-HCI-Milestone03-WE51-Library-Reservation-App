const crypto = require('crypto');
const mongoose = require('mongoose');
const Seat = require('../models/Seat');
const Reservation = require('../models/Reservation');
require('../models/Room');

exports.createReservation = async (req, res) => {
  try {
    const { user, seat, startTime, endTime } = req.body || {};

    if (!mongoose.isValidObjectId(user) || !mongoose.isValidObjectId(seat)) {
      return res.status(400).json({ message: 'Valid user and seat ids are required' });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (isNaN(start) || isNaN(end) || end <= start) {
      return res.status(400).json({ message: 'Invalid start or end time' });
    }
    if (start < new Date()) {
      return res.status(400).json({ message: 'Start time must be in the future' });
    }

    const foundSeat = await Seat.findOne({ _id: seat, isActive: true });
    if (!foundSeat) {
      return res.status(404).json({ message: 'Seat not found' });
    }

    const clash = await Reservation.findOne({
      seat,
      status: { $in: ['reserved', 'checked-in'] },
      startTime: { $lt: end },
      endTime: { $gt: start },
    });
    if (clash) {
      return res.status(409).json({ message: 'Seat is already booked for this time' });
    }

    const reservation = await Reservation.create({
      user,
      seat,
      startTime: start,
      endTime: end,
      checkInToken: crypto.randomBytes(8).toString('hex'),
      checkInPin: String(crypto.randomInt(0, 10000)).padStart(4, '0'),
    });

    res.status(201).json(reservation);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create reservation' });
  }
};
exports.getMyReservations = async (req, res) => {
  try {
    const { user, scope } = req.query;

    if (!mongoose.isValidObjectId(user)) {
      return res.status(400).json({ message: 'A valid user id is required' });
    }

    const now = new Date();
    let filter = { user };
    let order = { startTime: -1 };

    if (scope === 'active') {
      filter = {
        user,
        status: { $in: ['reserved', 'checked-in'] },
        endTime: { $gt: now },
      };
      order = { startTime: 1 };
    } else if (scope === 'past') {
      filter = {
        user,
        $or: [
          { status: { $nin: ['reserved', 'checked-in'] } },
          { endTime: { $lte: now } },
        ],
      };
    }

    const reservations = await Reservation.find(filter)
      .sort(order)
      .populate({
        path: 'seat',
        select: 'seatNumber pod features room',
        populate: { path: 'room', select: 'code name level' },
      });

    res.json(reservations);
  } catch (err) {
    res.status(500).json({ message: 'Failed to load reservations' });
  }
};
exports.cancelReservation = async (req, res) => {
  try {
    const { id } = req.params;
    const { user } = req.body || {};

    if (!mongoose.isValidObjectId(id) || !mongoose.isValidObjectId(user)) {
      return res.status(400).json({ message: 'Valid reservation and user ids are required' });
    }

    const reservation = await Reservation.findOne({ _id: id, user });
    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    if (reservation.status !== 'reserved') {
      return res.status(400).json({ message: 'Only a reserved booking can be cancelled' });
    }
    if (reservation.endTime <= new Date()) {
      return res.status(400).json({ message: 'This booking has already ended' });
    }

    reservation.status = 'cancelled';
    await reservation.save();

    res.json(reservation);
  } catch (err) {
    res.status(500).json({ message: 'Failed to cancel reservation' });
  }
};
const CHECK_IN_OPENS_MINUTES_BEFORE = 15;
const CHECK_IN_CLOSES_MINUTES_AFTER = 15;

exports.checkIn = async (req, res) => {
  try {
    const { id } = req.params;
    const { user, pin, token } = req.body || {};

    if (!mongoose.isValidObjectId(id) || !mongoose.isValidObjectId(user)) {
      return res.status(400).json({ message: 'Valid reservation and user ids are required' });
    }
    if (!pin && !token) {
      return res.status(400).json({ message: 'A PIN or QR token is required' });
    }

    const reservation = await Reservation.findOne({ _id: id, user });
    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }
    if (reservation.status !== 'reserved') {
      return res.status(400).json({ message: 'This booking cannot be checked in' });
    }

    const now = new Date();
    const opens = new Date(reservation.startTime.getTime() - CHECK_IN_OPENS_MINUTES_BEFORE * 60000);
    const closes = new Date(reservation.startTime.getTime() + CHECK_IN_CLOSES_MINUTES_AFTER * 60000);

    if (now < opens) {
      return res.status(400).json({ message: 'Check-in is not open yet' });
    }
    if (now > closes) {
      return res.status(400).json({ message: 'The check-in window has closed' });
    }

    const pinOk = pin && String(pin) === reservation.checkInPin;
    const tokenOk = token && String(token) === reservation.checkInToken;
    if (!pinOk && !tokenOk) {
      return res.status(400).json({ message: 'Incorrect PIN or QR code' });
    }

    reservation.status = 'checked-in';
    reservation.checkedInAt = now;
    await reservation.save();

    res.json(reservation);
  } catch (err) {
    res.status(500).json({ message: 'Failed to check in' });
  }
};
const EXTENSION_OPTIONS = [30, 60, 120];

exports.extendReservation = async (req, res) => {
  try {
    const { id } = req.params;
    const { user, minutes } = req.body || {};

    if (!mongoose.isValidObjectId(id) || !mongoose.isValidObjectId(user)) {
      return res.status(400).json({ message: 'Valid reservation and user ids are required' });
    }
    if (!EXTENSION_OPTIONS.includes(Number(minutes))) {
      return res.status(400).json({ message: 'Extension must be 30, 60 or 120 minutes' });
    }

    const reservation = await Reservation.findOne({ _id: id, user });
    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }
    if (reservation.status !== 'checked-in') {
      return res.status(400).json({ message: 'Only a checked-in booking can be extended' });
    }
    if (reservation.endTime <= new Date()) {
      return res.status(400).json({ message: 'This booking has already ended' });
    }
    if (reservation.extensionsUsed >= 2) {
      return res.status(400).json({ message: 'Extension limit reached' });
    }

    const newEnd = new Date(reservation.endTime.getTime() + Number(minutes) * 60000);

    const clash = await Reservation.findOne({
      _id: { $ne: reservation._id },
      seat: reservation.seat,
      status: { $in: ['reserved', 'checked-in'] },
      startTime: { $lt: newEnd },
      endTime: { $gt: reservation.endTime },
    });
    if (clash) {
      return res.status(409).json({ message: 'Seat is reserved by another student after your slot' });
    }

    reservation.endTime = newEnd;
    reservation.extensionsUsed += 1;
    await reservation.save();

    res.json(reservation);
  } catch (err) {
    res.status(500).json({ message: 'Failed to extend reservation' });
  }
};
exports.releaseReservation = async (req, res) => {
  try {
    const { id } = req.params;
    const { user } = req.body || {};

    if (!mongoose.isValidObjectId(id) || !mongoose.isValidObjectId(user)) {
      return res.status(400).json({ message: 'Valid reservation and user ids are required' });
    }

    const reservation = await Reservation.findOne({ _id: id, user });
    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }
    if (reservation.status !== 'checked-in') {
      return res.status(400).json({ message: 'Only a checked-in booking can be released early' });
    }
    if (reservation.endTime <= new Date()) {
      return res.status(400).json({ message: 'This booking has already ended' });
    }

    reservation.status = 'released';
    reservation.releasedAt = new Date();
    await reservation.save();

    res.json(reservation);
  } catch (err) {
    res.status(500).json({ message: 'Failed to release seat' });
  }
};

exports.updateReservation = async (req, res) => {
  try {
    const { id } = req.params;
    const { user, seat, startTime, endTime } = req.body || {};

    if (!mongoose.isValidObjectId(id) || !mongoose.isValidObjectId(user)) {
      return res.status(400).json({ message: 'Valid reservation and user ids are required' });
    }

    const reservation = await Reservation.findOne({ _id: id, user });
    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    if (reservation.status !== 'reserved') {
      return res.status(400).json({ message: 'Only an active reserved booking can be updated' });
    }

    if (seat && mongoose.isValidObjectId(seat)) {
      const foundSeat = await Seat.findOne({ _id: seat, isActive: true });
      if (!foundSeat) {
        return res.status(404).json({ message: 'Target seat not found' });
      }
      reservation.seat = seat;
    }

    if (startTime && endTime) {
      const start = new Date(startTime);
      const end = new Date(endTime);
      if (isNaN(start) || isNaN(end) || end <= start) {
        return res.status(400).json({ message: 'Invalid start or end time' });
      }
      reservation.startTime = start;
      reservation.endTime = end;
    }

    await reservation.save();
    const updated = await Reservation.findById(reservation._id).populate({
      path: 'seat',
      select: 'seatNumber pod features room',
      populate: { path: 'room', select: 'code name level' },
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update reservation' });
  }
};