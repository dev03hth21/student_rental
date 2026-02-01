/**
 * Admin Controller
 * Handles all admin operations for user management, host management, room management, and admin profile
 */

const asyncHandler = require('../utils/asyncHandler');
const ResponseHandler = require('../utils/responseHandler');
const User = require('../models/User');
const Room = require('../models/Room');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Report = require('../models/Report');
const Notification = require('../models/Notification');
const mongoose = require('mongoose');

// ========================
// USER MANAGEMENT
// ========================

/**
 * Get all users with filters and pagination
 * @route GET /api/admin/users
 * @access Admin only
 */
const getAllUsers = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    role,
    search,
    sort = '-createdAt',
    status
  } = req.query;

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  // Build query
  const query = {};

  // Filter by role
  if (role && ['student', 'owner', 'admin'].includes(role)) {
    query.role = role;
  }

  // Filter by status (active/inactive based on isActive field if exists)
  if (status) {
    if (status === 'active') {
      query.isActive = { $ne: false };
    } else if (status === 'inactive') {
      query.isActive = false;
    }
  }

  // Search by name, email, phone
  if (search && search.trim()) {
    const searchRegex = new RegExp(search.trim(), 'i');
    query.$or = [
      { fullName: searchRegex },
      { email: searchRegex },
      { phone: searchRegex }
    ];
  }

  // Execute query with pagination
  const [users, total] = await Promise.all([
    User.find(query)
      .select('-password')
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .lean(),
    User.countDocuments(query)
  ]);

  return ResponseHandler.success(res, 'Lấy danh sách người dùng thành công', {
    users,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
      hasMore: pageNum * limitNum < total
    }
  });
});

/**
 * Create an admin account (Super Admin only)
 * @route POST /api/admin/users/admin
 * @access Super Admin
 */
const createAdminUser = asyncHandler(async (req, res) => {
  if (!req.user?.isSuperAdmin) {
    return ResponseHandler.forbidden(res, 'Chỉ Super Admin mới được tạo tài khoản admin');
  }

  const { fullName, email, phone, password, isSuperAdmin } = req.body;

  if (!fullName || !email || !phone || !password) {
    return ResponseHandler.badRequest(res, 'Vui lòng cung cấp đầy đủ họ tên, email, phone, password');
  }

  const existed = await User.findOne({ $or: [{ email }, { phone }] });
  if (existed) {
    return ResponseHandler.error(res, 'Email hoặc số điện thoại đã tồn tại', 409);
  }

  const admin = new User({
    fullName,
    email,
    phone,
    password,
    role: 'admin',
    isSuperAdmin: Boolean(isSuperAdmin) && req.user.isSuperAdmin,
  });

  await admin.save();

  return ResponseHandler.success(res, 'Tạo tài khoản admin thành công', {
    user: admin.toJSON(),
  });
});

/**
 * Get user by ID
 * @route GET /api/admin/users/:id
 * @access Admin only
 */
const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return ResponseHandler.error(res, 'ID người dùng không hợp lệ', 400);
  }

  const user = await User.findById(id).select('-password').lean();

  if (!user) {
    return ResponseHandler.error(res, 'Không tìm thấy người dùng', 404);
  }

  // Get additional statistics for this user
  const [roomsCount, bookingsCount, reportsCount] = await Promise.all([
    Room.countDocuments({ ownerId: id }),
    Booking.countDocuments({ 
      $or: [{ studentId: id }, { 'roomId.ownerId': id }] 
    }),
    Report.countDocuments({ 
      $or: [{ reporterId: id }, { reportedUserId: id }] 
    })
  ]);

  return ResponseHandler.success(res, 'Lấy thông tin người dùng thành công', {
    user: {
      ...user,
      statistics: {
        roomsPosted: roomsCount,
        bookings: bookingsCount,
        reports: reportsCount
      }
    }
  });
});

/**
 * Update user information
 * @route PUT /api/admin/users/:id
 * @access Admin only
 */
const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { fullName, email, phone, role, isActive } = req.body;

  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return ResponseHandler.error(res, 'ID người dùng không hợp lệ', 400);
  }

  const user = await User.findById(id);

  if (!user) {
    return ResponseHandler.error(res, 'Không tìm thấy người dùng', 404);
  }

  const requestingSuper = Boolean(req.user.isSuperAdmin);

  // Prevent admin from demoting themselves
  if (user._id.toString() === req.user._id.toString() && role && role !== 'admin') {
    return ResponseHandler.error(res, 'Bạn không thể thay đổi quyền của chính mình', 403);
  }

  // Only Super Admin được phép set role = admin hoặc sửa tài khoản admin khác
  const targetIsAdmin = user.role === 'admin';
  const incomingAdmin = role === 'admin';
  if ((targetIsAdmin || incomingAdmin) && !requestingSuper) {
    return ResponseHandler.forbidden(res, 'Chỉ Super Admin mới được tạo/sửa tài khoản admin');
  }

  // Check email uniqueness if email is being updated
  if (email && email !== user.email) {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return ResponseHandler.error(res, 'Email đã được sử dụng', 400);
    }
    user.email = email;
  }

  // Check phone uniqueness if phone is being updated
  if (phone && phone !== user.phone) {
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return ResponseHandler.error(res, 'Số điện thoại đã được sử dụng', 400);
    }
    user.phone = phone;
  }

  // Update fields
  if (fullName) user.fullName = fullName;
  if (role && ['student', 'owner', 'admin'].includes(role)) {
    user.role = role;
  }
  if (typeof isActive === 'boolean') {
    user.isActive = isActive;
  }

  await user.save();

  return ResponseHandler.success(res, 'Cập nhật người dùng thành công', {
    user: user.toJSON()
  });
});

/**
 * Delete user (soft delete or hard delete)
 * @route DELETE /api/admin/users/:id
 * @access Admin only
 */
const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { hardDelete = false } = req.query;

  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return ResponseHandler.error(res, 'ID người dùng không hợp lệ', 400);
  }

  const user = await User.findById(id);

  if (!user) {
    return ResponseHandler.error(res, 'Không tìm thấy người dùng', 404);
  }

  // Prevent admin from deleting themselves
  if (user._id.toString() === req.user._id.toString()) {
    return ResponseHandler.error(res, 'Bạn không thể xóa tài khoản của chính mình', 403);
  }

  // Only Super Admin can delete/disable another admin
  if (user.role === 'admin' && !req.user.isSuperAdmin) {
    return ResponseHandler.forbidden(res, 'Chỉ Super Admin mới được xóa hoặc vô hiệu hóa admin');
  }

  if (hardDelete === 'true') {
    // Hard delete: Remove user and all related data
    // TODO: Implement cascade delete for related data (rooms, bookings, etc.)
    await User.findByIdAndDelete(id);
    return ResponseHandler.success(res, 'Xóa người dùng vĩnh viễn thành công', {
      deleted: true,
      userId: id
    });
  } else {
    // Soft delete: Set isActive to false
    user.isActive = false;
    await user.save();
    return ResponseHandler.success(res, 'Vô hiệu hóa người dùng thành công', {
      user: user.toJSON()
    });
  }
});

// ========================
// HOST MANAGEMENT
// ========================

/**
 * Get all hosts (users with role = 'owner')
 * @route GET /api/admin/hosts
 * @access Admin only
 */
const getAllHosts = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    search,
    sort = '-createdAt',
    status
  } = req.query;

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  // Build query for hosts (role = 'owner')
  const query = { role: 'owner' };

  // Filter by status
  if (status) {
    if (status === 'active') {
      query.isActive = { $ne: false };
    } else if (status === 'inactive') {
      query.isActive = false;
    }
  }

  // Search by name, email, phone
  if (search && search.trim()) {
    const searchRegex = new RegExp(search.trim(), 'i');
    query.$or = [
      { fullName: searchRegex },
      { email: searchRegex },
      { phone: searchRegex }
    ];
  }

  // Execute query
  const [hosts, total] = await Promise.all([
    User.find(query)
      .select('-password')
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .lean(),
    User.countDocuments(query)
  ]);

  // Get room counts for each host
  const hostsWithStats = await Promise.all(
    hosts.map(async (host) => {
      const [totalRooms, activeRooms, pendingRooms] = await Promise.all([
        Room.countDocuments({ ownerId: host._id }),
        Room.countDocuments({ ownerId: host._id, status: 'approved' }),
        Room.countDocuments({ ownerId: host._id, status: 'pending' })
      ]);

      return {
        ...host,
        statistics: {
          totalRooms,
          activeRooms,
          pendingRooms
        }
      };
    })
  );

  return ResponseHandler.success(res, 'Lấy danh sách chủ nhà thành công', {
    hosts: hostsWithStats,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
      hasMore: pageNum * limitNum < total
    }
  });
});

/**
 * Get host by ID with detailed statistics
 * @route GET /api/admin/hosts/:id
 * @access Admin only
 */
const getHostById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return ResponseHandler.error(res, 'ID chủ nhà không hợp lệ', 400);
  }

  const host = await User.findOne({ _id: id, role: 'owner' })
    .select('-password')
    .lean();

  if (!host) {
    return ResponseHandler.error(res, 'Không tìm thấy chủ nhà', 404);
  }

  // Get detailed statistics
  const [
    totalRooms,
    roomsByStatus,
    totalBookings,
    totalRevenue,
    recentRooms
  ] = await Promise.all([
    Room.countDocuments({ ownerId: id }),
    Room.aggregate([
      { $match: { ownerId: mongoose.Types.ObjectId(id) } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]),
    Booking.countDocuments({ 'roomId.ownerId': id }),
    Payment.aggregate([
      { 
        $lookup: {
          from: 'bookings',
          localField: 'bookingId',
          foreignField: '_id',
          as: 'booking'
        }
      },
      { $unwind: '$booking' },
      { 
        $lookup: {
          from: 'rooms',
          localField: 'booking.roomId',
          foreignField: '_id',
          as: 'room'
        }
      },
      { $unwind: '$room' },
      { $match: { 'room.ownerId': mongoose.Types.ObjectId(id), status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]),
    Room.find({ ownerId: id })
      .select('title price area address images status createdAt')
      .sort('-createdAt')
      .limit(5)
      .lean()
  ]);

  // Format room status statistics
  const statusStats = {};
  roomsByStatus.forEach(item => {
    statusStats[item._id] = item.count;
  });

  return ResponseHandler.success(res, 'Lấy thông tin chủ nhà thành công', {
    host: {
      ...host,
      statistics: {
        totalRooms,
        roomsByStatus: {
          pending: statusStats.pending || 0,
          approved: statusStats.approved || 0,
          rejected: statusStats.rejected || 0
        },
        totalBookings,
        totalRevenue: totalRevenue[0]?.total || 0
      },
      recentRooms
    }
  });
});

/**
 * Update host information
 * @route PUT /api/admin/hosts/:id
 * @access Admin only
 */
const updateHost = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { fullName, email, phone, isActive } = req.body;

  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return ResponseHandler.error(res, 'ID chủ nhà không hợp lệ', 400);
  }

  const host = await User.findOne({ _id: id, role: 'owner' });

  if (!host) {
    return ResponseHandler.error(res, 'Không tìm thấy chủ nhà', 404);
  }

  // Check email uniqueness if email is being updated
  if (email && email !== host.email) {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return ResponseHandler.error(res, 'Email đã được sử dụng', 400);
    }
    host.email = email;
  }

  // Check phone uniqueness if phone is being updated
  if (phone && phone !== host.phone) {
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return ResponseHandler.error(res, 'Số điện thoại đã được sử dụng', 400);
    }
    host.phone = phone;
  }

  // Update fields
  if (fullName) host.fullName = fullName;
  if (typeof isActive === 'boolean') {
    host.isActive = isActive;
  }

  await host.save();

  return ResponseHandler.success(res, 'Cập nhật chủ nhà thành công', {
    host: host.toJSON()
  });
});

/**
 * Delete host (soft delete or hard delete)
 * @route DELETE /api/admin/hosts/:id
 * @access Admin only
 */
const deleteHost = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { hardDelete = false } = req.query;

  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return ResponseHandler.error(res, 'ID chủ nhà không hợp lệ', 400);
  }

  const host = await User.findOne({ _id: id, role: 'owner' });

  if (!host) {
    return ResponseHandler.error(res, 'Không tìm thấy chủ nhà', 404);
  }

  if (hardDelete === 'true') {
    // Hard delete: Remove host and all related data
    // TODO: Implement cascade delete for rooms, bookings, etc.
    await User.findByIdAndDelete(id);
    return ResponseHandler.success(res, 'Xóa chủ nhà vĩnh viễn thành công', {
      deleted: true,
      hostId: id
    });
  } else {
    // Soft delete: Set isActive to false
    host.isActive = false;
    await host.save();
    return ResponseHandler.success(res, 'Vô hiệu hóa chủ nhà thành công', {
      host: host.toJSON()
    });
  }
});

// ========================
// ROOM MANAGEMENT
// ========================

/**
 * Get all rooms with admin filters
 * @route GET /api/admin/rooms
 * @access Admin only
 */
const getAllRooms = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    status,
    ownerId,
    search,
    sort = '-createdAt',
    minPrice,
    maxPrice,
    minArea,
    maxArea
  } = req.query;

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  // Build query
  const query = {};

  // Filter by status
  if (status && ['pending', 'approved', 'rejected', 'available'].includes(status)) {
    // Admin xem "Đã duyệt" nên cần hiển thị cả phòng ở trạng thái approved lẫn available
    if (status === 'approved') {
      query.status = { $in: ['approved', 'available'] };
    } else {
      query.status = status;
    }
  }

  // Filter by owner
  if (ownerId && mongoose.Types.ObjectId.isValid(ownerId)) {
    query.ownerId = ownerId;
  }

  // Price range filter
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = parseInt(minPrice, 10);
    if (maxPrice) query.price.$lte = parseInt(maxPrice, 10);
  }

  // Area range filter
  if (minArea || maxArea) {
    query.area = {};
    if (minArea) query.area.$gte = parseInt(minArea, 10);
    if (maxArea) query.area.$lte = parseInt(maxArea, 10);
  }

  // Search by title, description, address
  if (search && search.trim()) {
    const searchRegex = new RegExp(search.trim(), 'i');
    query.$or = [
      { title: searchRegex },
      { description: searchRegex },
      { 'address.street': searchRegex },
      { 'address.ward': searchRegex },
      { 'address.district': searchRegex },
      { 'address.city': searchRegex }
    ];
  }

  // Execute query
  const [rooms, total] = await Promise.all([
    Room.find(query)
      .populate('ownerId', 'fullName email phone avatar')
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Room.countDocuments(query)
  ]);

  return ResponseHandler.success(res, 'Lấy danh sách phòng thành công', {
    rooms,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
      hasMore: pageNum * limitNum < total
    }
  });
});

/**
 * Get room by ID with admin details
 * @route GET /api/admin/rooms/:id
 * @access Admin only
 */
const getRoomById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return ResponseHandler.error(res, 'ID phòng không hợp lệ', 400);
  }

  const room = await Room.findById(id)
    .populate('ownerId', 'fullName email phone avatar')
    .lean();

  if (!room) {
    return ResponseHandler.error(res, 'Không tìm thấy phòng', 404);
  }

  // Get additional statistics
  const [bookingsCount, viewsCount, favoritesCount] = await Promise.all([
    Booking.countDocuments({ roomId: id }),
    require('../models/ViewLog').countDocuments({ roomId: id }),
    require('../models/Favorite').countDocuments({ roomId: id })
  ]);

  return ResponseHandler.success(res, 'Lấy thông tin phòng thành công', {
    room: {
      ...room,
      statistics: {
        bookings: bookingsCount,
        views: viewsCount,
        favorites: favoritesCount
      }
    }
  });
});

/**
 * Approve a room
 * @route PATCH /api/admin/rooms/:id/approve
 * @access Admin only
 */
const approveRoom = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { note } = req.body;

  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return ResponseHandler.error(res, 'ID phòng không hợp lệ', 400);
  }

  const room = await Room.findById(id);

  if (!room) {
    return ResponseHandler.error(res, 'Không tìm thấy phòng', 404);
  }

  if (room.status === 'approved') {
    return ResponseHandler.error(res, 'Phòng đã được duyệt trước đó', 400);
  }

  room.status = 'approved';
  room.approvedBy = req.user._id;
  room.approvedAt = new Date();
  if (note) {
    room.adminNote = note;
  }

  await room.save();
  // Thông báo cho chủ trọ
  try {
    await Notification.create({
      user: room.ownerId,
      sender: req.user._id,
      type: 'room_approved',
      title: 'Tin đăng đã được duyệt',
      message: `Tin "${room.title}" đã được duyệt.`,
      data: {
        roomId: room._id,
        status: 'approved',
        note: note || '',
      },
    });

    const io = req.app.get('io');
    if (io?.sendNotificationToUser) {
      io.sendNotificationToUser(String(room.ownerId), {
        type: 'room_approved',
        title: 'Tin đăng đã được duyệt',
        message: `Tin "${room.title}" đã được duyệt.`,
        data: { roomId: room._id, status: 'approved', note: note || '' },
      });
    }
  } catch (notifyErr) {
    console.error('Notify approve room error:', notifyErr?.message);
  }

  return ResponseHandler.success(res, 'Duyệt phòng thành công', {
    room: await Room.findById(id).populate('ownerId', 'fullName email phone').lean()
  });
});

/**
 * Reject a room
 * @route PATCH /api/admin/rooms/:id/reject
 * @access Admin only
 */
const rejectRoom = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return ResponseHandler.error(res, 'ID phòng không hợp lệ', 400);
  }

  if (!reason || !reason.trim()) {
    return ResponseHandler.error(res, 'Vui lòng nhập lý do từ chối', 400);
  }

  const room = await Room.findById(id);

  if (!room) {
    return ResponseHandler.error(res, 'Không tìm thấy phòng', 404);
  }

  if (room.status === 'rejected') {
    return ResponseHandler.error(res, 'Phòng đã bị từ chối trước đó', 400);
  }

  room.status = 'rejected';
  room.rejectedBy = req.user._id;
  room.rejectedAt = new Date();
  room.adminNote = reason;

  await room.save();

  // Thông báo cho chủ trọ yêu cầu chỉnh sửa / bị từ chối
  try {
    await Notification.create({
      user: room.ownerId,
      sender: req.user._id,
      type: 'room_revision_requested',
      title: 'Tin đăng cần chỉnh sửa',
      message: `Tin "${room.title}" bị từ chối. Lý do: ${reason}`,
      data: {
        roomId: room._id,
        status: 'rejected',
        reason,
        actionRequired: 'update_listing',
      },
    });

    const io = req.app.get('io');
    if (io?.sendNotificationToUser) {
      io.sendNotificationToUser(String(room.ownerId), {
        type: 'room_revision_requested',
        title: 'Tin đăng cần chỉnh sửa',
        message: `Tin "${room.title}" bị từ chối. Lý do: ${reason}`,
        data: { roomId: room._id, status: 'rejected', reason, actionRequired: 'update_listing' },
      });
    }
  } catch (notifyErr) {
    console.error('Notify reject room error:', notifyErr?.message);
  }

  return ResponseHandler.success(res, 'Từ chối phòng thành công', {
    room: await Room.findById(id).populate('ownerId', 'fullName email phone').lean()
  });
});

/**
 * Delete room (hard delete)
 * @route DELETE /api/admin/rooms/:id
 * @access Admin only
 */
const deleteRoom = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return ResponseHandler.error(res, 'ID phòng không hợp lệ', 400);
  }

  const room = await Room.findById(id);

  if (!room) {
    return ResponseHandler.error(res, 'Không tìm thấy phòng', 404);
  }

  // Check if room has active bookings
  const activeBookings = await Booking.countDocuments({
    roomId: id,
    status: { $in: ['pending', 'confirmed'] }
  });

  if (activeBookings > 0) {
    return ResponseHandler.error(
      res,
      'Không thể xóa phòng có booking đang hoạt động',
      400
    );
  }

  // Delete room
  await Room.findByIdAndDelete(id);

  // TODO: Clean up related data (favorites, view logs, etc.)
  // await Favorite.deleteMany({ roomId: id });
  // await ViewLog.deleteMany({ roomId: id });

  return ResponseHandler.success(res, 'Xóa phòng thành công', {
    deleted: true,
    roomId: id
  });
});

// ========================
// DASHBOARD SUMMARY
// ========================

/**
 * Get admin dashboard summary statistics
 * @route GET /api/admin/summary
 * @access Admin only
 */
const getSummary = asyncHandler(async (req, res) => {
  const { period = '30' } = req.query; // days to look back
  const daysBack = parseInt(period, 10) || 30;
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysBack);

  // Parallel queries for all statistics
  const [
    // User statistics
    totalUsers,
    newUsers,
    usersByRole,
    
    // Host statistics
    totalHosts,
    activeHosts,
    
    // Room statistics
    totalRooms,
    pendingRooms,
    approvedRooms,
    rejectedRooms,
    newRooms,
    
    // Booking statistics
    totalBookings,
    pendingBookings,
    confirmedBookings,
    completedBookings,
    
    // Payment statistics
    totalPayments,
    totalRevenue,
    revenueThisPeriod,
    
    // Report statistics
    totalReports,
    pendingReports,
  ] = await Promise.all([
    // Users
    User.countDocuments(),
    User.countDocuments({ createdAt: { $gte: startDate } }),
    User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]),
    
    // Hosts
    User.countDocuments({ role: 'owner' }),
    User.countDocuments({ role: 'owner', isActive: { $ne: false } }),
    
    // Rooms
    Room.countDocuments(),
    Room.countDocuments({ status: 'pending' }),
    Room.countDocuments({ status: 'approved' }),
    Room.countDocuments({ status: 'rejected' }),
    Room.countDocuments({ createdAt: { $gte: startDate } }),
    
    // Bookings
    Booking.countDocuments(),
    Booking.countDocuments({ status: 'pending' }),
    Booking.countDocuments({ status: 'confirmed' }),
    Booking.countDocuments({ status: 'completed' }),
    
    // Payments
    Payment.countDocuments(),
    Payment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]),
    Payment.aggregate([
      { $match: { status: 'completed', createdAt: { $gte: startDate } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]),
    
    // Reports
    Report.countDocuments(),
    Report.countDocuments({ status: 'pending' }),
  ]);

  // Format user role statistics
  const roleStats = {};
  usersByRole.forEach(item => {
    roleStats[item._id] = item.count;
  });

  return ResponseHandler.success(res, 'Lấy thống kê tổng quan thành công', {
    summary: {
      users: {
        total: totalUsers,
        new: newUsers,
        byRole: {
          students: roleStats.student || 0,
          owners: roleStats.owner || 0,
          admins: roleStats.admin || 0
        }
      },
      hosts: {
        total: totalHosts,
        active: activeHosts
      },
      rooms: {
        total: totalRooms,
        pending: pendingRooms,
        approved: approvedRooms,
        rejected: rejectedRooms,
        new: newRooms
      },
      bookings: {
        total: totalBookings,
        pending: pendingBookings,
        confirmed: confirmedBookings,
        completed: completedBookings
      },
      payments: {
        total: totalPayments,
        totalRevenue: totalRevenue[0]?.total || 0,
        revenueThisPeriod: revenueThisPeriod[0]?.total || 0
      },
      reports: {
        total: totalReports,
        pending: pendingReports
      },
      period: {
        days: daysBack,
        startDate
      }
    }
  });
});

// ========================
// ADMIN PROFILE
// ========================

/**
 * Get admin profile
 * @route GET /api/admin/profile
 * @access Admin only
 */
const getMyProfile = asyncHandler(async (req, res) => {
  const admin = await User.findById(req.user._id).select('-password').lean();

  if (!admin) {
    return ResponseHandler.error(res, 'Không tìm thấy admin', 404);
  }

  // Get admin activity statistics
  const [roomsApproved, roomsRejected] = await Promise.all([
    Room.countDocuments({ approvedBy: req.user._id }),
    Room.countDocuments({ rejectedBy: req.user._id })
  ]);

  return ResponseHandler.success(res, 'Lấy thông tin admin thành công', {
    admin: {
      ...admin,
      statistics: {
        roomsApproved,
        roomsRejected,
        totalActions: roomsApproved + roomsRejected
      }
    }
  });
});

/**
 * Update admin profile
 * @route PUT /api/admin/profile
 * @access Admin only
 */
const updateMyProfile = asyncHandler(async (req, res) => {
  const { fullName, email, phone, currentPassword, newPassword } = req.body;

  const admin = await User.findById(req.user._id);

  if (!admin) {
    return ResponseHandler.error(res, 'Không tìm thấy admin', 404);
  }

  // Update basic info
  if (fullName) admin.fullName = fullName;

  // Check email uniqueness if email is being updated
  if (email && email !== admin.email) {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return ResponseHandler.error(res, 'Email đã được sử dụng', 400);
    }
    admin.email = email;
  }

  // Check phone uniqueness if phone is being updated
  if (phone && phone !== admin.phone) {
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return ResponseHandler.error(res, 'Số điện thoại đã được sử dụng', 400);
    }
    admin.phone = phone;
  }

  // Update password if provided
  if (currentPassword && newPassword) {
    const isMatch = await admin.comparePassword(currentPassword);
    if (!isMatch) {
      return ResponseHandler.error(res, 'Mật khẩu hiện tại không chính xác', 400);
    }

    if (newPassword.length < 6) {
      return ResponseHandler.error(res, 'Mật khẩu mới phải có ít nhất 6 ký tự', 400);
    }

    admin.password = newPassword;
  }

  await admin.save();

  return ResponseHandler.success(res, 'Cập nhật profile admin thành công', {
    admin: admin.toJSON()
  });
});

// ========================
// EXPORTS
// ========================

module.exports = {
  // User Management
  getAllUsers,
  getUserById,
  updateUser,
  createAdminUser,
  deleteUser,
  
  // Host Management
  getAllHosts,
  getHostById,
  updateHost,
  deleteHost,
  
  // Room Management
  getAllRooms,
  getRoomById,
  approveRoom,
  rejectRoom,
  deleteRoom,
  
  // Dashboard
  getSummary,
  
  // Admin Profile
  getMyProfile,
  updateMyProfile,
};
