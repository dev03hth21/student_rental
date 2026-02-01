const mongoose = require('mongoose');
const Favorite = require('../models/Favorite');
const Room = require('../models/Room');
const ResponseHandler = require('../utils/responseHandler');
const asyncHandler = require('../utils/asyncHandler');

const validateRoomExists = async (roomId) => {
  const room = await Room.findById(roomId).select('_id');
  return Boolean(room);
};

const addFavorite = asyncHandler(async (req, res) => {
  const { roomId } = req.body || {};

  if (!roomId || !mongoose.isValidObjectId(roomId)) {
    return ResponseHandler.badRequest(res, 'roomId không hợp lệ');
  }

  const exists = await Favorite.findOne({ userId: req.user._id, roomId });
  if (exists) {
    return ResponseHandler.success(res, 'Phòng đã nằm trong danh sách yêu thích', {
      favorite: exists,
    });
  }

  const roomExists = await validateRoomExists(roomId);
  if (!roomExists) {
    return ResponseHandler.notFound(res, 'Không tìm thấy phòng');
  }

  const favorite = await Favorite.create({ userId: req.user._id, roomId });

  return ResponseHandler.created(res, 'Đã thêm vào danh sách yêu thích', {
    favorite,
  });
});

const removeFavorite = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return ResponseHandler.badRequest(res, 'ID yêu cầu không hợp lệ');
  }

  const favorite = await Favorite.findOne({ _id: id, userId: req.user._id });
  if (!favorite) {
    return ResponseHandler.notFound(res, 'Không tìm thấy mục yêu thích');
  }

  await favorite.deleteOne();
  return ResponseHandler.success(res, 'Đã xoá khỏi danh sách yêu thích');
});

const removeFavoriteByRoom = asyncHandler(async (req, res) => {
  const { roomId } = req.params;

  if (!mongoose.isValidObjectId(roomId)) {
    return ResponseHandler.badRequest(res, 'roomId không hợp lệ');
  }

  const favorite = await Favorite.findOne({ roomId, userId: req.user._id });
  if (!favorite) {
    return ResponseHandler.notFound(res, 'Không tìm thấy mục yêu thích');
  }

  await favorite.deleteOne();
  return ResponseHandler.success(res, 'Đã xoá khỏi danh sách yêu thích');
});

const getMyFavorites = asyncHandler(async (req, res) => {
  const favorites = await Favorite.find({ userId: req.user._id })
    .populate({
      path: 'roomId',
      select: '_id title description price area address images location status type contactPhone ownerId createdAt updatedAt'
    })
    .sort({ createdAt: -1 })
    .lean();

  // Transform to match frontend expectations
  const transformedFavorites = favorites
    .filter(fav => fav.roomId) // Filter out favorites with deleted rooms
    .map(fav => ({
      _id: fav._id,
      room: fav.roomId, // Expose room data
      createdAt: fav.createdAt,
    }));

  return ResponseHandler.success(res, 'Lấy danh sách yêu thích thành công', {
    data: transformedFavorites,
    total: transformedFavorites.length
  });
});

module.exports = {
  addFavorite,
  removeFavorite,
  removeFavoriteByRoom,
  getMyFavorites,
};
