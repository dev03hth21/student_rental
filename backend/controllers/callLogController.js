const mongoose = require('mongoose');
const asyncHandler = require('../utils/asyncHandler');
const ResponseHandler = require('../utils/responseHandler');
const Room = require('../models/Room');
const User = require('../models/User');
const CallLog = require('../models/CallLog');

const normalizeFilter = (filterType = 'all') =>
  typeof filterType === 'string' ? filterType.toLowerCase() : 'all';

const buildCallLogQuery = ({ hostId, filterType = 'all', roomId }) => {
  const normalizedFilter = normalizeFilter(filterType);
  const query = { hostId };

  if (normalizedFilter === 'unread') {
    query.isRead = false;
  }

  if (roomId) {
    if (!mongoose.isValidObjectId(roomId)) {
      return { error: 'INVALID_ROOM_ID' };
    }
    query.roomId = roomId;
  }

  if (normalizedFilter === 'by-room' && !roomId) {
    return { error: 'ROOM_ID_REQUIRED' };
  }

  return { query, normalizedFilter };
};

const buildRoomStats = (callLogs = []) => {
  const stats = new Map();

  callLogs.forEach((log) => {
    const key = log.roomId?._id?.toString() || 'unknown';
    const current = stats.get(key) || {
      roomId: log.roomId?._id || null,
      title: log.roomId?.title || 'Tin đã xóa',
      total: 0,
      unread: 0,
    };

    current.total += 1;
    if (!log.isRead) {
      current.unread += 1;
    }

    stats.set(key, current);
  });

  return stats;
};

const shapeCallLogPayload = (log, roomStats) => {
  const roomKey = log.roomId?._id?.toString() || 'unknown';
  const roomStat = roomStats.get(roomKey);

  return {
    id: log._id,
    roomId: log.roomId?._id || null,
    roomTitle: log.roomId?.title || 'Tin đã xóa',
    studentId: log.studentId?._id || null,
    studentName: log.studentId?.fullName || 'Sinh viên ẩn danh',
    studentAvatar: log.studentId?.avatar || null,
    callerEmail: log.callerEmail || log.studentId?.email || null,
    phoneNumber: log.phoneNumber,
    createdAt: log.createdAt,
    isRead: log.isRead,
    readAt: log.readAt || null,
    roomCallCount: roomStat?.total || 1,
  };
};

const recordCall = asyncHandler(async (req, res) => {
  // Support both :id and :roomId params for compatibility
  const roomId = req.params.id || req.params.roomId;
  const fallbackPhone = req.body?.phoneNumber;

  if (!mongoose.isValidObjectId(roomId)) {
    return ResponseHandler.badRequest(res, 'ID phòng không hợp lệ');
  }

  const room = await Room.findById(roomId);
  if (!room) {
    return ResponseHandler.notFound(res, 'Không tìm thấy phòng');
  }

  const owner = await User.findById(room.ownerId).select('phone email');
  const phoneNumber = room.contactPhone || owner?.phone || fallbackPhone;

  if (!phoneNumber) {
    return ResponseHandler.badRequest(res, 'Không tìm thấy số điện thoại liên hệ');
  }

  room.callCount = (room.callCount || 0) + 1;
  await room.save();

  const callLog = await CallLog.create({
    roomId: room._id,
    hostId: room.ownerId,
    studentId: req.user._id,
    callerEmail: req.user.email || owner?.email || null,
    phoneNumber,
    isRead: false,
  });

  return ResponseHandler.created(res, 'Đã ghi nhận lượt gọi', {
    room: {
      id: room._id,
      callCount: room.callCount,
    },
    callLog,
    phoneNumber, // Return phone number for frontend to use
  });
});

const getHostCallLogs = asyncHandler(async (req, res) => {
  const { filter = 'all', roomId } = req.query;
  const hostId = req.user._id;

  const { query, error } = buildCallLogQuery({ hostId, filterType: filter, roomId });

  if (error === 'ROOM_ID_REQUIRED') {
    return ResponseHandler.badRequest(res, 'Cần cung cấp roomId khi lọc theo phòng');
  }

  if (error === 'INVALID_ROOM_ID') {
    return ResponseHandler.badRequest(res, 'roomId không hợp lệ');
  }

  const callLogs = await CallLog.find(query)
    .sort({ createdAt: -1 })
    .populate('roomId', 'title status')
    .populate('studentId', 'fullName avatar phone email');

  const roomStats = buildRoomStats(callLogs);
  const formattedLogs = callLogs.map((log) => shapeCallLogPayload(log, roomStats));

  const roomFilters = Array.from(roomStats.values()).map((room) => ({
    roomId: room.roomId,
    title: room.title,
    totalCalls: room.total,
    unreadCalls: room.unread,
  }));

  const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const [totalCalls, unreadCalls, recentCalls] = await Promise.all([
    CallLog.countDocuments({ hostId }),
    CallLog.countDocuments({ hostId, isRead: false }),
    CallLog.countDocuments({ hostId, createdAt: { $gte: last24Hours } }),
  ]);

  return ResponseHandler.success(res, 'Lấy lịch sử cuộc gọi thành công', {
    logs: formattedLogs,
    rooms: roomFilters,
    summary: {
      total: totalCalls,
      unread: unreadCalls,
      callsToday: recentCalls,
      filter: normalizeFilter(filter),
      roomId: roomId || null,
    },
  });
});

const markCallLogAsRead = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const hostId = req.user._id;

  if (!mongoose.isValidObjectId(id)) {
    return ResponseHandler.badRequest(res, 'ID cuộc gọi không hợp lệ');
  }

  const callLog = await CallLog.findOne({ _id: id, hostId });

  if (!callLog) {
    return ResponseHandler.notFound(res, 'Không tìm thấy lịch sử cuộc gọi');
  }

  if (!callLog.isRead) {
    callLog.isRead = true;
    callLog.readAt = new Date();
    await callLog.save();
  }

  return ResponseHandler.success(res, 'Đã cập nhật trạng thái cuộc gọi', {
    id: callLog._id,
    isRead: callLog.isRead,
    readAt: callLog.readAt,
  });
});

const markAllCallLogsAsRead = asyncHandler(async (req, res) => {
  const hostId = req.user._id;

  const result = await CallLog.updateMany(
    { hostId, isRead: false },
    { $set: { isRead: true, readAt: new Date() } }
  );

  return ResponseHandler.success(res, 'Đã đánh dấu tất cả cuộc gọi là đã đọc', {
    matched: result.matchedCount || result.n || 0,
    modified: result.modifiedCount || result.nModified || 0,
  });
});

module.exports = {
  recordCall,
  getHostCallLogs,
  markCallLogAsRead,
  markAllCallLogsAsRead,
  __testables: {
    buildCallLogQuery,
    buildRoomStats,
  },
};
