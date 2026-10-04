const router = require('express').Router();
const Book = require('../../models/Book');
const User = require('../../models/User');
const Seat = require('../../models/Seat');
const Reservation = require('../../models/Reservation');
const Report = require('../../models/Report');
const { protect, staffOnly } = require('../../middleware/auth');
router.use(protect, staffOnly);

async function summary() {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const [totalBooks, totalUsers, todayReservations, occupiedSeats, totalSeats, pending] = await Promise.all([
    Book.countDocuments(), User.countDocuments(),
    Reservation.countDocuments({ createdAt: { $gte: today } }),
    Seat.countDocuments({ status: 'Occupied' }), Seat.countDocuments(),
    Reservation.countDocuments({ status: 'Pending' }),
  ]);
  return { totalBooks, totalUsers, todayReservations, occupiedSeats, totalSeats, pending };
}

async function peakHours() {
  const rows = await Reservation.aggregate([
    { $group: { _id: { $hour: { date: '$startTime', timezone: 'Asia/Colombo' } }, count: { $sum: 1 } } },
  ]);
  const map = Object.fromEntries(rows.map(r => [r._id, r.count]));
  return Array.from({ length: 13 }, (_, i) => ({ hour: i + 8, count: map[i + 8] || 0 })); // 8AM-8PM
}

router.get('/summary', async (req, res) => res.json(await summary()));
router.get('/peak-hours', async (req, res) => res.json(await peakHours()));

router.get('/recent', async (req, res) => {
  const rows = await Reservation.find().sort({ createdAt: -1 }).limit(8)
    .populate('user', 'name').populate('book', 'title').populate('seat', 'label');
  res.json(rows.map(r => ({
    _id: r._id, status: r.status, createdAt: r.createdAt,
    text: `${r.user?.name || 'Unknown'} - ${r.type === 'Book' ? r.book?.title : 'Seat ' + r.seat?.label}`,
  })));
});

// saved report snapshots (Create / Read / Delete)
router.get('/reports', async (req, res) => res.json(await Report.find().sort({ createdAt: -1 })));
router.post('/reports', async (req, res) => {
  const data = { summary: await summary(), peakHours: await peakHours() };
  const title = req.body.title || `Report ${new Date().toLocaleString()}`;
  res.status(201).json(await Report.create({ title, data }));
});
router.delete('/reports/:id', async (req, res) => {
  await Report.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

module.exports = router;