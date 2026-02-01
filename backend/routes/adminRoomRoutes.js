const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');
const { adminListRooms, adminGetRoom, adminUpdateRoomStatus } = require('../controllers/roomController');
const { approveRoom, rejectRoom } = require('../controllers/adminController');

// Admin xem danh sách phòng (lọc theo status) - requires auth + admin role
router.get('/', protect, authorize('admin'), adminListRooms);

// Admin xem chi tiết phòng
router.get('/:id', protect, authorize('admin'), adminGetRoom);

// Admin duyệt/cập nhật trạng thái phòng - requires auth + admin role
router.patch('/:id/status', protect, authorize('admin'), adminUpdateRoomStatus);

// Admin duyệt/từ chối phòng (đầy đủ nghiệp vụ)
router.put('/:id/approve', protect, authorize('admin'), approveRoom);
router.put('/:id/reject', protect, authorize('admin'), rejectRoom);

module.exports = router;
