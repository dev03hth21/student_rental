const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');
const { uploadToCloudinary } = require('../services/cloudinaryService');

const formatUserProfile = (user) => ({
  id: user._id,
  name: user.fullName || user.name,
  fullName: user.fullName || user.name,
  email: user.email,
  phone: user.phone,
  avatar: user.avatar,
  identityCardNumber: user.identityCardNumber,
  identityCardImage: user.identityCardImage,
  role: user.role,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const sendUserResponse = (res, message, user) =>
  res.json({
    success: true,
    message,
    data: formatUserProfile(user),
  });

const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
  }

  return sendUserResponse(res, 'Lấy thông tin người dùng thành công', user);
});

const updateCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
  }

  const updates = {};
  const nameInput = req.body?.name || req.body?.fullName;
  const phoneInput = req.body?.phone;
  const avatarInput = req.body?.avatar;
  const idCardNumberInput = req.body?.identityCardNumber || req.body?.idCardNumber;
  const idCardImageInput = req.body?.identityCardImage || req.body?.idCardImage;

  if (nameInput !== undefined) {
    const name = String(nameInput).trim();
    if (!name) {
      return res.status(400).json({ success: false, message: 'Tên không được để trống' });
    }
    if (name.length < 2) {
      return res.status(400).json({ success: false, message: 'Tên phải từ 2 ký tự trở lên' });
    }
    updates.fullName = name;
    updates.name = name; // Keep both for backward compatibility
  }

  if (phoneInput !== undefined) {
    const phone = String(phoneInput).trim();
    if (!phone) {
      return res.status(400).json({ success: false, message: 'Số điện thoại không được để trống' });
    }
    updates.phone = phone;
  }

  if (avatarInput !== undefined) {
    const avatar = typeof avatarInput === 'string' ? avatarInput.trim() : avatarInput;
    updates.avatar = avatar;
  }

  if (idCardNumberInput !== undefined) {
    const idCardNumber = String(idCardNumberInput).trim();
    updates.identityCardNumber = idCardNumber;
  }

  if (idCardImageInput !== undefined) {
    const idCardImage = typeof idCardImageInput === 'string' ? idCardImageInput.trim() : idCardImageInput;
    updates.identityCardImage = idCardImage;
  }

  if (!Object.keys(updates).length) {
    return res.status(400).json({ success: false, message: 'Không có dữ liệu cập nhật' });
  }

  if (updates.phone && updates.phone !== user.phone) {
    const existingPhone = await User.findOne({ phone: updates.phone, _id: { $ne: user._id } });
    if (existingPhone) {
      return res.status(400).json({ success: false, message: 'Số điện thoại đã được sử dụng' });
    }
  }

  Object.assign(user, updates);
  await user.save();

  return sendUserResponse(res, 'Cập nhật hồ sơ thành công', user);
});

const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Không có file ảnh được upload' });
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
  }

  try {
    const result = await uploadToCloudinary(req.file.buffer, 'avatars');
    user.avatar = result.secure_url;
    await user.save();

    return res.json({
      success: true,
      message: 'Upload avatar thành công',
      data: { avatar: result.secure_url },
    });
  } catch (error) {
    console.error('Avatar upload error:', error);
    return res.status(500).json({ success: false, message: 'Lỗi upload ảnh' });
  }
});

const uploadIdentityCard = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Không có file ảnh được upload' });
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
  }

  try {
    const result = await uploadToCloudinary(req.file.buffer, 'id-cards');
    user.identityCardImage = result.secure_url;
    await user.save();

    return res.json({
      success: true,
      message: 'Upload ảnh CCCD thành công',
      data: { identityCardImage: result.secure_url },
    });
  } catch (error) {
    console.error('Identity card upload error:', error);
    return res.status(500).json({ success: false, message: 'Lỗi upload ảnh' });
  }
});

const deleteMyAccount = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
  }

  // TODO: Implement full account deletion logic
  // - Delete user's favorites
  // - Delete user's view logs
  // - Delete user's call logs
  // - Delete user's rooms (if owner)
  // - Delete user account

  // For now, just return a success message indicating request received
  return res.json({
    success: true,
    message: 'Yêu cầu xóa tài khoản đã được ghi nhận. Chúng tôi sẽ xử lý trong vòng 24h.',
    data: {
      userId: user._id,
      requestedAt: new Date(),
    },
  });
});

module.exports = {
  getCurrentUser,
  updateCurrentUser,
  uploadAvatar,
  uploadIdentityCard,
  deleteMyAccount,
};
