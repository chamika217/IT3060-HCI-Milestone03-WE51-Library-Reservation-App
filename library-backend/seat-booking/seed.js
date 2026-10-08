require('dotenv').config();
const mongoose = require('mongoose');
const Room = require('./models/Room');
const Seat = require('./models/Seat');

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  await Seat.deleteMany({});
  await Room.deleteMany({});

  const room1 = await Room.create({
    code: 'L2-NORTH',
    name: 'Individual Study',
    level: 1,
    category: 'silent-study',
    totalSeats: 60,
    openSeats: 42,
    occupiedSeats: 18,
    floorDensity: 70,
    amenities: ['Wi-Fi', 'Power Outlets', 'AC 21°C', 'Strict Silence'],
    footerNote: 'Peak: 13:00 - 16:00',
    iconName: 'volume-off',
    statusType: 'open',
  });

  const room2 = await Room.create({
    code: 'L3-CENTRAL',
    name: 'Reading and Study Area',
    level: 3,
    category: 'discussion-pod',
    totalSeats: 40,
    openSeats: 18,
    occupiedSeats: 22,
    floorDensity: 55,
    amenities: ['Wi-Fi', 'Power Outlets', 'AC 22°C'],
    footerNote: 'Optimal Light: Now',
    iconName: 'bookmark',
    statusType: 'normal',
  });

  const room3 = await Room.create({
    code: 'L1-SOUTH',
    name: 'Group Collaborative Hub',
    level: 2,
    category: 'group-hub',
    totalSeats: 24,
    openSeats: 6,
    occupiedSeats: 18,
    floorDensity: 25,
    amenities: ['Whiteboards', 'Screen Share', 'Staff only'],
    footerNote: 'Staff ID Verification',
    iconName: 'chat',
    statusType: 'open',
  });

  const room4 = await Room.create({
    code: 'L4-PENTHOUSE',
    name: 'Special Needs Study Area',
    level: 4,
    category: 'special-needs',
    totalSeats: 30,
    openSeats: 2,
    occupiedSeats: 28,
    floorDensity: 93,
    amenities: ['Reference', 'Ergonomic Chairs', 'Lockers'],
    footerNote: 'Moderate Audio Zone',
    iconName: 'download',
    statusType: 'crowded',
  });

  const seats = [];
  const rooms = [room1, room2, room3, room4];

  for (const rm of rooms) {
    for (let i = 1; i <= Math.min(rm.totalSeats, 10); i++) {
      seats.push({
        room: rm._id,
        seatNumber: `${rm.code.substring(0, 2)}-S${String(i).padStart(2, '0')}`,
        pod: i <= 5 ? 'A' : 'B',
        features: rm.amenities.slice(0, 2),
      });
    }
  }

  await Seat.insertMany(seats);
  console.log(`Successfully seeded ${rooms.length} rooms and ${seats.length} seats.`);

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});