const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');
const PasswordResetToken = require('../models/PasswordResetToken');
const { sendPasswordResetEmail } = require('../utils/emailService');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const RESET_TOKEN_EXPIRES_MS = Number(process.env.RESET_TOKEN_EXPIRES_MS || 60 * 60 * 1000);

const signToken = (userId) =>
  jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

const register = asyncHandler(async (req, res) => {
  // Chấp nhận cả name lẫn fullName từ frontend
  const name = req.body.name || req.body.fullName;
  const { email, password, phone, role = 'student' } = req.body;

  if (!name || !email || !password || !phone) {
    return res.status(400).json({ success: false, message: 'Thiếu thông tin bắt buộc' });
  }

  const normalizedRole = ['student', 'owner'].includes(role) ? role : 'student';

  const existingUser = await User.findOne({
    $or: [{ email }, { phone }],
  });

  if (existingUser) {
    return res.status(409).json({ success: false, message: 'Email hoặc số điện thoại đã tồn tại' });
  }

  const user = await User.create({
    name,
    email,
    password,
    phone,
    role: normalizedRole,
  });

  const token = signToken(user._id);

  res.status(201).json({
    success: true,
    message: 'Đăng ký thành công',
    data: {
      user: user.toJSON(),
      tokens: { accessToken: token },
      expiresIn: JWT_EXPIRES_IN,
    }
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email và mật khẩu là bắt buộc' });
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không đúng' });
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không đúng' });
  }

  // Chặn tài khoản bị khóa
  if (user.isActive === false) {
    return res.status(403).json({ success: false, message: 'Tài khoản đã bị khóa. Vui lòng liên hệ admin.' });
  }

  const token = signToken(user._id);

  res.json({
    success: true,
    message: 'Đăng nhập thành công',
    data: {
      user: user.toJSON(),
      tokens: { accessToken: token },
      expiresIn: JWT_EXPIRES_IN,
    }
  });
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: 'Email là bắt buộc' });
  }

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({ success: false, message: 'Email không tồn tại trong hệ thống' });
  }

  await PasswordResetToken.deleteMany({ user: user._id });

  const sixDigitCode = Math.floor(100000 + Math.random() * 900000).toString();
  const tokenHash = crypto.createHash('sha256').update(sixDigitCode).digest('hex');
  const expiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRES_MS);

  await PasswordResetToken.create({ user: user._id, tokenHash, expiresAt });

  await sendPasswordResetEmail(user.email, sixDigitCode, user.fullName || user.name || '');

  return res.json({
    success: true,
    message: 'Nếu email tồn tại, mã đặt lại đã được gửi',
  });
});

const resetPassword = asyncHandler(async (req, res) => {
  const { token, password, email } = req.body;

  if (!token || !password || !email) {
    return res.status(400).json({ success: false, message: 'Email, mã và mật khẩu mới là bắt buộc' });
  }

  const cleanToken = String(token).trim();

  if (typeof cleanToken !== 'string' || cleanToken.length !== 6) {
    return res.status(400).json({ success: false, message: 'Mã không hợp lệ' });
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return res.status(404).json({ success: false, message: 'Email không tồn tại trong hệ thống' });
  }

  const tokenHash = crypto.createHash('sha256').update(cleanToken).digest('hex');

  const resetDoc = await PasswordResetToken.findOne({
    user: user._id,
    tokenHash,
    expiresAt: { $gt: new Date() },
  });

  if (!resetDoc) {
    return res.status(400).json({ success: false, message: 'Mã không hợp lệ hoặc đã hết hạn' });
  }

  user.password = password;
  await user.save();
  await PasswordResetToken.deleteMany({ user: user._id });

  return res.json({ success: true, message: 'Đặt lại mật khẩu thành công' });
});

module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword,
};
