const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');
const {
  getMyNotifications,
  markAsRead,
  markAllRead,
  createNotification,
} = require('../controllers/notificationController');

// Lấy thông báo của chính user
router.get('/', protect, getMyNotifications);

// Đánh dấu 1 thông báo đã đọc
router.patch('/:id/read', protect, markAsRead);

// Đánh dấu tất cả thông báo đã đọc
router.patch('/read-all', protect, markAllRead);

// Tạo thông báo (chỉ admin/system)
router.post('/', protect, authorize('admin'), createNotification);

module.exports = router;
