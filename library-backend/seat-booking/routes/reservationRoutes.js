const express = require('express');
const router = express.Router();
const {
  createReservation,
  getMyReservations,
  cancelReservation,
} = require('../controllers/reservationController');

router.post('/', createReservation);
router.get('/', getMyReservations);
router.patch('/:id/cancel', cancelReservation);

module.exports = router;