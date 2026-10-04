require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Category = require('./models/Category');
const Book = require('./models/Book');
const Seat = require('./models/Seat');
const Reservation = require('./models/Reservation');
const Announcement = require('./models/Announcement');

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const hash = await bcrypt.hash('Admin@123', 10);

  const upsertUser = (name, email, role) =>
    User.findOneAndUpdate({ email }, { name, email, role, password: hash, status: 'Active' }, { upsert: true, new: true });
  await upsertUser('Library Admin', 'admin@library.com', 'Admin');
  await upsertUser('Staff Member', 'staff@library.com', 'Staff');
  const students = [];
  for (const [n, e] of [['Nimal Perera', 'nimal@student.com'], ['Kasun Silva', 'kasun@student.com'], ['Nethmi Fernando', 'nethmi@student.com']])
    students.push(await upsertUser(n, e, 'Student'));

  const cats = {};
  for (const n of ['Programming', 'Fiction', 'Science', 'History', 'Business'])
    cats[n] = await Category.findOneAndUpdate({ name: n }, { name: n }, { upsert: true, new: true });

  const books = [];
  for (const [title, author, isbn, c] of [
    ['Clean Code', 'Robert C. Martin', '9780132350884', 'Programming'],
    ['The Alchemist', 'Paulo Coelho', '9780061122415', 'Fiction'],
    ['Database System Concepts', 'Silberschatz', '9780078022159', 'Science'],
    ['Sapiens', 'Yuval Noah Harari', '9780062316097', 'History'],
  ]) books.push(await Book.findOneAndUpdate({ isbn }, { title, author, isbn, category: cats[c]._id, copies: 5, available: 5 }, { upsert: true, new: true }));

  const seats = [];
  for (const row of ['A', 'B', 'C'])
    for (let i = 1; i <= 5; i++)
      seats.push(await Seat.findOneAndUpdate({ label: `${row}${i}` }, { label: `${row}${i}`, status: ['Available', 'Occupied', 'Reserved'][(i + row.charCodeAt(0)) % 3] }, { upsert: true, new: true }));

  await Reservation.deleteMany({});
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
  await Announcement.deleteMany({});
  await Announcement.create([{ title: 'Holiday hours', message: 'Library closes at 5 PM on Friday.' }, { title: 'New arrivals', message: 'New programming books added.' }]);

  console.log('Seed done. Login: admin@library.com / Admin@123');
  process.exit(0);
})();