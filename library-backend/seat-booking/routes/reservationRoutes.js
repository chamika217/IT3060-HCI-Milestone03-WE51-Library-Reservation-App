const express = require('express');
const router = express.Router();
const {
  createReservation,
  getMyReservations,
  cancelReservation,
  checkIn,
  extendReservation,
  releaseReservation,
} = require('../controllers/reservationController');

router.post('/', createReservation);
router.get('/', getMyReservations);
router.patch('/:id/cancel', cancelReservation);
router.patch('/:id/check-in', checkIn);
router.patch('/:id/extend', extendReservation);
router.patch('/:id/release', releaseReservation);

module.exports = router;