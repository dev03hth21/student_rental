const mongoose = require('mongoose');
const asyncHandler = require('../utils/asyncHandler');
const ResponseHandler = require('../utils/responseHandler');
const Notification = require('../models/Notification');

// GET /api/notifications - list notifications of current user
const getMyNotifications = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));
  const skip = (page - 1) * limit;

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find({ user: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Notification.countDocuments({ user: userId }),
    Notification.countDocuments({ user: userId, isRead: false }),
  ]);

  return ResponseHandler.success(res, 'Lấy danh sách thông báo thành công', {
    notifications,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
      unreadCount,
    },
  });
});

// PATCH /api/notifications/:id/read - mark one as read
const markAsRead = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return ResponseHandler.badRequest(res, 'ID thông báo không hợp lệ');
  }

  const notification = await Notification.findOne({ _id: id, user: req.user._id });
  if (!notification) {
    return ResponseHandler.notFound(res, 'Không tìm thấy thông báo');
  }

  if (!notification.isRead) {
    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();
  }

  return ResponseHandler.success(res, 'Đã cập nhật thông báo', { notification });
});

// PATCH /api/notifications/read-all - mark all as read
const markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { user: req.user._id, isRead: false },
    { $set: { isRead: true, readAt: new Date() } }
  );

  return ResponseHandler.success(res, 'Đã đánh dấu tất cả thông báo là đã đọc');
});

// POST /api/notifications - create notification (admin/system)
const createNotification = asyncHandler(async (req, res) => {
  const { user, type, title, message, data } = req.body || {};
  if (!user || !mongoose.isValidObjectId(user)) {
    return ResponseHandler.badRequest(res, 'User nhận thông báo không hợp lệ');
  }
  if (!type || !title || !message) {
    return ResponseHandler.badRequest(res, 'Thiếu thông tin (type/title/message)');
  }

  const notification = await Notification.create({
    user,
    sender: req.user?._id,
    type,
    title,
    message,
    data,
  });

  // Push realtime via socket if available
  const io = req.app.get('io');
  if (io?.sendNotificationToUser) {
    io.sendNotificationToUser(user.toString(), notification.toObject());
  }

  return ResponseHandler.created(res, 'Đã tạo thông báo', { notification });
});

module.exports = {
  getMyNotifications,
  markAsRead,
  markAllRead,
  createNotification,
};
