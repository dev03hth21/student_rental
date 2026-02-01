const asyncHandler = require('../utils/asyncHandler');
const ResponseHandler = require('../utils/responseHandler');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

// Phí đăng tin (VND)
const POSTING_FEE = 50000;

/**
 * @desc    Lấy số dư tài khoản
 * @route   GET /api/wallet/balance
 * @access  Private (owner)
 */
const getBalance = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    return ResponseHandler.notFound(res, 'Không tìm thấy tài khoản');
  }

  return ResponseHandler.success(res, 'Lấy số dư thành công', {
    balance: user.balance || 0,
    postingFee: POSTING_FEE,
  });
});

/**
 * @desc    Nạp tiền vào tài khoản (giả lập)
 * @route   POST /api/wallet/topup
 * @access  Private (owner)
 */
const topUp = asyncHandler(async (req, res) => {
  const { amount } = req.body;

  if (!amount || typeof amount !== 'number' || amount <= 0) {
    return ResponseHandler.badRequest(res, 'Số tiền nạp phải là số dương');
  }

  if (amount < 10000) {
    return ResponseHandler.badRequest(res, 'Số tiền nạp tối thiểu là 10,000 VND');
  }

  if (amount > 10000000) {
    return ResponseHandler.badRequest(res, 'Số tiền nạp tối đa là 10,000,000 VND');
  }

  // Use findByIdAndUpdate to avoid validation issues with other required fields
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $inc: { balance: amount } },
    { new: true }
  );

  if (!user) {
    return ResponseHandler.notFound(res, 'Không tìm thấy tài khoản');
  }

  // Lưu lịch sử giao dịch
  await Transaction.create({
    userId: req.user._id,
    type: 'topup',
    amount: amount,
    balanceAfter: user.balance,
    description: `Nạp tiền vào tài khoản`,
  });

  return ResponseHandler.success(res, `Nạp ${amount.toLocaleString('vi-VN')} VND thành công`, {
    balance: user.balance,
    amountAdded: amount,
  });
});

/**
 * @desc    Thanh toán phí đăng tin
 * @route   POST /api/wallet/pay-posting-fee
 * @access  Private (owner)
 */
const payPostingFee = asyncHandler(async (req, res) => {
  const { roomId } = req.body;

  if (!roomId) {
    return ResponseHandler.badRequest(res, 'Thiếu roomId');
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    return ResponseHandler.notFound(res, 'Không tìm thấy tài khoản');
  }

  if ((user.balance || 0) < POSTING_FEE) {
    return ResponseHandler.badRequest(
      res,
      `Số dư không đủ. Bạn cần ${POSTING_FEE.toLocaleString('vi-VN')} VND để đăng tin. Số dư hiện tại: ${(user.balance || 0).toLocaleString('vi-VN')} VND`
    );
  }

  // Use findByIdAndUpdate to avoid validation issues
  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    { $inc: { balance: -POSTING_FEE } },
    { new: true }
  );

  // Lưu lịch sử giao dịch
  await Transaction.create({
    userId: req.user._id,
    type: 'posting_fee',
    amount: -POSTING_FEE,
    balanceAfter: updatedUser.balance,
    description: `Phí đăng tin`,
    roomId: roomId,
  });

  return ResponseHandler.success(res, 'Thanh toán phí đăng tin thành công', {
    balance: updatedUser.balance,
    amountDeducted: POSTING_FEE,
    roomId,
  });
});

/**
 * @desc    Lấy lịch sử giao dịch
 * @route   GET /api/wallet/transactions
 * @access  Private (owner)
 */
const getTransactions = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const transactions = await Transaction.find({ userId: req.user._id })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .populate('roomId', 'title');

  const total = await Transaction.countDocuments({ userId: req.user._id });

  const formattedTransactions = transactions.map((t) => ({
    id: t._id,
    type: t.type,
    amount: t.amount,
    balanceAfter: t.balanceAfter,
    description: t.description,
    roomTitle: t.roomId?.title || null,
    createdAt: t.createdAt,
    status: t.status,
  }));

  return ResponseHandler.success(res, 'Lấy lịch sử giao dịch thành công', {
    transactions: formattedTransactions,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
    },
  });
});

module.exports = {
  getBalance,
  topUp,
  payPostingFee,
  getTransactions,
  POSTING_FEE,
};
