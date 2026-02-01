const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');
const { adminListBookings } = require('../controllers/bookingController');

router.use(protect, authorize('admin'));

router.get('/', adminListBookings);

module.exports = router;
