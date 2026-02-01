const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');
const { createReport } = require('../controllers/reportController');
const { upload } = require('../middlewares/uploadMiddleware');

// Student gửi báo cáo phòng sai sự thật
router.post('/', protect, authorize('student'), upload.single('attachment'), createReport);

module.exports = router;
