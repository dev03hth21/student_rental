const asyncHandler = require('../utils/asyncHandler');
const ResponseHandler = require('../utils/responseHandler');
const User = require('../models/User');
const Room = require('../models/Room');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Transaction = require('../models/Transaction');
const Report = require('../models/Report');
const CallLog = require('../models/CallLog');
const ViewLog = require('../models/ViewLog');

/**
 * Get comprehensive admin dashboard statistics
 * @route GET /api/admin/dashboard
 * @access Admin only
 */
const getAdminDashboard = asyncHandler(async (req, res) => {
  const { period = '30' } = req.query; // days to look back
  const daysBack = parseInt(period, 10) || 30;
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysBack);
  
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  // Parallel queries for efficiency
  const [
    // User statistics
    totalUsers,
    newUsers,
    activeUsers,
    usersByRole,
    usersToday,
    
    // Room statistics
    totalRooms,
    newRooms,
    roomsByStatus,
    roomsToday,
    pendingApprovalRooms,
    
    // Booking statistics
    totalBookings,
    newBookings,
    bookingsByStatus,
    bookingsToday,
    activeBookings,
    
    // Payment statistics
    totalPayments,
    successfulPayments,
    totalRevenue,
    revenueThisPeriod,
    revenueToday,
    
    // Transaction statistics
    totalTransactions,
    transactionsThisPeriod,
    
    // Report statistics
    totalReports,
    pendingReports,
    reportsToday,
    
    // Activity statistics
    totalCallLogs,
    callLogsToday,
    totalViewLogs,
    viewLogsToday,
  ] = await Promise.all([
    // Users
    User.countDocuments(),
    User.countDocuments({ createdAt: { $gte: startDate } }),
    User.countDocuments({ updatedAt: { $gte: startDate } }),
    User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]),
    User.countDocuments({ 
      createdAt: { $gte: todayStart, $lte: todayEnd } 
    }),
    
    // Rooms
    Room.countDocuments(),
    Room.countDocuments({ createdAt: { $gte: startDate } }),
    Room.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]),
    Room.countDocuments({ 
      createdAt: { $gte: todayStart, $lte: todayEnd } 
    }),
    Room.countDocuments({ status: 'pending' }),
    
    // Bookings
    Booking.countDocuments(),
    Booking.countDocuments({ createdAt: { $gte: startDate } }),
    Booking.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]),
    Booking.countDocuments({ 
      createdAt: { $gte: todayStart, $lte: todayEnd } 
    }),
    Booking.countDocuments({ status: 'active' }),
    
    // Payments
    Payment.countDocuments(),
    Payment.countDocuments({ status: 'success' }),
    Payment.aggregate([
      { $match: { status: 'success' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]),
    Payment.aggregate([
      { 
        $match: { 
          status: 'success',
          paidAt: { $gte: startDate }
        } 
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]),
    Payment.aggregate([
      { 
        $match: { 
          status: 'success',
          paidAt: { $gte: todayStart, $lte: todayEnd }
        } 
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]),
    
    // Transactions
    Transaction.countDocuments(),
    Transaction.countDocuments({ createdAt: { $gte: startDate } }),
    
    // Reports
    Report.countDocuments(),
    Report.countDocuments({ status: 'pending' }),
    Report.countDocuments({ 
      createdAt: { $gte: todayStart, $lte: todayEnd } 
    }),
    
    // Activity
    CallLog.countDocuments(),
    CallLog.countDocuments({ 
      createdAt: { $gte: todayStart, $lte: todayEnd } 
    }),
    ViewLog.countDocuments(),
    ViewLog.countDocuments({ 
      viewedAt: { $gte: todayStart, $lte: todayEnd } 
    }),
  ]);

  // Process user roles
  const roleBreakdown = usersByRole.reduce((acc, item) => {
    acc[item._id] = item.count;
    return acc;
  }, {});

  // Process room status
  const roomStatusBreakdown = roomsByStatus.reduce((acc, item) => {
    acc[item._id] = item.count;
    return acc;
  }, {});

  // Process booking status
  const bookingStatusBreakdown = bookingsByStatus.reduce((acc, item) => {
    acc[item._id] = item.count;
    return acc;
  }, {});

  // Get revenue data
  const totalRevenueAmount = totalRevenue[0]?.total || 0;
  const periodRevenueAmount = revenueThisPeriod[0]?.total || 0;
  const todayRevenueAmount = revenueToday[0]?.total || 0;

  // Get top performing rooms
  const topRooms = await Room.find({ status: { $in: ['available', 'rented'] } })
    .select('title callCount price status images location')
    .sort({ callCount: -1 })
    .limit(10)
    .lean();

  // Get recent activities
  const recentUsers = await User.find()
    .select('fullName email role createdAt')
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();

  const recentBookings = await Booking.find()
    .select('status checkInDate monthlyRent createdAt')
    .populate('student', 'fullName email')
    .populate('room', 'title')
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();

  // Calculate growth rates
  const previousPeriodStart = new Date(startDate);
  previousPeriodStart.setDate(previousPeriodStart.getDate() - daysBack);
  
  const [previousUsers, previousRooms, previousBookings, previousRevenue] = await Promise.all([
    User.countDocuments({ 
      createdAt: { $gte: previousPeriodStart, $lt: startDate } 
    }),
    Room.countDocuments({ 
      createdAt: { $gte: previousPeriodStart, $lt: startDate } 
    }),
    Booking.countDocuments({ 
      createdAt: { $gte: previousPeriodStart, $lt: startDate } 
    }),
    Payment.aggregate([
      { 
        $match: { 
          status: 'success',
          paidAt: { $gte: previousPeriodStart, $lt: startDate }
        } 
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]),
  ]);

  const previousRevenueAmount = previousRevenue[0]?.total || 0;

  const calculateGrowth = (current, previous) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  const growthRates = {
    users: calculateGrowth(newUsers, previousUsers),
    rooms: calculateGrowth(newRooms, previousRooms),
    bookings: calculateGrowth(newBookings, previousBookings),
    revenue: calculateGrowth(periodRevenueAmount, previousRevenueAmount),
  };

  // Platform health indicators
  const platformHealth = {
    approvalRate: totalRooms > 0 
      ? Math.round(((roomStatusBreakdown.approved || 0) / totalRooms) * 100) 
      : 0,
    bookingConversionRate: totalRooms > 0 
      ? Math.round((totalBookings / totalRooms) * 100) 
      : 0,
    paymentSuccessRate: totalPayments > 0 
      ? Math.round((successfulPayments / totalPayments) * 100) 
      : 0,
    avgCallsPerRoom: totalRooms > 0 
      ? Math.round(totalCallLogs / totalRooms) 
      : 0,
    avgViewsPerRoom: totalRooms > 0 
      ? Math.round(totalViewLogs / totalRooms) 
      : 0,
  };

  return ResponseHandler.success(res, 'Admin dashboard data retrieved successfully', {
    period: daysBack,
    summary: {
      totalUsers,
      newUsers,
      activeUsers,
      usersToday,
      totalRooms,
      newRooms,
      roomsToday,
      pendingApprovalRooms,
      totalBookings,
      newBookings,
      bookingsToday,
      activeBookings,
      totalRevenue: totalRevenueAmount,
      periodRevenue: periodRevenueAmount,
      todayRevenue: todayRevenueAmount,
      totalReports,
      pendingReports,
      reportsToday,
      totalCallLogs,
      callLogsToday,
      totalViewLogs,
      viewLogsToday,
    },
    breakdowns: {
      usersByRole: roleBreakdown,
      roomsByStatus: roomStatusBreakdown,
      bookingsByStatus: bookingStatusBreakdown,
    },
    growthRates,
    platformHealth,
    topRooms,
    recentActivity: {
      users: recentUsers,
      bookings: recentBookings,
    },
  });
});

/**
 * Get revenue analytics
 * @route GET /api/admin/dashboard/revenue
 * @access Admin only
 */
const getRevenueAnalytics = asyncHandler(async (req, res) => {
  const { period = '30', groupBy = 'day' } = req.query;
  const daysBack = parseInt(period, 10) || 30;
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysBack);

  // Determine grouping format
  let dateFormat;
  switch (groupBy) {
    case 'month':
      dateFormat = { $dateToString: { format: '%Y-%m', date: '$paidAt' } };
      break;
    case 'week':
      dateFormat = { $dateToString: { format: '%Y-W%V', date: '$paidAt' } };
      break;
    default: // day
      dateFormat = { $dateToString: { format: '%Y-%m-%d', date: '$paidAt' } };
  }

  const revenueByPeriod = await Payment.aggregate([
    { 
      $match: { 
        status: 'success',
        paidAt: { $gte: startDate }
      } 
    },
    {
      $group: {
        _id: dateFormat,
        revenue: { $sum: '$amount' },
        count: { $sum: 1 },
      }
    },
    { $sort: { _id: 1 } }
  ]);

  const revenueByType = await Payment.aggregate([
    { 
      $match: { 
        status: 'success',
        paidAt: { $gte: startDate }
      } 
    },
    {
      $group: {
        _id: '$type',
        revenue: { $sum: '$amount' },
        count: { $sum: 1 },
      }
    }
  ]);

  const revenueByMethod = await Payment.aggregate([
    { 
      $match: { 
        status: 'success',
        paidAt: { $gte: startDate }
      } 
    },
    {
      $group: {
        _id: '$method',
        revenue: { $sum: '$amount' },
        count: { $sum: 1 },
      }
    }
  ]);

  return ResponseHandler.success(res, 'Revenue analytics retrieved successfully', {
    period: daysBack,
    groupBy,
    timeline: revenueByPeriod,
    byType: revenueByType,
    byMethod: revenueByMethod,
  });
});

/**
 * Get user analytics
 * @route GET /api/admin/dashboard/users
 * @access Admin only
 */
const getUserAnalytics = asyncHandler(async (req, res) => {
  const { period = '30' } = req.query;
  const daysBack = parseInt(period, 10) || 30;
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysBack);

  const userGrowth = await User.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 },
      }
    },
    { $sort: { _id: 1 } }
  ]);

  const usersByRole = await User.aggregate([
    {
      $group: {
        _id: '$role',
        count: { $sum: 1 },
        avgBalance: { $avg: '$balance' },
      }
    }
  ]);

  const topUsersByBalance = await User.find()
    .select('fullName email role balance createdAt')
    .sort({ balance: -1 })
    .limit(10)
    .lean();

  return ResponseHandler.success(res, 'User analytics retrieved successfully', {
    period: daysBack,
    growth: userGrowth,
    byRole: usersByRole,
    topUsers: topUsersByBalance,
  });
});

/**
 * Get system alerts and notifications for admin
 * @route GET /api/admin/dashboard/alerts
 * @access Admin only
 */
const getSystemAlerts = asyncHandler(async (req, res) => {
  const alerts = [];

  // Check for pending approvals
  const pendingRooms = await Room.countDocuments({ status: 'pending' });
  if (pendingRooms > 0) {
    alerts.push({
      type: 'warning',
      priority: 'high',
      title: 'Pending Room Approvals',
      message: `${pendingRooms} room(s) waiting for approval`,
      count: pendingRooms,
      action: '/admin/rooms?status=pending',
    });
  }

  // Check for pending reports
  const pendingReports = await Report.countDocuments({ status: 'pending' });
  if (pendingReports > 0) {
    alerts.push({
      type: 'warning',
      priority: 'high',
      title: 'Unresolved Reports',
      message: `${pendingReports} report(s) need attention`,
      count: pendingReports,
      action: '/admin/reports?status=pending',
    });
  }

  // Check for failed payments
  const failedPayments = await Payment.countDocuments({ 
    status: 'failed',
    createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
  });
  if (failedPayments > 0) {
    alerts.push({
      type: 'error',
      priority: 'medium',
      title: 'Failed Payments',
      message: `${failedPayments} payment(s) failed in the last 24 hours`,
      count: failedPayments,
      action: '/admin/payments?status=failed',
    });
  }

  // Check for inactive rooms
  const oldPendingRooms = await Room.countDocuments({
    status: 'pending',
    createdAt: { $lt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) }
  });
  if (oldPendingRooms > 0) {
    alerts.push({
      type: 'info',
      priority: 'medium',
      title: 'Delayed Approvals',
      message: `${oldPendingRooms} room(s) pending approval for over 3 days`,
      count: oldPendingRooms,
      action: '/admin/rooms?status=pending',
    });
  }

  return ResponseHandler.success(res, 'System alerts retrieved successfully', {
    alerts,
    count: alerts.length,
  });
});

module.exports = {
  getAdminDashboard,
  getRevenueAnalytics,
  getUserAnalytics,
  getSystemAlerts,
};
