const mongoose = require('mongoose');
const asyncHandler = require('../utils/asyncHandler');
const ResponseHandler = require('../utils/responseHandler');
const Report = require('../models/Report');
const Room = require('../models/Room');
const cloudinary = require('../config/cloudinary');

const uploadBufferToCloudinary = (fileBuffer, options = {}) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
    stream.end(fileBuffer);
  });

const createReport = asyncHandler(async (req, res) => {
  const { roomId, reason } = req.body || {};

  // Normalize possible client payload shapes (string, ObjectId-like, {$oid: ...})
  const normalizedRoomId =
    (roomId && typeof roomId === 'object')
      ? roomId.$oid || roomId._id || roomId.id || roomId.toString()
      : roomId;

  if (!normalizedRoomId || !mongoose.isValidObjectId(normalizedRoomId)) {
    return ResponseHandler.badRequest(res, 'roomId không hợp lệ');
  }

  if (!reason || typeof reason !== 'string' || !reason.trim()) {
    return ResponseHandler.badRequest(res, 'Vui lòng cung cấp lý do báo cáo');
  }

  const roomExists = await Room.exists({ _id: normalizedRoomId });
  if (!roomExists) {
    return ResponseHandler.notFound(res, 'Không tìm thấy phòng');
  }

  let attachmentUrl = null;
  if (req.file?.buffer) {
    try {
      const uploaded = await uploadBufferToCloudinary(req.file.buffer, {
        folder: 'reports',
        resource_type: 'image',
      });
      attachmentUrl = uploaded?.secure_url || uploaded?.url || null;
    } catch (err) {
      console.error('Upload report attachment failed', err?.message || err);
      // Continue without blocking report creation
    }
  }

  const report = await Report.create({
    roomId: normalizedRoomId,
    userId: req.user._id,
    reason: reason.trim(),
    attachmentUrl,
  });

  return ResponseHandler.created(res, 'Đã gửi báo cáo thành công', { report });
});

const listReports = asyncHandler(async (req, res) => {
  const { status: statusRaw, q } = req.query;
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
  const skip = (page - 1) * limit;

  const filters = {};
  if (statusRaw) {
    const status = statusRaw.trim();
    if (['pending', 'reviewed'].includes(status)) {
      filters.status = status;
    }
  }

  const query = Report.find(filters)
    .sort({ createdAt: -1 })
    .populate('roomId')
    .populate('userId', 'fullName email phone')
    .lean();

  // Optional search on reason (case-insensitive)
  if (q && typeof q === 'string' && q.trim()) {
    query.where({ reason: new RegExp(q.trim(), 'i') });
  }

  const [reports, total] = await Promise.all([
    query.skip(skip).limit(limit),
    Report.countDocuments(filters),
  ]);

  return ResponseHandler.success(res, 'Lấy danh sách báo cáo thành công', {
    reports,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  });
});

const getReportById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return ResponseHandler.badRequest(res, 'ID báo cáo không hợp lệ');
  }

  const report = await Report.findById(id)
    .populate('roomId')
    .populate('userId', 'fullName email phone')
    .lean();

  if (!report) {
    return ResponseHandler.notFound(res, 'Không tìm thấy báo cáo');
  }

  return ResponseHandler.success(res, 'Lấy chi tiết báo cáo thành công', { report });
});

const updateReportStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body || {};

  if (!mongoose.isValidObjectId(id)) {
    return ResponseHandler.badRequest(res, 'ID báo cáo không hợp lệ');
  }

  if (!['pending', 'reviewed'].includes(status)) {
    return ResponseHandler.badRequest(res, 'Trạng thái không hợp lệ (pending/reviewed)');
  }

  const report = await Report.findById(id);
  if (!report) {
    return ResponseHandler.notFound(res, 'Không tìm thấy báo cáo');
  }

  report.status = status;
  await report.save();

  return ResponseHandler.success(res, 'Đã cập nhật trạng thái báo cáo', { report });
});

module.exports = {
  createReport,
  listReports,
  getReportById,
  updateReportStatus,
};
