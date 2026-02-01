const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');
const { getHostDashboard } = require('../controllers/hostDashboardController');

// Host dashboard stats (requires login + owner role)
router.get('/', protect, authorize('owner'), getHostDashboard);

module.exports = router;
