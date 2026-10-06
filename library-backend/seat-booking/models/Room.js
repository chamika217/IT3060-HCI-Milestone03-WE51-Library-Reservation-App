const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    level: { type: Number, required: true },
    category: {
      type: String,
      required: true,
      enum: ['silent-study', 'discussion-pod', 'group-hub', 'special-needs'],
    },
    totalSeats: { type: Number, required: true, min: 0 },
    amenities: [String],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Room', roomSchema);