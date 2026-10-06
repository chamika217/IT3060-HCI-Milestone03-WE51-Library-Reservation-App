const express = require('express');
const router = express.Router();
const {
  createReservation,
  getMyReservations,
} = require('../controllers/reservationController');

router.post('/', createReservation);
router.get('/', getMyReservations);

module.exports = router;