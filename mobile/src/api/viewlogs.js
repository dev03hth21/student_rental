import api from '../services/api';

/**
 * ViewLogs API Services
 * Quản lý lịch sử xem phòng của student
 */

/**
 * Lấy danh sách phòng đã xem gần đây
 * @returns {Promise<Array>} Danh sách phòng đã xem
 */
export async function getRecentViews() {
  const response = await api.get('/users/me/recent-views');
  return response.data?.data?.views || response.data?.data || [];
}

/**
 * Ghi nhận lượt xem phòng (thường gọi khi vào RoomDetail)
 * @param {string} roomId - ID phòng
 * @returns {Promise<Object>} Kết quả ghi nhận
 */
export async function recordView(roomId) {
  const response = await api.post(`/rooms/${roomId}/view`);
  return response.data?.data || response.data;
}

export default {
  getRecentViews,
  recordView,
};
