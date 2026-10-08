require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Category = require('./models/Category');
const Book = require('./models/Book');
const Seat = require('./models/Seat');
const Reservation = require('./models/Reservation');
const Announcement = require('./models/Announcement');

const resetMode = process.argv.includes('--reset');
const opt = { upsert: true, returnDocument: 'after' };
const adminEmail = (process.env.ADMIN_EMAIL || 'admin@example.com').trim().toLowerCase();
const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@12345';

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const adminHash = await bcrypt.hash(adminPassword, 10);

  const upsertUser = (name, email, role) =>
    User.findOneAndUpdate({ email }, { name, email, role, password: adminHash, status: 'Active' }, opt);

  const existingAdmin = await User.findOne({ email: adminEmail });
  if (!existingAdmin) {
    await User.create({ name: 'Library Admin', email: adminEmail, password: adminHash, role: 'Admin', status: 'Active' });
    console.log(`Admin account created for ${adminEmail}.`);
  } else {
    console.log(`Admin account already exists for ${adminEmail}; no duplicate created.`);
  }
  await upsertUser('Staff Member', 'staff@library.com', 'Staff');
  const students = [];
  for (const [n, e] of [['Nimal Perera', 'nimal@student.com'], ['Kasun Silva', 'kasun@student.com'], ['Nethmi Fernando', 'nethmi@student.com']])
    students.push(await upsertUser(n, e, 'Student'));

  const cats = {};
  for (const n of ['Programming', 'Fiction', 'Science', 'History', 'Business'])
    cats[n] = await Category.findOneAndUpdate({ name: n }, { name: n }, opt);

  const books = [];
  for (const [title, author, isbn, c] of [
    ['Clean Code', 'Robert C. Martin', '9780132350884', 'Programming'],
    ['The Alchemist', 'Paulo Coelho', '9780061122415', 'Fiction'],
    ['Database System Concepts', 'Silberschatz', '9780078022159', 'Science'],
    ['Sapiens', 'Yuval Noah Harari', '9780062316097', 'History'],
  ]) books.push(await Book.findOneAndUpdate({ isbn }, { title, author, isbn, category: cats[c]._id, copies: 5, available: 5 }, opt));

  const seats = [];
  for (const row of ['A', 'B', 'C'])
    for (let i = 1; i <= 5; i++)
      seats.push(await Seat.findOneAndUpdate({ label: `${row}${i}` }, { label: `${row}${i}`, status: ['Available', 'Occupied', 'Reserved'][(i + row.charCodeAt(0)) % 3] }, opt));

  if (resetMode) {
    await Reservation.deleteMany({});
    await Announcement.deleteMany({});
    console.log('Seed reset mode: demo reservations and announcements were cleared.');
  }

  const reservationCount = await Reservation.countDocuments();
  const announcementCount = await Announcement.countDocuments();

  if (resetMode || reservationCount === 0) {
    const at = h => { const d = new Date(); d.setHours(h, 0, 0, 0); return d; };
    const hours = [9, 10, 10, 11, 13, 14, 14, 14, 15, 16, 18];
    for (let i = 0; i < hours.length; i++) {
      const isBook = i % 2 === 0;
      await Reservation.create({
        user: students[i % 3]._id, type: isBook ? 'Book' : 'Seat',
        book: isBook ? books[i % 4]._id : undefined, seat: isBook ? undefined : seats[i % seats.length]._id,
        status: ['Pending', 'Confirmed', 'Cancelled'][i % 3], startTime: at(hours[i]), endTime: at(hours[i] + 2),
      });
    }
    console.log('Seed mode: demo reservations created.');
  } else {
    console.log('Seed mode: existing reservations preserved; demo reservations were skipped.');
  }

  if (resetMode || announcementCount === 0) {
    await Announcement.create([{ title: 'Holiday hours', message: 'Library closes at 5 PM on Friday.' }, { title: 'New arrivals', message: 'New programming books added.' }]);
    console.log('Seed mode: demo announcements created.');
  } else {
    console.log('Seed mode: existing announcements preserved; demo announcements were skipped.');
  }

  console.log(`${resetMode ? 'Reset' : 'Default'} seed mode finished. Login: ${adminEmail}.`);
  process.exit(0);
})();
/**
 * seed.js — populate MongoDB with one sample user and 6 sample notifications.
 *
 * Usage:
 *   node seed.js
 *
 * The script connects to MongoDB using the same .env as server.js,
 * clears existing data, inserts fresh seed records, and exits.
 * The created user's _id is printed so you can use it for API testing.
 */

require('dotenv').config();
const mongoose = require('mongoose');

const User            = require('./models/User');
const Notification    = require('./models/Notification');
const ContactMessage  = require('./models/ContactMessage');
const FaqFeedback     = require('./models/FaqFeedback');

// ─── Seed data ────────────────────────────────────────────────────────────────

const SEED_USER = {
  fullName:  'Ashan Senanayake',
  email:     'ashan.s@university.edu.lk',
  password:  'Password123!',         // will be hashed by the pre-save hook
  phone:     '+94 77 123 4567',
  studentId: '204918',
  program:   'BSc Computer Science',
  semester:  'Semester II',
  role:      'student',
  stats: {
    holdings: 5,
    bookings: 3,
    alerts:   4,
  },
  notificationPreferences: {
    pushEnabled:         true,
    bookHolds:           true,
    seatAlerts:          true,
    dueDateReminders:    true,
    cancellationNotices: true,
    emailSummaries:      false,
    quietHoursEnabled:   true,
  },
};

/** Returns the 6 sample notifications once we have a real userId. */
function buildNotifications(userId) {
  const now = new Date();
  const minsAgo  = (m) => new Date(now - m * 60 * 1000);
  const hoursAgo = (h) => new Date(now - h * 3600 * 1000);
  const daysAgo  = (d) => new Date(now - d * 86400 * 1000);

  return [
    {
      userId,
      type:     'book',
      status:   'ready',
      title:    'Book Hold Ready for Pickup',
      subtitle: 'Introduction to Algorithms • 4th Ed.',
      isRead:   false,
      createdAt: minsAgo(45),
      detail: {
        bookTitle:      'Introduction to Algorithms',
        bookAuthor:     'Cormen, Leiserson, Rivest, Stein',
        isbn:           '978-0-262-04630-5',
        pickupLocation: 'Main Circulation Desk',
        holdShelf:      'Hold Shelf B-14',
        holdExpiry:     'Oct 07, 2026',
        daysRemaining:  3,
        barcodeValue:   'LIB-2026-BCR-00427',
      },
    },
    {
      userId,
      type:     'seat',
      status:   'expiring',
      title:    'Study Seat Expiring Soon',
      subtitle: 'East Wing Atrium • Seat E-07',
      isRead:   false,
      createdAt: minsAgo(12),
      detail: {
        roomName:         'East Wing Atrium',
        seatNumber:       'E-07',
        expiresAt:        '2:15 PM',
        minutesRemaining: 15,
      },
    },
    {
      userId,
      type:     'seat',
      status:   'released',
      title:    'Seat Auto-Released',
      subtitle: 'Media Pod M-03 • Level 1',
      isRead:   true,
      createdAt: hoursAgo(2),
      detail: {
        roomName:   'Media Pods',
        seatNumber: 'M-03',
        body:       'Your seat reservation expired and has been released back to the pool. Book a new seat to continue your session.',
      },
    },
    {
      userId,
      type:     'system',
      status:   'info',
      title:    'Library Hours Extended',
      subtitle: 'Main Floor open until Midnight tonight',
      isRead:   false,
      createdAt: hoursAgo(3),
      detail: {
        body: 'Due to upcoming mid-semester assessments, the Main Floor will remain open until midnight from Monday 5 Oct to Friday 9 Oct 2026. Normal closing time resumes on Saturday.',
      },
    },
    {
      userId,
      type:     'book',
      status:   'ready',
      title:    'Book Hold Ready for Pickup',
      subtitle: 'Clean Code • Robert C. Martin',
      isRead:   true,
      createdAt: daysAgo(1),
      detail: {
        bookTitle:      'Clean Code: A Handbook of Agile Software Craftsmanship',
        bookAuthor:     'Robert C. Martin',
        isbn:           '978-0-132-35088-4',
        pickupLocation: 'Main Circulation Desk',
        holdShelf:      'Hold Shelf A-02',
        holdExpiry:     'Oct 06, 2026',
        daysRemaining:  2,
        barcodeValue:   'LIB-2026-BCR-00391',
      },
    },
    {
      userId,
      type:     'seat',
      status:   'expiring',
      title:    'Study Seat Expiring Soon',
      subtitle: 'Quiet Reading Corner • Seat Q-11',
      isRead:   true,
      createdAt: daysAgo(1),
      detail: {
        roomName:         'Quiet Reading Corner',
        seatNumber:       'Q-11',
        expiresAt:        '4:45 PM',
        minutesRemaining: 15,
      },
    },
  ];
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 15000,
      tls: true,
      tlsInsecure: true,
    });
    console.log('✓ Connected to MongoDB');

    // ── Clear existing collections ─────────────────────────────────────────
    await Promise.all([
      User.deleteMany({}),
      Notification.deleteMany({}),
      ContactMessage.deleteMany({}),
      FaqFeedback.deleteMany({}),
    ]);
    console.log('✓ Cleared Users, Notifications, ContactMessages, FaqFeedback');

    // ── Insert user ────────────────────────────────────────────────────────
    const user = await User.create(SEED_USER);
    console.log('✓ Created user:', user.fullName);

    // ── Insert notifications ───────────────────────────────────────────────
    const notifications = await Notification.insertMany(buildNotifications(user._id));
    console.log(`✓ Inserted ${notifications.length} notifications`);

    // ── Insert contact messages ────────────────────────────────────────────
    await ContactMessage.insertMany([
      {
        userId:  user._id,
        subject: 'Book Reservation',
        message: 'Hi, I reserved "Introduction to Algorithms" last week but have not received a pickup notification yet. Could you please check the status of my hold?',
        status:  'open',
        createdAt: new Date(Date.now() - 2 * 86400 * 1000), // 2 days ago
      },
      {
        userId:  user._id,
        subject: 'Account Issue',
        message: 'My student ID card is not scanning at the turnstile on Level 1. I have tried multiple times over the past two days. Please help.',
        status:  'resolved',
        createdAt: new Date(Date.now() - 7 * 86400 * 1000), // 7 days ago
      },
    ]);
    console.log('✓ Inserted 2 contact messages');

    // ── Insert FAQ feedback ────────────────────────────────────────────────
    await FaqFeedback.insertMany([
      { userId: user._id, faqId: 'faq-1', helpful: true  },
      { userId: user._id, faqId: 'faq-3', helpful: false },
    ]);
    console.log('✓ Inserted 2 FAQ feedback entries');

    // ── Print test values ──────────────────────────────────────────────────
    console.log('\n──────────────────────────────────────────');
    console.log('Use these values for testing:');
    console.log('  userId    :', user._id.toString());
    console.log('  email     :', user.email);
    console.log('  password  : Password123!');
    console.log('  studentId :', user.studentId);
    console.log('──────────────────────────────────────────\n');

  } catch (err) {
    console.error('✗ Seed failed:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('✓ Disconnected. Seed complete.');
    process.exit(0);
  }
}

seed();
