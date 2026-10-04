const router = require('express').Router();
const Seat = require('../../models/Seat');
const { protect, staffOnly } = require('../../middleware/auth');
router.use(protect, staffOnly);

router.get('/', async (req, res) => res.json(await Seat.find().sort({ label: 1 })));

router.post('/', async (req, res) => {
  try { res.status(201).json(await Seat.create(req.body)); }
  catch (e) { res.status(400).json({ message: e.code === 11000 ? 'Seat label already exists' : e.message }); }
});

router.put('/:id', async (req, res) => {
  try { res.json(await Seat.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })); }
  catch (e) { res.status(400).json({ message: e.message }); }
});

router.delete('/:id', async (req, res) => {
  await Seat.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

module.exports = router;