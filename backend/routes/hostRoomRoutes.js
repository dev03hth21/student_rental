const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');
const { getHostRooms, getHostRoomDetail } = require('../controllers/roomController');

// Host xem danh sách phòng của chính mình (requires auth + owner role)
router.get('/', protect, authorize('owner'), getHostRooms);
router.get('/:id', protect, authorize('owner'), getHostRoomDetail);

module.exports = router;
