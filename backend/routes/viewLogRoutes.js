/**
 * ViewLog Routes
 * Routes for view history management
 * Alias routes matching frontend expectations
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');
const ViewLog = require('../models/ViewLog');
const ResponseHandler = require('../utils/responseHandler');
const asyncHandler = require('../utils/asyncHandler');

// All routes require authentication as student
router.use(protect, authorize('student'));

/**
 * @route   GET /api/viewlogs
 * @desc    Get user's view history
 * @access  Private (Student)
 */
router.get('/', asyncHandler(async (req, res) => {
  const viewLogs = await ViewLog.find({ userId: req.user._id })
    .sort({ createdAt: -1 })
    .populate({
      path: 'roomId',
      select: '_id title description price area address images location status type contactPhone ownerId createdAt updatedAt'
    })
    .lean();

  // Transform data to match frontend expectations
  const transformedLogs = viewLogs
    .filter(log => log.roomId) // Filter out logs with deleted rooms
    .map(log => ({
      _id: log._id,
      room: log.roomId, // Expose as 'room' for frontend
      createdAt: log.createdAt, // Use createdAt for view time
      viewedAt: log.viewedAt || log.createdAt,
    }));

  return ResponseHandler.success(res, 'Lấy lịch sử xem phòng thành công', {
    data: transformedLogs,
    total: transformedLogs.length
  });
}));

/**
 * @route   DELETE /api/viewlogs
 * @desc    Clear all view history
 * @access  Private (Student)
 */
router.delete('/', asyncHandler(async (req, res) => {
  const result = await ViewLog.deleteMany({ userId: req.user._id });

  return ResponseHandler.success(res, 'Đã xóa lịch sử xem phòng', {
    deletedCount: result.deletedCount
  });
}));

/**
 * @route   POST /api/viewlogs/:roomId
 * @desc    Record room view (alias for /rooms/:id/view)
 * @access  Private (Student)
 */
router.post('/:roomId', asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  const mongoose = require('mongoose');
  const Room = require('../models/Room');

  if (!mongoose.isValidObjectId(roomId)) {
    return ResponseHandler.badRequest(res, 'roomId không hợp lệ');
  }

  const roomExists = await Room.exists({ _id: roomId });
  if (!roomExists) {
    return ResponseHandler.notFound(res, 'Không tìm thấy phòng');
  }

  const VIEW_LOG_WINDOW_MS = 5 * 60 * 1000; // 5 phút
  const cutoff = new Date(Date.now() - VIEW_LOG_WINDOW_MS);
  
  const existingLog = await ViewLog.findOne({
    userId: req.user._id,
    roomId,
    createdAt: { $gte: cutoff },
  });

  if (existingLog) {
    existingLog.createdAt = new Date();
    await existingLog.save();
    return ResponseHandler.success(res, 'Đã cập nhật thời gian xem gần nhất', {
      viewLog: existingLog,
    });
  }

  const viewLog = await ViewLog.create({
    userId: req.user._id,
    roomId,
    createdAt: new Date(),
  });

  return ResponseHandler.created(res, 'Đã ghi nhận lượt xem phòng', {
    viewLog,
  });
}));

module.exports = router;
