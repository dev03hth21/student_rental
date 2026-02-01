/**
 * CallLog Routes
 * Routes for call log management (student perspective)
 * Alias routes matching frontend expectations
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');
const { recordCall } = require('../controllers/callLogController');

// All routes require authentication as student
router.use(protect, authorize('student'));

/**
 * @route   POST /api/calllogs/:roomId
 * @desc    Record call to room owner (alias for /rooms/:id/call)
 * @access  Private (Student)
 */
router.post('/:roomId', recordCall);

module.exports = router;
