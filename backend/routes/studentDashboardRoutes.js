const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');
const { getStudentDashboard } = require('../controllers/studentDashboardController');

// Student dashboard stats (requires login + student role)
router.get('/', protect, authorize('student'), getStudentDashboard);

module.exports = router;
