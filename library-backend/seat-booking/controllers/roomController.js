const Room = require('../models/Room');

exports.getRooms = async (req, res) => {
  try {
    const rooms = await Room.find({ isActive: true }).sort({ level: 1, code: 1 });
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: 'Failed to load rooms' });
  }
};