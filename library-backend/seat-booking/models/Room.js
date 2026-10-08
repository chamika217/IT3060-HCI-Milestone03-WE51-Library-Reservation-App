const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    level: { type: Number, required: true },
    category: {
      type: String,
      required: true,
      enum: ['silent-study', 'discussion-pod', 'group-hub', 'special-needs', 'all-rooms'],
    },
    totalSeats: { type: Number, required: true, min: 0 },
    openSeats: { type: Number, default: 0 },
    occupiedSeats: { type: Number, default: 0 },
    floorDensity: { type: Number, default: 0 },
    amenities: [String],
    footerNote: { type: String },
    iconName: { type: String },
    statusType: { type: String, enum: ['open', 'normal', 'crowded'], default: 'open' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, collection: 'sb_rooms' }
);

module.exports = mongoose.model('Room', roomSchema);