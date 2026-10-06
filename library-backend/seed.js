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
