const asyncHandler = require('../utils/asyncHandler');
const ResponseHandler = require('../utils/responseHandler');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Favorite = require('../models/Favorite');
const CallLog = require('../models/CallLog');
const ViewLog = require('../models/ViewLog');

/**
 * Get student dashboard statistics
 * @route GET /api/student/dashboard
 * @access Student only
 */
const getStudentDashboard = asyncHandler(async (req, res) => {
  const studentId = req.user._id;
  
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Parallel queries for efficiency
  const [
    // Booking statistics
    totalBookings,
    activeBookings,
    pendingBookings,
    completedBookings,
    bookingsByStatus,
    recentBookings,
    
    // Payment statistics
    totalPayments,
    totalAmountPaid,
    recentPayments,
    
    // Activity statistics
    totalFavorites,
    totalCallsMade,
    totalViewsMade,
    recentFavorites,
  ] = await Promise.all([
    // Bookings
    Booking.countDocuments({ student: studentId }),
    Booking.countDocuments({ student: studentId, status: 'active' }),
    Booking.countDocuments({ student: studentId, status: 'pending' }),
    Booking.countDocuments({ student: studentId, status: 'completed' }),
    Booking.aggregate([
      { $match: { student: studentId } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]),
    Booking.find({ student: studentId })
      .populate('room', 'title images price location')
      .populate('owner', 'fullName phone')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
    
    // Payments
    Payment.countDocuments({ user: studentId }),
    Payment.aggregate([
      { $match: { user: studentId, status: 'success' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]),
    Payment.find({ user: studentId })
      .populate('booking')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
    
    // Activity
    Favorite.countDocuments({ userId: studentId }),
    CallLog.countDocuments({ studentId }),
    ViewLog.countDocuments({ userId: studentId }),
    Favorite.find({ userId: studentId })
      .populate('roomId', 'title images price location status')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean(),
  ]);

  // Process booking status breakdown
  const bookingStatusBreakdown = bookingsByStatus.reduce((acc, item) => {
    acc[item._id] = item.count;
    return acc;
  }, {});

  // Calculate total amount paid
  const totalPaid = totalAmountPaid[0]?.total || 0;

  // Get upcoming check-in dates
  const upcomingCheckIns = await Booking.find({
    student: studentId,
    status: { $in: ['confirmed', 'paid'] },
    checkInDate: { $gte: new Date() }
  })
    .populate('room', 'title images location')
    .sort({ checkInDate: 1 })
    .limit(3)
    .lean();

  // Calculate savings and insights
  const avgRoomPrice = recentBookings.length > 0
    ? recentBookings.reduce((sum, b) => sum + (b.monthlyRent || 0), 0) / recentBookings.length
    : 0;

  // Activity summary
  const activitySummary = {
    totalCallsMade,
    totalViewsMade,
    totalFavorites,
    engagementRate: totalViewsMade > 0 
      ? Math.round((totalCallsMade / totalViewsMade) * 100) 
      : 0,
  };

  // Recommendations for student
  const recommendations = [];

  if (totalBookings === 0 && totalCallsMade === 0) {
    recommendations.push({
      type: 'info',
      title: 'Bắt đầu tìm phòng trọ',
      message: 'Khám phá các phòng trọ phù hợp với nhu cầu của bạn',
      action: '/rooms/search',
    });
  }

  if (totalFavorites > 5 && totalCallsMade === 0) {
    recommendations.push({
      type: 'tip',
      title: 'Liên hệ phòng yêu thích',
      message: `Bạn đã lưu ${totalFavorites} phòng. Hãy liên hệ chủ nhà để đặt lịch xem phòng`,
      action: '/favorites',
    });
  }

  if (pendingBookings > 0) {
    recommendations.push({
      type: 'warning',
      title: 'Đơn đặt phòng đang chờ',
      message: `Bạn có ${pendingBookings} đơn đặt phòng chưa thanh toán`,
      action: '/bookings',
    });
  }

  if (activeBookings > 0) {
    const activeBooking = await Booking.findOne({ 
      student: studentId, 
      status: 'active' 
    }).populate('room', 'title');
    
    if (activeBooking) {
      recommendations.push({
        type: 'success',
        title: 'Hợp đồng đang hoạt động',
        message: `Bạn đang thuê phòng: ${activeBooking.room?.title || 'N/A'}`,
        action: `/bookings/${activeBooking._id}`,
      });
    }
  }

  return ResponseHandler.success(res, 'Student dashboard data retrieved successfully', {
    summary: {
      totalBookings,
      activeBookings,
      pendingBookings,
      completedBookings,
      totalPayments,
      totalPaid,
      totalFavorites,
      totalCallsMade,
      totalViewsMade,
    },
    bookingsByStatus: bookingStatusBreakdown,
    activitySummary,
    recentBookings: recentBookings.map(b => ({
      id: b._id,
      room: b.room,
      owner: b.owner,
      status: b.status,
      checkInDate: b.checkInDate,
      monthlyRent: b.monthlyRent,
      createdAt: b.createdAt,
    })),
    upcomingCheckIns,
    recentPayments: recentPayments.map(p => ({
      id: p._id,
      amount: p.amount,
      type: p.type,
      status: p.status,
      method: p.method,
      createdAt: p.createdAt,
    })),
    favorites: recentFavorites.map(f => ({
      id: f._id,
      room: f.roomId,
      createdAt: f.createdAt,
    })),
    recommendations,
    insights: {
      avgRoomPrice: Math.round(avgRoomPrice),
      engagementRate: activitySummary.engagementRate,
    },
  });
});

module.exports = {
  getStudentDashboard,
};
