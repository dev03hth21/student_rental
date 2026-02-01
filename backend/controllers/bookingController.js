const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Room = require('../models/Room');
const User = require('../models/User');

const buildFullAddress = (address = {}) => {
  if (address.fullAddress) return address.fullAddress;
  const parts = [address.street, address.ward, address.district, address.city].filter(Boolean);
  return parts.join(', ');
};

const normalizeListingFromBooking = (booking) => {
  const room = booking.room || {};
  const student = booking.student || {};
  const owner = booking.owner || booking.host || {};

  return {
    id: booking._id,
    status: booking.status,
    paymentStatus: booking.paymentStatus,
    depositAmount: booking.depositAmount,
    monthlyRent: booking.monthlyRent,
    updatedAt: booking.updatedAt,
    createdAt: booking.createdAt,
    checkInDate: booking.checkInDate,
    checkOutDate: booking.checkOutDate,
    createdAt: booking.createdAt,
    room: {
      id: room._id,
      title: room.title,
      approvalStatus: room.approvalStatus || 'pending',
      publishStatus: room.status || 'pending',
      views: room.views || 0,
      favorites: room.favorites || 0,
      address: buildFullAddress(room.address),
    },
    student: {
      id: student._id,
      fullName: student.fullName,
      phone: student.phone,
      email: student.email,
    },
    owner: {
      id: owner._id,
      fullName: owner.fullName,
      email: owner.email,
    },
  };
};

const buildListingStats = (listings = []) => {
  return listings.reduce(
    (acc, listing) => {
      acc.total += 1;
      const publishKey = listing.room?.publishStatus || 'unknown';
      acc.byPublishStatus[publishKey] = (acc.byPublishStatus[publishKey] || 0) + 1;
      const approvalKey = listing.room?.approvalStatus || 'pending';
      acc.byApprovalStatus[approvalKey] = (acc.byApprovalStatus[approvalKey] || 0) + 1;
      const bookingStatusKey = listing.status || 'pending';
      acc.byBookingStatus[bookingStatusKey] = (acc.byBookingStatus[bookingStatusKey] || 0) + 1;
      return acc;
    },
    { total: 0, byPublishStatus: {}, byApprovalStatus: {}, byBookingStatus: {} }
  );
};

exports.getOwnerListingsFromBookings = async (req, res) => {
  try {
    const { ownerId, ownerEmail, status } = req.query;

    if (!ownerId && !ownerEmail) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng truyền ownerId hoặc ownerEmail để truy vấn tin đăng.',
      });
    }

    let resolvedOwnerId = ownerId;

    if (resolvedOwnerId && !mongoose.Types.ObjectId.isValid(resolvedOwnerId)) {
      return res.status(400).json({
        success: false,
        message: 'ownerId không hợp lệ. Vui lòng cung cấp ObjectId hợp lệ hoặc dùng ownerEmail.',
      });
    }

    if (!resolvedOwnerId && ownerEmail) {
      const owner = await User.findOne({ email: ownerEmail }).select('_id');
      if (!owner) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy chủ trọ theo email đã cung cấp.' });
      }
      resolvedOwnerId = owner._id;
    }

    const filter = { owner: resolvedOwnerId };
    if (status) {
      filter.status = status;
    }

    const bookings = await Booking.find(filter)
      .populate({ path: 'room', model: Room })
      .populate({ path: 'student', model: User, select: 'fullName phone email avatar' })
      .sort({ updatedAt: -1 });

    const listings = bookings.map(normalizeListingFromBooking);
    const stats = buildListingStats(listings);

    return res.json({
      success: true,
      data: {
        count: listings.length,
        stats,
        listings,
      },
    });
  } catch (error) {
    console.error('getOwnerListingsFromBookings error:', error);
    return res.status(500).json({
      success: false,
      message: 'Không thể lấy danh sách tin đăng từ Booking.',
      error: error.message,
    });
  }
};

