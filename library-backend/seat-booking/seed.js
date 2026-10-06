require('dotenv').config();
const mongoose = require('mongoose');
const Room = require('./models/Room');
const Seat = require('./models/Seat');

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  await Seat.deleteMany({});
  await Room.deleteMany({});

  const study = await Room.create({
    code: 'L1-NORTH',
    name: 'Individual Study',
    level: 1,
    category: 'silent-study',
    totalSeats: 18,
    amenities: ['Wi-Fi', 'Power Outlets', 'AC 21°C', 'Strict Silence'],
  });

  const hub = await Room.create({
    code: 'L1-SOUTH',
    name: 'Group Collaborative Hub',
    level: 2,
    category: 'group-hub',
    totalSeats: 6,
    amenities: ['Whiteboards', 'Screen Share'],
  });

  const seats = [];

  for (let i = 1; i <= 18; i++) {
    const pod = i <= 6 ? 'A' : 'B';
    seats.push({
      room: study._id,
      seatNumber: pod + '-' + String(i).padStart(2, '0'),
      pod: pod,
      features: ['Dual AC Socket', 'East Atrium'],
    });
  }

  for (let i = 1; i <= 6; i++) {
    seats.push({
      room: hub._id,
      seatNumber: 'G-' + String(i).padStart(2, '0'),
      pod: 'G',
      features: ['Whiteboard Access'],
    });
  }

  await Seat.insertMany(seats);
  console.log('Added 2 rooms and ' + seats.length + ' seats');

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});