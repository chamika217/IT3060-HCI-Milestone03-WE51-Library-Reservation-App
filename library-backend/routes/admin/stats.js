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
  return Array.from({ length: 13 }, (_, i) => ({ hour: i + 8, count: map[i + 8] || 0 }));
}

router.get('/summary', async (req, res) => {
  try { res.json(await summary()); } catch (e) { res.status(500).json({ message: e.message }); }
});
router.get('/peak-hours', async (req, res) => {
  try { res.json(await peakHours()); } catch (e) { res.status(500).json({ message: e.message }); }
});

router.get('/recent', async (req, res) => {
  try {
    const rows = await Reservation.find().sort({ createdAt: -1 }).limit(8)
      .populate('user', 'name').populate('book', 'title').populate('seat', 'label');
    res.json(rows.map(r => ({
      _id: r._id, status: r.status, createdAt: r.createdAt,
      text: `${r.user?.name || 'Unknown'} - ${r.type === 'Book' ? r.book?.title : 'Seat ' + r.seat?.label}`,
    })));
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.get('/reports', async (req, res) => {
  try { res.json(await Report.find().sort({ createdAt: -1 })); } catch (e) { res.status(500).json({ message: e.message }); }
});
router.post('/reports', async (req, res) => {
  try {
    const data = { summary: await summary(), peakHours: await peakHours() };
    const title = req.body.title || `Report ${new Date().toLocaleString()}`;
    res.status(201).json(await Report.create({ title, data }));
  } catch (e) { res.status(500).json({ message: e.message }); }
});
router.delete('/reports/:id', async (req, res) => {
  try {
    await Report.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
