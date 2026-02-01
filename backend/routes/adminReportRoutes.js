const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');
const { listReports, getReportById, updateReportStatus } = require('../controllers/reportController');

router.use(protect, authorize('admin'));

router.get('/', listReports);
router.get('/:id', getReportById);
router.patch('/:id/status', updateReportStatus);

module.exports = router;
