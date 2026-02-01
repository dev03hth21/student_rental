const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');
const {
	getHostCallLogs,
	markCallLogAsRead,
	markAllCallLogsAsRead,
} = require('../controllers/callLogController');

router.get('/', protect, authorize('owner'), getHostCallLogs);
router.patch('/read-all', protect, authorize('owner'), markAllCallLogsAsRead);
router.patch('/:id/read', protect, authorize('owner'), markCallLogAsRead);

module.exports = router;
