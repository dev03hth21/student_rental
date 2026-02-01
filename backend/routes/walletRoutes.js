const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');
const {
  getBalance,
  topUp,
  payPostingFee,
  getTransactions,
} = require('../controllers/walletController');

// Tất cả routes yêu cầu đăng nhập với role owner
router.use(protect, authorize('owner'));

/**
 * @route   GET /api/wallet/balance
 * @desc    Lấy số dư tài khoản
 * @access  Private (owner)
 */
router.get('/balance', getBalance);

/**
 * @route   POST /api/wallet/topup
 * @desc    Nạp tiền vào tài khoản
 * @access  Private (owner)
 */
router.post('/topup', topUp);

/**
 * @route   POST /api/wallet/pay-posting-fee
 * @desc    Thanh toán phí đăng tin
 * @access  Private (owner)
 */
router.post('/pay-posting-fee', payPostingFee);

/**
 * @route   GET /api/wallet/transactions
 * @desc    Lấy lịch sử giao dịch
 * @access  Private (owner)
 */
router.get('/transactions', getTransactions);

module.exports = router;
