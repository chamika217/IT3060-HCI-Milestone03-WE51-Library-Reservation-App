const router = require('express').Router();
const Announcement = require('../../models/Announcement');
const { protect, staffOnly } = require('../../middleware/auth');
router.use(protect, staffOnly);

router.get('/', async (req, res) => res.json(await Announcement.find().sort({ createdAt: -1 })));

router.post('/', async (req, res) => {
  try { res.status(201).json(await Announcement.create(req.body)); }
  catch (e) { res.status(400).json({ message: e.message }); }
});

router.put('/:id', async (req, res) => {
  try { res.json(await Announcement.findByIdAndUpdate(req.params.id, req.body, { new: true })); }
  catch (e) { res.status(400).json({ message: e.message }); }
});

router.delete('/:id', async (req, res) => {
  await Announcement.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

module.exports = router;