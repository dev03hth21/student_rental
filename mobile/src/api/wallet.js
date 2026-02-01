import api from '../services/api';

/**
 * Lấy số dư tài khoản
 */
export async function getWalletBalance() {
  const response = await api.get('/wallet/balance');
  return response.data?.data || response.data;
}

/**
 * Nạp tiền vào tài khoản
 * @param {number} amount - Số tiền cần nạp (VND)
 */
export async function topUpWallet(amount) {
  const response = await api.post('/wallet/topup', { amount });
  return response.data?.data || response.data;
}

/**
 * Thanh toán phí đăng tin
 * @param {string} roomId - ID phòng cần thanh toán
 */
export async function payPostingFee(roomId) {
  const response = await api.post('/wallet/pay-posting-fee', { roomId });
  return response.data?.data || response.data;
}

/**
 * Lấy lịch sử giao dịch
 */
export async function getTransactions() {
  const response = await api.get('/wallet/transactions');
  return response.data?.data || response.data;
}
