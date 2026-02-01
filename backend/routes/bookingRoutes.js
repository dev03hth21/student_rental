const express = require('express');
const router = express.Router();
const { getOwnerListingsFromBookings } = require('../controllers/bookingController');

router.get('/owner', getOwnerListingsFromBookings);

router.get('/', (req, res) => {
  res.json({ message: 'Booking routes ready' });
});

module.exports = router;
