require('dotenv').config();
const mongoose = require('mongoose');
mongoose.set('autoIndex', false);

const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Category = require('./models/Category');
const Book = require('./models/Book');
const Seat = require('./models/Seat');
const Reservation = require('./models/Reservation');
const Announcement = require('./models/Announcement');
const Notification = require('./models/Notification');
const ContactMessage = require('./models/ContactMessage');
const FaqFeedback = require('./models/FaqFeedback');
const Room = require('./seat-booking/models/Room');
const BookingSeat = require('./seat-booking/models/Seat');
const { seedBooks } = require('./services/catalogue');

const upsert = { upsert: true, new: true, setDefaultsOnInsert: true };

async function upsertUser({ email, passwordHash, ...fields }) {
  return User.findOneAndUpdate(
    { email },
    { $set: { ...fields, email, password: passwordHash, passwordHash } },
    upsert,
  );
}

async function seedSeatBookingRooms() {
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

  for (const roomData of rooms) {
    const room = await Room.findOneAndUpdate({ code: roomData.code }, { $set: roomData }, upsert);
    for (let i = 1; i <= Math.min(room.totalSeats, 10); i++) {
      const seatNumber = `${room.code.substring(0, 2)}-S${String(i).padStart(2, '0')}`;
      await BookingSeat.updateOne(
        { room: room._id, seatNumber },
        { $set: { room: room._id, seatNumber, pod: i <= 5 ? 'A' : 'B', features: room.amenities.slice(0, 2), isActive: true } },
        { upsert: true },
      );
    }
  }
}

async function seed() {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is not set.');
  await mongoose.connect(process.env.MONGODB_URI);

  const adminPasswordHash = await bcrypt.hash('Admin@12345', 10);
  const demoPasswordHash = await bcrypt.hash('Password123!', 10);

  const admin = await upsertUser({
    email: 'admin@example.com', passwordHash: adminPasswordHash,
    name: 'Library Admin', studentId: 'ADMIN-000001', role: 'Admin', status: 'Active',
  });
  const staff = await upsertUser({
    email: 'staff@library.com', passwordHash: await bcrypt.hash('Admin@123', 10),
    name: 'Library Staff', studentId: 'STAFF-000001', role: 'Staff', status: 'Active',
  });
  const demoUser = await upsertUser({
    email: 'ashan.s@university.edu.lk', passwordHash: demoPasswordHash,
    name: 'Ashan Senanayake', fullName: 'Ashan Senanayake',
    studentId: '2026100001', department: 'Computing',
    phone: '+94 77 123 4567', program: 'BSc Computer Science',
    semester: 'Semester II', role: 'Student', status: 'Active',
    stats: { holdings: 5, bookings: 3, alerts: 4 },
    notificationPreferences: {
      pushEnabled: true, bookHolds: true, seatAlerts: true,
      dueDateReminders: true, cancellationNotices: true,
      emailSummaries: false, quietHoursEnabled: true,
    },
  });

  const students = [demoUser];
  for (const [name, email, studentId] of [
    ['Nimal Perera', 'nimal@student.com', '2026100002'],
    ['Kasun Silva', 'kasun@student.com', '2026100003'],
    ['Nethmi Fernando', 'nethmi@student.com', '2026100004'],
  ]) {
    students.push(await upsertUser({
      email, passwordHash: demoPasswordHash, name, fullName: name,
      studentId, department: 'Computing', role: 'Student', status: 'Active',
    }));
  }

  const categories = {};
  for (const name of ['Programming', 'Fiction', 'Science', 'History', 'Business']) {
    categories[name] = await Category.findOneAndUpdate({ name }, { $set: { name } }, upsert);
  }

  const demoBooks = [
    ['Database System Concepts', 'Silberschatz', '9780078022159', 'Science'],
    ['Sapiens', 'Yuval Noah Harari', '9780062316097', 'History'],
  ];
  const books = [];
  for (const [title, author, isbn, category] of demoBooks) {
    books.push(await Book.findOneAndUpdate(
      { isbn },
      { $setOnInsert: { title, author, isbn, category: categories[category]._id, copies: 5, available: 5 } },
      upsert,
    ));
  }

  const seats = [];
  for (const row of ['A', 'B', 'C']) {
    for (let i = 1; i <= 5; i++) {
      const label = `${row}${i}`;
      seats.push(await Seat.findOneAndUpdate(
        { label },
        { $set: { label, status: ['Available', 'Occupied', 'Reserved'][(i + row.charCodeAt(0)) % 3] } },
        upsert,
      ));
    }
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const hours = [9, 10, 10, 11, 13, 14, 14, 14, 15, 16, 18];
  for (let i = 0; i < hours.length; i++) {
    const startTime = new Date(today);
    startTime.setHours(hours[i], 0, 0, 0);
    const isBook = i % 2 === 0;
    const reservation = {
      user: students[i % students.length]._id,
      type: isBook ? 'Book' : 'Seat',
      ...(isBook ? { book: books[i % books.length]._id } : { seat: seats[i % seats.length]._id }),
      status: ['Pending', 'Confirmed', 'Cancelled'][i % 3],
      startTime,
      endTime: new Date(startTime.getTime() + 2 * 60 * 60 * 1000),
    };
    await Reservation.updateOne(
      { user: reservation.user, type: reservation.type, startTime },
      { $setOnInsert: reservation },
      { upsert: true },
    );
  }

  for (const [title, message] of [
    ['Holiday hours', 'Library closes at 5 PM on Friday.'],
    ['New arrivals', 'New programming books added.'],
  ]) {
    await Announcement.updateOne({ title }, { $setOnInsert: { title, message, active: true } }, { upsert: true });
  }

  const now = Date.now();
  const notificationSeeds = [
    ['book', 'ready', 'Book Hold Ready for Pickup', 'Introduction to Algorithms • 4th Ed.', { bookTitle: 'Introduction to Algorithms', bookAuthor: 'Cormen, Leiserson, Rivest, Stein', isbn: '978-0-262-04630-5', pickupLocation: 'Main Circulation Desk', holdShelf: 'Hold Shelf B-14', daysRemaining: 3 }],
    ['seat', 'expiring', 'Study Seat Expiring Soon', 'East Wing Atrium • Seat E-07', { roomName: 'East Wing Atrium', seatNumber: 'E-07', expiresAt: '2:15 PM', minutesRemaining: 15 }],
    ['seat', 'released', 'Seat Auto-Released', 'Media Pod M-03 • Level 1', { roomName: 'Media Pods', seatNumber: 'M-03', body: 'Your seat reservation expired and has been released back to the pool.' }],
    ['system', 'info', 'Library Hours Extended', 'Main Floor open until Midnight tonight', { body: 'The Main Floor will remain open until midnight during assessment week.' }],
    ['book', 'ready', 'Book Hold Ready for Pickup', 'Clean Code • Robert C. Martin', { bookTitle: 'Clean Code', bookAuthor: 'Robert C. Martin', isbn: '978-0-132-35088-4', pickupLocation: 'Main Circulation Desk', holdShelf: 'Hold Shelf A-02', daysRemaining: 2 }],
    ['seat', 'expiring', 'Study Seat Expiring Soon', 'Quiet Reading Corner • Seat Q-11', { roomName: 'Quiet Reading Corner', seatNumber: 'Q-11', expiresAt: '4:45 PM', minutesRemaining: 15 }],
  ];
  for (const recipient of students) {
    for (let i = 0; i < notificationSeeds.length; i++) {
      const [type, status, title, subtitle, detail] = notificationSeeds[i];
      await Notification.updateOne(
        { userId: recipient._id, type, title, subtitle },
        { $setOnInsert: { userId: recipient._id, type, status, title, subtitle, detail, isRead: i === 2 || i >= 4, createdAt: new Date(now - (i + 1) * 60 * 60 * 1000) } },
        { upsert: true },
      );
    }
  }

  for (const message of [
    { subject: 'Book Reservation', message: 'Please check the status of my book hold.', status: 'open' },
    { subject: 'Account Issue', message: 'My student ID card is not scanning.', status: 'resolved' },
  ]) {
    await ContactMessage.updateOne(
      { userId: demoUser._id, subject: message.subject, message: message.message },
      { $setOnInsert: { ...message, userId: demoUser._id } },
      { upsert: true },
    );
  }
  for (const [faqId, helpful] of [['faq-1', true], ['faq-3', false]]) {
    await FaqFeedback.updateOne({ userId: demoUser._id, faqId }, { $setOnInsert: { userId: demoUser._id, faqId, helpful } }, { upsert: true });
  }

  await seedBooks();
  await seedSeatBookingRooms();
  console.log(`Seed complete. Admin: ${admin.email}; staff: ${staff.email}; student demo: ${demoUser.email}.`);
}

seed()
  .catch(error => {
    console.error('Seed failed:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
  });
