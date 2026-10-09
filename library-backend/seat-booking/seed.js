require('dotenv').config();
const mongoose = require('mongoose');
const Room = require('./models/Room');
const Seat = require('./models/Seat');

const rooms = [
  {
    code: 'L2-NORTH', name: 'Individual Study', level: 1, category: 'silent-study',
    totalSeats: 60, openSeats: 42, occupiedSeats: 18, floorDensity: 70,
    amenities: ['Wi-Fi', 'Power Outlets', 'AC 21°C', 'Strict Silence'],
    footerNote: 'Peak: 13:00 - 16:00', iconName: 'volume-off', statusType: 'open',
  },
  {
    code: 'L3-CENTRAL', name: 'Reading and Study Area', level: 3, category: 'discussion-pod',
    totalSeats: 40, openSeats: 18, occupiedSeats: 22, floorDensity: 55,
    amenities: ['Wi-Fi', 'Power Outlets', 'AC 22°C'],
    footerNote: 'Optimal Light: Now', iconName: 'bookmark', statusType: 'normal',
  },
  {
    code: 'L1-SOUTH', name: 'Group Collaborative Hub', level: 2, category: 'group-hub',
    totalSeats: 24, openSeats: 6, occupiedSeats: 18, floorDensity: 25,
    amenities: ['Whiteboards', 'Screen Share', 'Staff only'],
    footerNote: 'Staff ID Verification', iconName: 'chat', statusType: 'open',
  },
  {
    code: 'L4-PENTHOUSE', name: 'Special Needs Study Area', level: 4, category: 'special-needs',
    totalSeats: 30, openSeats: 2, occupiedSeats: 28, floorDensity: 93,
    amenities: ['Reference', 'Ergonomic Chairs', 'Lockers'],
    footerNote: 'Moderate Audio Zone', iconName: 'download', statusType: 'crowded',
  },
];

async function seed() {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is not set.');
  await mongoose.connect(process.env.MONGODB_URI);
  for (const data of rooms) {
    const room = await Room.findOneAndUpdate({ code: data.code }, { $set: data }, {
      upsert: true, new: true, setDefaultsOnInsert: true,
    });
    for (let i = 1; i <= Math.min(room.totalSeats, 10); i++) {
      const seatNumber = `${room.code.substring(0, 2)}-S${String(i).padStart(2, '0')}`;
      await Seat.updateOne(
        { room: room._id, seatNumber },
        { $set: { room: room._id, seatNumber, pod: i <= 5 ? 'A' : 'B', features: room.amenities.slice(0, 2), isActive: true } },
        { upsert: true },
      );
    }
  }
  console.log(`Seat demo data ready for ${rooms.length} rooms.`);
}

seed()
  .catch(error => {
    console.error('Seat seed failed:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
  });
