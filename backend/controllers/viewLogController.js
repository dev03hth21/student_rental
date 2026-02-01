const mongoose = require('mongoose');
const asyncHandler = require('../utils/asyncHandler');
const ResponseHandler = require('../utils/responseHandler');
const ViewLog = require('../models/ViewLog');
const Room = require('../models/Room');

const VIEW_LOG_WINDOW_MS = 5 * 60 * 1000; // 5 phút

const recordRoomView = asyncHandler(async (req, res) => {
  const { id: roomId } = req.params;

  if (!mongoose.isValidObjectId(roomId)) {
    return ResponseHandler.badRequest(res, 'roomId không hợp lệ');
  }

  const roomExists = await Room.exists({ _id: roomId });
  if (!roomExists) {
    return ResponseHandler.notFound(res, 'Không tìm thấy phòng');
  }

  const cutoff = new Date(Date.now() - VIEW_LOG_WINDOW_MS);
  const existingLog = await ViewLog.findOne({
    userId: req.user._id,
    roomId,
    viewedAt: { $gte: cutoff },
  });

  if (existingLog) {
    existingLog.viewedAt = new Date();
    await existingLog.save();
    return ResponseHandler.success(res, 'Đã cập nhật thời gian xem gần nhất', {
      viewLog: existingLog,
    });
  }

  const viewLog = await ViewLog.create({
    userId: req.user._id,
    roomId,
    viewedAt: new Date(),
  });

  return ResponseHandler.created(res, 'Đã ghi nhận lượt xem phòng', {
    viewLog,
  });
});

const getRecentViews = asyncHandler(async (req, res) => {
  // Lấy bản ghi mới nhất cho mỗi roomId của user, tránh trùng lặp
  const aggregated = await ViewLog.aggregate([
    { $match: { userId: req.user._id } },
    { $group: { _id: '$roomId', viewedAt: { $max: '$viewedAt' } } },
    { $sort: { viewedAt: -1 } },
    { $limit: 20 },
    {
      $lookup: {
        from: 'rooms',
        localField: '_id',
        foreignField: '_id',
        as: 'room',
      },
    },
    { $unwind: '$room' },
    {
      $project: {
        _id: '$room._id',
        room: '$room',
        viewedAt: 1,
      },
    },
  ]);

  return ResponseHandler.success(res, 'Lấy lịch sử phòng đã xem thành công', {
    views: aggregated,
  });
});

module.exports = {
  recordRoomView,
  getRecentViews,
};
