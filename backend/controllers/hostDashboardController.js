const asyncHandler = require('../utils/asyncHandler');
const ResponseHandler = require('../utils/responseHandler');
const Room = require('../models/Room');
const CallLog = require('../models/CallLog');
const ViewLog = require('../models/ViewLog');

const MIN_IMAGE_COUNT = 3;
const MIN_DESCRIPTION_LENGTH = 180;
const LOW_CONVERSION_VIEW_THRESHOLD = 20;
const STALE_VIEW_DAYS = 14;

const getStartEndOfToday = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

const getViewStatsByRoom = async (roomIds) => {
  if (!roomIds.length) {
    return {};
  }

  const recentBoundary = new Date();
  recentBoundary.setDate(recentBoundary.getDate() - 30);

  const viewStats = await ViewLog.aggregate([
    { $match: { roomId: { $in: roomIds } } },
    {
      $group: {
        _id: '$roomId',
        totalViews: { $sum: 1 },
        recentViews: {
          $sum: {
            $cond: [{ $gte: ['$viewedAt', recentBoundary] }, 1, 0],
          },
        },
        lastView: { $max: '$viewedAt' },
      },
    },
  ]);

  return viewStats.reduce((acc, stat) => {
    acc[stat._id.toString()] = {
      totalViews: stat.totalViews || 0,
      recentViews: stat.recentViews || 0,
      lastView: stat.lastView || null,
    };
    return acc;
  }, {});
};

const formatRoomTitle = (room) => room.title || 'Tin đăng';

const getEmptyRecommendations = () => ({
  important: [
    {
      id: 'important-no-rooms',
      title: 'Bạn chưa có tin nào',
      description: 'Tạo tin đăng đầu tiên để nhận gợi ý tối ưu hóa từ trợ lý.',
    },
  ],
  info: [
    {
      id: 'info-no-data',
      title: 'Chưa có dữ liệu thống kê',
      description: 'Khi có lượt xem và cuộc gọi, hệ thống sẽ hiển thị phân tích tại đây.',
    },
  ],
  tips: [
    {
      id: 'tip-create-room',
      title: 'Thêm đầy đủ hình ảnh và tiện ích',
      description: 'Tin đăng rõ ràng với tối thiểu 3 ảnh sáng giúp được duyệt nhanh hơn.',
    },
  ],
});

const attachFallback = (important, info, tips) => ({
  important: important.length
    ? important
    : [
        {
          id: 'important-all-good',
          title: 'Tất cả tin đăng đang ổn định',
          description: 'Không có cảnh báo chất lượng nào ở thời điểm hiện tại.',
        },
      ],
  info: info.length
    ? info
    : [
        {
          id: 'info-all-good',
          title: 'Tin đăng đã được cập nhật đầy đủ',
          description: 'Chúng tôi sẽ thông báo khi có thay đổi đáng chú ý.',
        },
      ],
  tips: tips.length
    ? tips
    : [
        {
          id: 'tip-keep-up',
          title: 'Duy trì phản hồi nhanh',
          description: 'Giữ thời gian phản hồi dưới 5 phút giúp tăng tỉ lệ đặt chỗ.',
        },
      ],
});

const generateRecommendations = async (rooms, presetViewStats) => {
  if (!rooms.length) {
    return getEmptyRecommendations();
  }

  const roomIds = rooms.map((room) => room._id);
  const viewStatsMap = presetViewStats || (await getViewStatsByRoom(roomIds));
  const important = [];
  const info = [];
  const tips = [];

  const staleBoundary = new Date();
  staleBoundary.setDate(staleBoundary.getDate() - STALE_VIEW_DAYS);

  rooms
    .filter((room) => (room.images || []).length < MIN_IMAGE_COUNT)
    .slice(0, 3)
    .forEach((room) => {
      const imageCount = (room.images || []).length;
      important.push({
        id: `img-${room._id}`,
        title: `${formatRoomTitle(room)} thiếu ảnh`,
        description: `Tin chỉ có ${imageCount} ảnh. Bổ sung tối thiểu ${MIN_IMAGE_COUNT} ảnh sáng để dễ được duyệt.`,
      });
    });

  rooms
    .filter((room) => (room.description || '').trim().length < MIN_DESCRIPTION_LENGTH)
    .slice(0, 3)
    .forEach((room) => {
      const descLength = (room.description || '').trim().length;
      important.push({
        id: `desc-${room._id}`,
        title: `${formatRoomTitle(room)} cần mô tả chi tiết`,
        description: `Mô tả hiện ${descLength} ký tự. Hãy bổ sung tiện ích và chi phí để đạt ${MIN_DESCRIPTION_LENGTH}+ ký tự.`,
      });
    });

  rooms
    .filter((room) => {
      const stats = viewStatsMap[room._id.toString()];
      return stats && stats.recentViews >= LOW_CONVERSION_VIEW_THRESHOLD && (room.callCount || 0) <= 1;
    })
    .slice(0, 2)
    .forEach((room) => {
      const stats = viewStatsMap[room._id.toString()];
      important.push({
        id: `conversion-${room._id}`,
        title: `${formatRoomTitle(room)} cần cải thiện chuyển đổi`,
        description: `Có ${stats.recentViews} lượt xem 30 ngày nhưng chỉ ${room.callCount || 0} cuộc gọi. Thêm ưu đãi hoặc cập nhật giá để thu hút khách.`,
      });
    });

  const pendingCount = rooms.filter((room) => room.status === 'pending').length;
  if (pendingCount) {
    info.push({
      id: 'info-pending',
      title: `${pendingCount} tin đang chờ duyệt`,
      description: 'Kiểm tra lại mô tả và ảnh để được xét duyệt nhanh hơn.',
    });
  }

  const rejectedCount = rooms.filter((room) => room.status === 'rejected').length;
  if (rejectedCount) {
    info.push({
      id: 'info-rejected',
      title: `${rejectedCount} tin bị từ chối gần đây`,
      description: 'Xem lý do từ chối trong quản lý tin và cập nhật lại nội dung.',
    });
  }

  const staleRooms = rooms.filter((room) => {
    const stats = viewStatsMap[room._id.toString()];
    const lastView = stats?.lastView;
    return room.status === 'available' && (!lastView || lastView < staleBoundary);
  });
  if (staleRooms.length) {
    const sample = staleRooms
      .slice(0, 2)
      .map((room) => formatRoomTitle(room))
      .join(', ');
    info.push({
      id: 'info-stale',
      title: `${staleRooms.length} tin chưa có lượt xem mới`,
      description: `${sample} chưa có lượt xem trong ${STALE_VIEW_DAYS} ngày. Cân nhắc cập nhật hình ảnh hoặc đẩy tin.`,
    });
  }

  const availableRooms = rooms.filter((room) => room.status === 'available');
  if (availableRooms.length >= 2) {
    const avgPrice =
      availableRooms.reduce((sum, room) => sum + (room.price || 0), 0) / availableRooms.length || 0;
    if (avgPrice) {
      const priceOutliers = availableRooms.filter(
        (room) => Math.abs(room.price - avgPrice) / avgPrice >= 0.2
      );
      if (priceOutliers.length) {
        const sample = priceOutliers[0];
        const diffPercent = Math.round((Math.abs(sample.price - avgPrice) / avgPrice) * 100);
        tips.push({
          id: 'tip-price-benchmark',
          title: `${formatRoomTitle(sample)} lệch giá khu vực`,
          description: `Giá đang lệch ${diffPercent}% so với trung bình ${avgPrice.toLocaleString(
            'vi-VN'
          )}đ. Điều chỉnh nhẹ giúp tăng tỷ lệ liên hệ.`,
        });
      }
    }
  }

  const topViewedRooms = rooms
    .map((room) => ({
      room,
      recentViews: viewStatsMap[room._id.toString()]?.recentViews || 0,
    }))
    .filter((entry) => entry.recentViews > 0)
    .sort((a, b) => b.recentViews - a.recentViews)
    .slice(0, 2);

  if (topViewedRooms.length) {
    const top = topViewedRooms[0];
    tips.push({
      id: 'tip-highlight',
      title: `${formatRoomTitle(top.room)} đang được quan tâm`,
      description: `Có ${top.recentViews} lượt xem 30 ngày. Hãy ghim tin hoặc thêm ưu đãi để chuyển đổi thành cuộc gọi.`,
    });
  }

  const quietRooms = rooms.filter(
    (room) => room.status === 'available' && (viewStatsMap[room._id.toString()]?.recentViews || 0) === 0
  );
  if (quietRooms.length) {
    tips.push({
      id: 'tip-quiet',
      title: `${quietRooms.length} tin cần được đẩy`,
      description: 'Bật gói đẩy tin hoặc chia sẻ lên mạng xã hội để có lượt xem đầu tiên.',
    });
  }

  return attachFallback(important, info, tips);
};

const getHostDashboard = asyncHandler(async (req, res) => {
  const ownerId = req.user._id;
  const roomFilter = { ownerId };
  const { start, end } = getStartEndOfToday();

  const [rooms, totalCalls, callsToday, totalViews, viewsToday, bookings, payments] = await Promise.all([
    Room.find(roomFilter)
      .select('title status images description callCount price createdAt updatedAt')
      .lean(),
    CallLog.countDocuments({ hostId: ownerId }),
    CallLog.countDocuments({ hostId: ownerId, createdAt: { $gte: start, $lte: end } }),
    ViewLog.countDocuments({ roomId: { $in: await Room.find(roomFilter).distinct('_id') } }),
    ViewLog.countDocuments({ 
      roomId: { $in: await Room.find(roomFilter).distinct('_id') },
      viewedAt: { $gte: start, $lte: end }
    }),
    require('../models/Booking').find({ owner: ownerId }).lean(),
    require('../models/Payment').find({ 
      booking: { $in: (await require('../models/Booking').find({ owner: ownerId }).distinct('_id')) }
    }).lean(),
  ]);

  const statusCounts = rooms.reduce((acc, room) => {
    acc[room.status] = (acc[room.status] || 0) + 1;
    return acc;
  }, {});

  const totalRooms = rooms.length;
  const pendingRooms = statusCounts.pending || 0;
  const approvedRooms = statusCounts.approved || 0;
  const rejectedRooms = statusCounts.rejected || 0;
  const availableRooms = statusCounts.available || 0;
  const rentedRooms = statusCounts.rented || 0;

  // Calculate revenue statistics
  const totalRevenue = payments
    .filter(p => p.status === 'success')
    .reduce((sum, p) => sum + (p.amount || 0), 0);
  
  const monthlyRevenue = payments
    .filter(p => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return p.status === 'success' && p.paidAt && p.paidAt >= thirtyDaysAgo;
    })
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  // Booking statistics
  const activeBookings = bookings.filter(b => b.status === 'active').length;
  const totalBookings = bookings.length;
  const bookingSuccessRate = totalCalls > 0 
    ? Math.round((totalBookings / totalCalls) * 100) 
    : 0;

  // Performance metrics
  const avgCallsPerRoom = totalRooms > 0 ? Math.round(totalCalls / totalRooms) : 0;
  const avgViewsPerRoom = totalRooms > 0 ? Math.round(totalViews / totalRooms) : 0;
  const viewToCallRate = totalViews > 0 
    ? Math.round((totalCalls / totalViews) * 100) 
    : 0;

  const topRooms = rooms
    .slice()
    .sort((a, b) => (b.callCount || 0) - (a.callCount || 0))
    .slice(0, 5)
    .map((room) => ({
      roomId: room._id,
      title: room.title,
      callCount: room.callCount || 0,
      status: room.status,
      price: room.price,
    }));

  const recommendations = await generateRecommendations(rooms);

  return ResponseHandler.success(res, 'Lấy thống kê dashboard host thành công', {
    totalRooms,
    pendingRooms,
    approvedRooms,
    rejectedRooms,
    availableRooms,
    rentedRooms,
    totalCalls,
    callsToday,
    totalViews,
    viewsToday,
    totalRevenue,
    monthlyRevenue,
    activeBookings,
    totalBookings,
    performance: {
      avgCallsPerRoom,
      avgViewsPerRoom,
      viewToCallRate,
      bookingSuccessRate,
    },
    topRooms,
    recommendations,
  });
});

module.exports = {
  getHostDashboard,
};
