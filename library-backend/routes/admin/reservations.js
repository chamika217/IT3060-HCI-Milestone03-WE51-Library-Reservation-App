const router = require('express').Router();
const Reservation = require('../../models/Reservation');
const { protect, staffOnly } = require('../../middleware/auth');
router.use(protect, staffOnly);

const populate = r => r.populate('user', 'name email').populate('book', 'title').populate('seat', 'label room');

router.get('/', async (req, res) => {
  const q = req.query.status ? { status: req.query.status } : {};
  res.json(await populate(Reservation.find(q).sort({ startTime: -1 })));
});

router.post('/', async (req, res) => {
  try { res.status(201).json(await Reservation.create(req.body)); }
  catch (e) { res.status(400).json({ message: e.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const r = await Reservation.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true, runValidators: true });
    if (!r) return res.status(404).json({ message: 'Not found' });
    res.json(r);
  } catch (e) { res.status(400).json({ message: e.message }); }
});

router.delete('/:id', async (req, res) => {
  await Reservation.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

module.exports = router;