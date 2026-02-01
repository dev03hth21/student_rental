/**
 * Room Routes
 * Các API public cung cấp dữ liệu phòng cho mobile/web
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');
const {
	listPublicRooms,
	getPublicRoom,
	createRoom,
	updateRoom,
	uploadRoomImages,
	updateRoomLocationOnly,
	submitRoomForReview,
	deleteRoom,
	getRecommendedRooms,
} = require('../controllers/roomController');
const { recordRoomView } = require('../controllers/viewLogController');
const { recordCall } = require('../controllers/callLogController');
const { roomImageUploadMemory } = require('../middlewares/uploadMiddleware');

/**
 * @route   GET /api/rooms
 * @desc    Lấy danh sách phòng với filter cơ bản
 * @access  Public
 */
router.get('/', listPublicRooms);

/**
 * @route   GET /api/rooms/recommend
 * @desc    Lấy phòng đề xuất (trending + mới nhất)
 * @access  Public
 */
router.get('/recommend', getRecommendedRooms);

// Host đăng phòng mới (yêu cầu đăng nhập + role owner)
router.post('/', protect, authorize('owner'), createRoom);

// Host chỉnh sửa/xoá phòng của mình (yêu cầu đăng nhập + role owner)
router.put('/:id', protect, authorize('owner'), updateRoom);
router.delete('/:id', protect, authorize('owner'), deleteRoom);
router.post('/:id/submit', protect, authorize('owner'), submitRoomForReview);
router.post(
	'/:id/images',
	protect,
	authorize('owner'),
	roomImageUploadMemory.array('images', 10),
	uploadRoomImages
);
router.put('/:id/location', protect, authorize('owner'), updateRoomLocationOnly);

// Student ghi nhận lần xem phòng (yêu cầu đăng nhập + role student)
router.post('/:id/view', protect, authorize('student'), recordRoomView);

// Student nhấn nút gọi chủ trọ (yêu cầu đăng nhập + role student)
router.post('/:id/call', protect, authorize('student'), recordCall);

/**
 * @route   GET /api/rooms/:id
 * @desc    Lấy chi tiết phòng
 * @access  Public
 */
router.get('/:id', getPublicRoom);

module.exports = router;
