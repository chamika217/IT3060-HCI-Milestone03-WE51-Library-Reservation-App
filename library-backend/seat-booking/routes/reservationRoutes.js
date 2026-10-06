const express = require('express');
const router = express.Router();
const {
  createReservation,
  getMyReservations,
  cancelReservation,
  checkIn,
  extendReservation,
} = require('../controllers/reservationController');

router.post('/', createReservation);
router.get('/', getMyReservations);
router.patch('/:id/cancel', cancelReservation);
router.patch('/:id/check-in', checkIn);
router.patch('/:id/extend', extendReservation);

module.exports = router;